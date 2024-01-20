import React, { useEffect } from "react";
import Button from "@mui/material/Button";
import { Stack } from "@mui/material";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { useNavigate } from "react-router-dom";
import Link from "@mui/material/Link";
const Home = ({ setUser }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem("user");
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON);
      setUser(user);
      if (user.user_type === "manager") {
        navigate("/");
      } else {
        navigate("/consent-requests");
      }
    }
  }, [navigate, setUser]);

  return (
    <Container maxWidth='xl'>
      <Stack
        spacing={2}
        padding={2}
        justifyContent='center'
        alignItems='center'
      >
        <Typography sx={{ textAlign: "center" }} variant='h4'>
          Welcome to Safeplay, the most secure platform for streaming your 
    football matches.
        </Typography>
        <img
          alt='logo'
          align='center'
          src='logo512primary.png'
          height='300vh'
        />
        <Typography sx={{ textAlign: "center" }} variant='body'>
          Register as player or a manager below:
        </Typography>
        <Button onClick={() => navigate("/signup")} variant='contained'>
          Click here to sign up
        </Button>
        <Link
          component='button'
          underline='hover'
          onClick={() => navigate("/login")}
        >
          Already registered? Click here to sign in!
        </Link>
      </Stack>
    </Container>
  );
};

export default Home;
