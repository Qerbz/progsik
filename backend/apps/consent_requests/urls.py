from django.urls import path
from .views import UserConsentRequestViewSet, ApproveRequestView, RemoveApprovalView, PastConsentRequestsView

urlpatterns = [
    path('consent-requests/', UserConsentRequestViewSet.as_view({'get': 'list'}), name='consent-request-list'),
    path('consent-requests/approve/', ApproveRequestView.as_view(), name='approve_request'),
    path('consent-requests/remove-approval/', RemoveApprovalView.as_view(), name='remove_approval'),
    path('consent-requests/past-requests/', PastConsentRequestsView.as_view(), name='past_requests'),
]

