import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";
import Container from "@mui/material/Container";
import AppBar from "@mui/material/AppBar";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Toolbar from "@mui/material/Toolbar";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import Avatar from "@mui/material/Avatar";
import LoginForm from "./components/LoginForm";
import Home from "./components/Home";
import SignupForm from "./components/SignupForm";
import Matches from "./components/Matches";
import CreateMatch from "./components/CreateMatch";
import ConsentRequests from "./components/ConsentRequests";
import ResetPassword from "./components/ResetPassword";
import Verified from "./components/Verified";
import Object from "./components/Object";
import TeamCreation from "./components/TeamCreation";
import PrivacyNotice from './components/PrivacyNotice';
import Invalid from './components/Invalid';
import AuthService from "./services/auth";
import Expired from "./components/Expired";

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant='filled' {...props} />;
});

const App = () => {
  const [user, setUser] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarText, setSnackbarText] = useState("");

  const signOut = () => {
    AuthService.logout();
    setUser(null);
  };

  const handleClose = (_, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem("user");
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON);
      setUser(user);
    }
  }, []);

  const updateUser = (newUser) => {
    setUser(newUser);
    window.localStorage.setItem("user", JSON.stringify(newUser));
  };

  const renderHomeOrRedirect = () => {
    if (!user) {
      return <Home setUser={setUser} />;
    } else if (user.user_type === 'manager') {
      return <Navigate to="/matches" />;
    } else if (user.user_type === 'player' || user.user_type === 'guardian') {
      return <Navigate to="/consent-requests" />;
    } else {
      return <Home setUser={setUser} />;
    }
  };



  return (
    <Router>
      <AppBar position='static'>
        <Toolbar>
          <Grid container>
            <Grid item>
              <Button size='small' component={Link} to='/'>
                <Avatar alt='Home' src='favicon.ico' />
              </Button>
            </Grid>
            <Grid item marginTop={0.8}>
              <Button color='inherit' component={Link} to='/object'>
                Object
              </Button>
            </Grid>
            {user && (
              <Grid item marginTop={0.8}>
                <Button color='inherit' component={Link} to='/privacy-notice'>
                  Privacy Notice
                </Button>
              </Grid>
            )}
            {user?.user_type === 'manager' ? (
              <>
                {user.team_id ? (
                  <>
                    <Grid item marginTop={0.8}>
                      <Button color='inherit' component={Link} to='/matches'>
                        Matches
                      </Button>
                    </Grid>
                    <Grid item marginTop={0.8}>
                      <Button color='inherit' component={Link} to='/create-match'>
                        Create New Match
                      </Button>
                    </Grid>
                  </>
                ) : (
                  <Grid item marginTop={0.8}>
                    <Button color='inherit' component={Link} to='/create-team'>
                      Create New Team
                    </Button>
                  </Grid>
                )}
              </>
            ) : null}

            {user?.user_type === 'guardian' || user?.user_type === 'player' ? (
              <Grid item marginTop={0.8}>
                <Button color='inherit' component={Link} to='/consent-requests'>
                  Consent Requests
                </Button>
              </Grid>
            ) : null}
          </Grid>
          <Grid container justifyContent='flex-end'>
            <Grid item>
              {user ? (
                <Button
                  color='inherit'
                  onClick={signOut}
                  component={Link}
                  to='/login'
                >
                  Sign Out
                </Button>
              ) : (
                <div>
                  <Button color='inherit' component={Link} to='/login'>
                    Sign In
                  </Button>
                  <Button
                    variant='outlined'
                    color='inherit'
                    component={Link}
                    to='/signup'
                  >
                    Sign up
                  </Button>
                </div>
              )}
            </Grid>
          </Grid>
        </Toolbar>
      </AppBar>
      <Container maxWidth='xl'>
        <Routes>
          <Route
            path='/matches'
            element={user?.user_type === 'manager' ? <Matches user={user} /> : <Navigate to="/" />}
          />
          <Route
            path='/create-match'
            element={user?.user_type === 'manager' ? <CreateMatch user={user} /> : <Navigate to="/" />}
          />
          <Route
            path='/consent-requests'
            element={(user?.user_type === 'player' || user?.user_type === 'guardian') ? <ConsentRequests user={user} /> : <Navigate to="/" />} />

          {!user && (
            <>
              <Route
                path='/login'
                element={
                  <LoginForm
                    setAppSnackbarOpen={setSnackbarOpen}
                    setAppSnackbarText={setSnackbarText}
                    setUser={setUser}
                  />
                }
              />
              <Route
                path='/signup'
                element={
                  <SignupForm
                    setAppSnackbarOpen={setSnackbarOpen}
                    setAppSnackbarText={setSnackbarText}
                  />
                }
              />
              <Route path='/verified' element={<Verified />} />
              <Route path='/expired' element={<Expired/>} />
              <Route path='/new_password' element={<ResetPassword />} />
            </>
          )}

          <Route path='/object' element={<Object />} />
          <Route path='/privacy-notice' element={<PrivacyNotice />} />
          <Route path='/invalid' element={<Invalid />} />
          <Route
            path='/create-team'
            element={user?.user_type === 'manager' ? <TeamCreation user={user} updateUser={updateUser} /> : <Navigate to="/" />}
          />

          <Route path='/' element={renderHomeOrRedirect()} />
          <Route path='*' element={renderHomeOrRedirect()} />
        </Routes>
        <Snackbar
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          open={snackbarOpen}
          autoHideDuration={5000}
          onClose={handleClose}
        >
          <Alert
            onClose={handleClose}
            severity='success'
            sx={{ width: "100%" }}
          >
            {snackbarText}
          </Alert>
        </Snackbar>
      </Container>
    </Router>
  );
};

export default App;
