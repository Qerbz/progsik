import {
  Card,
  CardContent,
  Typography,
  Divider,
  Switch,
  Stack,
} from "@mui/material";
import React from "react";
import ConsentRequestsService from "../services/consentRequests";

const ConsentRequestCard = ({ consentRequest, update, OpenSnackbar }) => {

  const handleApprovalChange = (event) => {
    const newApprovalStatus = event.target.checked ? "accepted" : "declined";
    const user = JSON.parse(window.localStorage.getItem("user"))
    const userType = user.user_type;
    const userBirthday = new Date(user.birthdate);
    const age = calculateAge(userBirthday);



    if (newApprovalStatus === "accepted") {
      console.log(age)
      if ((userType === "player" && age < 15)) {
        OpenSnackbar("Only guardians can approve consent requests for players under 15 years old.", "error");
        return;
      }
      approveConsentRequest(consentRequest.request_id);
    } else {
      removeApproval(consentRequest.request_id);
    }
  };

  function calculateAge(birthday) {
    const today = new Date();
    const birthDate = new Date(birthday);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();

    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  }




  const approveConsentRequest = (request_id) => {
    ConsentRequestsService.approveRequest({
      request_id: request_id,
    })
      .then(() => {
        update();
        OpenSnackbar("Consent request approved", "success");
      })
      .catch((error) => {
        if (error.response.status === 403) {
          const errorCode = error.response.data.error_code;
          if (errorCode === 'not_guardian') {
            OpenSnackbar("Only guardian can approve this request.", "error");
          } else {
            OpenSnackbar("You do not have permission to approve this request.", "error");
          }
        } else {
          console.log(error);
        }
      });
  };

  const removeApproval = (request_id) => {
    ConsentRequestsService.removeApproval({
      request_id: request_id,
    })
      .then(() => {
        update();
        OpenSnackbar("Approval removed", "success");
      })
      .catch((error) => {
        if (error.response.status === 403) {
          const errorCode = error.response.data.error_code;
          if (errorCode === 'not_guardian') {
            OpenSnackbar("Only guardian can approve this request.", "error");
          } else {
            OpenSnackbar("You do not have permission to remove approval for this request.", "error");
          }
        } else {
          console.log(error);
        }
      });
  };

  return (
    <Card
      sx={{
        position: 'relative',
        maxHeight: 400,
        minHeight: 200,
        width: 250,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <CardContent>
        <Typography variant='h5' component='div' gutterBottom sx={{ fontWeight: 'bold', textAlign: 'center' }}>
          {consentRequest.match.team1.name} vs {consentRequest.match.team2.name}
        </Typography>

        <Typography variant='body2' color="text.secondary" gutterBottom>
          {new Date(consentRequest.match.date_time).toLocaleDateString()} at {new Date(consentRequest.match.date_time).toLocaleTimeString()}
        </Typography>

        <Divider sx={{ my: 1 }} />

        <Typography component="div" variant='body2' color="text.secondary" gutterBottom>
          Player: {consentRequest.user.first_name} {consentRequest.user.last_name}
        </Typography>

        <Typography component="div" variant='body2' color="text.secondary" gutterBottom>
          <div dangerouslySetInnerHTML={{ __html: `Description: ${consentRequest.match.description}` | safe}}></div>
        </Typography>

        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography
            variant='body2'
            color={
              consentRequest.request_status === "accepted" ? 'success.main' :
                consentRequest.request_status === "pending" ? 'warning.main' :
                  'error.main'
            }
            sx={{ mt: 1 }}
          >
            {consentRequest.request_status.charAt(0).toUpperCase() + consentRequest.request_status.slice(1)}
          </Typography>
          <Switch
            checked={consentRequest.request_status === "accepted"}
            onChange={handleApprovalChange}
            inputProps={{ 'aria-label': 'controlled' }}
          />
        </Stack>
      </CardContent>
    </Card>
  );
};

export default ConsentRequestCard;

