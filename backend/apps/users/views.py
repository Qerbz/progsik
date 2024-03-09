from django.contrib.auth import get_user_model
from rest_framework import viewsets, status, generics
from apps.users.serializers import UserSerializer, RegisterSerializer, ResetPasswordSerializer, LoginSerializer, SendNewEmailSerializer,  SetNewPasswordSerializer, AssignTeamSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken
from rest_framework.response import Response
from django.shortcuts import redirect
from django.contrib.sites.shortcuts import get_current_site
from django.conf import settings
from django.core.mail import EmailMessage
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.urls import reverse_lazy
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.encoding import force_bytes, force_str
from datetime import datetime, timedelta, timezone
from rest_framework.decorators import action


class UserViewSet(viewsets.ModelViewSet):
    serializer_class = UserSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return get_user_model().objects.all()
        elif user.user_type == 'guardian':
            return get_user_model().objects.filter(guardian=user)
        else:
            return get_user_model().objects.filter(pk=user.id)

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def set_team(self, request):
        user = request.user
        # Check if the user already has a team assigned
        if user.team:
            return Response({"error": "Team already set"}, status=status.HTTP_400_BAD_REQUEST)

        serializer = AssignTeamSerializer(user, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"status": "team set"})
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class RegistrationViewSet(viewsets.ModelViewSet, TokenObtainPairView):
    serializer_class = RegisterSerializer
    permission_classes = (AllowAny,)
    http_method_names = ['post']

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)

        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        res = {
            "refresh": str(refresh),
            "access": str(refresh.access_token),
        }

        return Response({
            "user": serializer.data,
            "refresh": res["refresh"],
            "token": res["access"]
        }, status=status.HTTP_201_CREATED)


class LoginViewSet(viewsets.ModelViewSet, TokenObtainPairView):
    serializer_class = LoginSerializer
    permission_classes = (AllowAny,)
    http_method_names = ['post']

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)

        try:
            serializer.is_valid(raise_exception=True)
        except TokenError as e:
            raise InvalidToken(e.args[0])

        return Response(serializer.validated_data, status=status.HTTP_200_OK)


class RefreshViewSet(viewsets.ViewSet, TokenRefreshView):
    permission_classes = (AllowAny,)
    http_method_names = ['post']

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)

        try:
            serializer.is_valid(raise_exception=True)
        except TokenError as e:
            raise InvalidToken(e.args[0])

        return Response(serializer.validated_data, status=status.HTTP_200_OK)


class VerificationView(generics.GenericAPIView):
    def get(self, request, uid):
        verified_url = settings.URL + "/verified"
        invalid_url = settings.URL + "/invalid"
        expired_url = settings.URL + "/expired"

        try:
            username = urlsafe_base64_decode(uid).decode()
            user = get_user_model().objects.filter(username=username).first()

            # Check if the link has expired
            if user.verify_email_timer and (datetime.now(timezone.utc) - user.verify_email_timer) > timedelta(minutes=10):
                return redirect(expired_url)  # Redirect to expired link page if it is expired

            user.is_active = True
            user.verify_email_timer = None  # Clear the timer after successful activation of account
            user.save()
            return redirect(verified_url)

        except Exception as ex:
            pass

        return redirect(invalid_url)



class PasswordResetEmailView(generics.GenericAPIView):
    serializer_class = ResetPasswordSerializer

    def post(self, request):
        if request.data.get("email") and request.data.get("username"):
            email = request.data["email"]
            username = request.data["username"]

            if get_user_model().objects.filter(email=email, username=username).exists():
                user = get_user_model().objects.get(email=email, username=username)

                uid = urlsafe_base64_encode(force_bytes(user.pk))
                domain = get_current_site(request).domain
                token = PasswordResetTokenGenerator().make_token(user)
                link = reverse_lazy(
                    'password-reset', kwargs={"uidb64": uid, "token": token})

                url = f"{settings.PROTOCOL}://{domain}{link}"
                email_subject = "Password reset"
                mail = EmailMessage(
                    email_subject,
                    url,
                    None,
                    [email],
                )
                mail.send(fail_silently=False)
        return Response({'success': "If the user exists, you will shortly receive a link to reset your password."}, status=status.HTTP_200_OK)


class ActivationLinkEmailView(generics.GenericAPIView):
    serializer_class = SendNewEmailSerializer

    def post(self, request):
        if request.data.get("email") and request.data.get("username"):
            email = request.data["email"]
            username = request.data["username"]

            user = get_user_model().objects.get(email=email, username=username)
            user.verify_email_timer = datetime.now(timezone.utc)
            user.save()

            if user.is_active != True:
                email_subject = "Activate your account"
                uid = urlsafe_base64_encode(user.username.encode())
                domain = get_current_site(request).domain
                link = reverse_lazy(
                    'verify-email', kwargs={"uid": uid})

                url = f"{settings.PROTOCOL}://{domain}{link}"

                mail = EmailMessage(
                    email_subject,
                    url,
                    None,
                    [email],
                )
                mail.send(fail_silently=False)

                # Set the verification-timer to the current time
                user.verify_email_timer = datetime.now(timezone.utc)
                user.save()
        return Response({'success': "If the user is not activated, you will shortly receive a link to reset your password."}, status=status.HTTP_200_OK)


class ResetPasswordView(generics.GenericAPIView):
    def get(self, request, uidb64, token):

        new_password_url = settings.URL + "/new_password"
        invalid_url = settings.URL + "/invalid"
        try:
            id = force_str(urlsafe_base64_decode(uidb64))
            user = get_user_model().objects.get(pk=id)

            if not PasswordResetTokenGenerator().check_token(user, token):  # Verify that the token is valid for the user
                return redirect(invalid_url)

            return redirect(f'{new_password_url}?uid={uidb64}&token={token}')

        except Exception as ex:
            pass

        return redirect(invalid_url)


class SetNewPasswordView(generics.GenericAPIView):
    serializer_class = SetNewPasswordSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response({'success': True, 'message': 'Password reset success'}, status=status.HTTP_200_OK)
