import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
import { useNavigate } from "react-router-dom";
import { Stack } from "@mui/material";

const Expired = () => {
  const navigate = useNavigate();
  return (
    <Container>
      <Stack justifyContent='center' spacing={2} marginTop={3}>
        <Typography sx={{ textAlign: "center" }} variant='h2'>
          The email activation link has expired!
        </Typography>
        <Typography sx={{ textAlign: "center" }} variant='h5'>
          Please try signing up again.
        </Typography>
        <Link
          component='button'
          underline='hover'
          onClick={() => navigate("/signup")}
        >
          Click here to go to the signup page
        </Link>
      </Stack>
    </Container>
  );
};
export default Expired;
