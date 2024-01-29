import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { Stack } from "@mui/material";
import Container from "@mui/material/Container";
import AuthService from "../services/auth";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import Link from "@mui/material/Link";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Box from "@mui/material/Box";

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant='filled' {...props} />;
});

const SignupForm = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [guardianUsername, setGuardianUsername] = useState("");
  const [showGuardianField, setShowGuardianField] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); // New state variable for confirm password
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarText, setSnackbarText] = useState("");
  const [snackbarType, setSnackbarType] = useState("success");
  const [birthdate, setBirthdate] = React.useState(new Date().toISOString().split('T')[0]);
  const [userType, setUserType] = React.useState("manager");
  const [currentTeam, setCurrentTeam] = useState("");
  const [teams, setTeams] = useState([]);

  const calculateAge = (birthdate) => {
    const today = new Date();
    const birthDate = new Date(birthdate);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  useEffect(() => {
    AuthService.fetchTeams()
      .then(response => {
        setTeams(response);
      })
      .catch(error => {
        console.error("Error fetching teams:", error);
      });
  }, []);

  useEffect(() => {
    const age = calculateAge(birthdate);
    setShowGuardianField(age < 15 && userType === "player");
  }, [birthdate, userType]);

  const handleChangeUserType = (event) => {
    setUserType(event.target.value);
  };

  const handleClose = (_, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };

  const handleChangeAccountBirth = (event) => {
    setBirthdate(event.target.value.split('T')[0]);
  };

  const handleTeamChange = (event) => {
    setCurrentTeam(event.target.value);
  };

  const onSubmit = (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setSnackbarText("Passwords do not match.");
      setSnackbarType("error");
      setSnackbarOpen(true);
      return;
    }

    const request = {
      username: username,
      first_name: firstName,
      last_name: lastName,
      email: email,
      password: password,
      user_type: userType,
      birthdate: birthdate,
      guardian_username: showGuardianField ? guardianUsername : undefined,
    };

    if (userType !== 'manager') {
      request.team_id = currentTeam;
    }

    AuthService.createUser(request)
      .then(() => {
        console.log("User registered successfully");
        setSnackbarText(
          "If the email exists, an activation link has been sent."
        );
        setSnackbarType("success");
        setSnackbarOpen(true);
        setUsername("");
        setEmail("");
        setPassword("");
      })
      .catch((err) => {
        let msg = "An error occurred during registration.";
        let type = "error";

        if (err.response && err.response.data) {
          msg = Object.values(err.response.data).join(" ");
        }

        setSnackbarText(msg);
        setSnackbarType(type);
        setSnackbarOpen(true);
      });
  };

  return (
    <>
      <Container maxWidth='xs'>
        <form onSubmit={onSubmit}>
          <Stack spacing={2} padding={2}>
            <img alt='logo' src='logo512primary.png' />

            <FormControl>
              <FormLabel id="user-type-radio-group-label">User Type</FormLabel>
              <RadioGroup
                row
                aria-labelledby="user-type-radio-group-label"
                name="user-type-radio-group"
                value={userType}
                onChange={handleChangeUserType}
              >
                <FormControlLabel value="manager" control={<Radio />} label="Manager" />
                <FormControlLabel value="guardian" control={<Radio />} label="Guardian" />
                <FormControlLabel value="player" control={<Radio />} label="Player" />
              </RadioGroup>
            </FormControl>
            {userType !== 'manager' && (
              <FormControl>
                <FormLabel>Team</FormLabel>
                <Box display="flex" alignItems="center">
                  <Select
                    value={currentTeam}
                    onChange={handleTeamChange}
                    fullWidth
                    style={{ flexGrow: 1 }}
                  >
                    {teams.map((teamItem) => (
                      <MenuItem key={teamItem.id} value={teamItem.id}>
                        {teamItem.name}
                      </MenuItem>
                    ))}
                  </Select>
                </Box>
              </FormControl>
            )}
            {userType === 'player' && (
              <>
                <TextField
                  label="Birthday"
                  type="date"
                  onChange={handleChangeAccountBirth}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  value={birthdate}
                  required
                />
                {showGuardianField && (
                  <TextField
                    label="Guardian's Username"
                    onInput={(e) => setGuardianUsername(e.target.value)}
                    value={guardianUsername}
                  />
                )}
              </>
            )}
            <TextField
              required
              label='First Name'
              onInput={(e) => setFirstName(e.target.value)}
              value={firstName}
            />
            <TextField
              required
              label='Last Name'
              onInput={(e) => setLastName(e.target.value)}
              value={lastName}
            />
            <TextField
              required
              label='Username'
              onInput={(e) => setUsername(e.target.value)}
              value={username}
            />
            <TextField
              required
              label='E-mail'
              onInput={(e) => setEmail(e.target.value)}
              value={email}
              type='email'
            />

            <TextField
              required
              label='Password'
              type='password'
              onInput={(e) => setPassword(e.target.value)}
              value={password}
            />
            <TextField
              required
              label='Confirm Password'
              type='password'
              onInput={(e) => setConfirmPassword(e.target.value)}
              value={confirmPassword}
            />
            <Button variant='contained' type='submit'>
              Sign Up
            </Button>
            <Link
              component='button'
              underline='hover'
              onClick={() => navigate("/login")}
            >
              Already registered? Click here to sign in!
            </Link>
          </Stack>
        </form>
        <Snackbar
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          open={snackbarOpen}
          autoHideDuration={5000}
          onClose={handleClose}
        >
          <Alert onClose={handleClose} severity={snackbarType} sx={{ width: "100%" }}>
            {snackbarText}
          </Alert>
        </Snackbar>
      </Container>
    </>
  );
};

export default SignupForm;
