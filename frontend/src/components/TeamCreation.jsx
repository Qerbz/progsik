import React, { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { Typography } from '@mui/material';
import AuthService from '../services/auth';
import { useNavigate } from 'react-router-dom';

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant='filled' {...props} />;
});

const TeamCreation = ({ user, updateUser }) => {
  const navigate = useNavigate(); 

  const [newTeamName, setNewTeamName] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarType, setSnackbarType] = useState('success');
  const [teams, setTeams] = useState([]);
  const [isTeamNameEmpty, setIsTeamNameEmpty] = useState(false); // New state variable for tracking empty team name

  const fetchTeams = () => {
    AuthService.fetchTeams()
      .then(data => {
        setTeams(data);
      })
      .catch(err => {
        console.error('Error fetching teams:', err);
      });
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const handleAddTeam = () => {
    if (!newTeamName.trim()) {
      setIsTeamNameEmpty(true);
      setSnackbarMessage('Fill in required fields');
      setSnackbarType('error');
      setSnackbarOpen(true);
      return;
    }

    const request = {
      name: newTeamName,
    };

    AuthService.createTeam(request)
      .then(() => {
        setNewTeamName('');
        fetchTeams(); // Refetch teams
        setSnackbarMessage('Team created successfully!');
        setSnackbarType('success');
        setSnackbarOpen(true);
      })
      .catch((err) => {
        console.log(err);
        setSnackbarMessage('Error creating team.');
        setSnackbarType('error');
        setSnackbarOpen(true);
      });
  };

  const handleSetTeam = (teamId) => {
    AuthService.setTeamForCurrentUser(teamId)
      .then(() => {
        const updatedUser = { ...user, team_id: teamId };
        setSnackbarMessage('Team set successfully!');
        setSnackbarType('success');
        setSnackbarOpen(true);
        updateUser(updatedUser);
        navigate('/matches');
      })
      .catch((err) => {
        console.error(err);
        setSnackbarMessage('Error setting team.');
        setSnackbarType('error');
        setSnackbarOpen(true);
      });
  };


  const handleCloseSnackbar = (_, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  if (user === null) {
    return (
      <div>
        <Typography variant="h6" gutterBottom>
          Only managers can set team after creating user.
        </Typography>
      </div>
    );
  }

  if (user.user_type === 'manager') {
    console.log(user);
    if (user.team_id) {
      return (
        <div>
          <Typography variant="h6" gutterBottom>
            Team can only be set once.
          </Typography>
        </div>
      );
    } else {
      return (
        <div>
          <TableContainer component={Paper} style={{ marginTop: '20px', marginBottom: '20px' }}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell style={{ fontWeight: 'bold' }}>Team Name</TableCell>
                  <TableCell style={{ fontWeight: 'bold' }}>Action</TableCell> {/* Add this line */}
                </TableRow>
              </TableHead>
              <TableBody>
                {teams.map((team, index) => (
                  <TableRow
                    key={index}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      {team.name}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleSetTeam(team.id)}
                      >
                        Set as My Team
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Typography variant="h4" gutterBottom>
            Create a New Team
          </Typography>
          <TextField
            autoFocus
            margin='dense'
            id='teamName'
            label='Team Name'
            value={newTeamName}
            onChange={(e) => {
              setNewTeamName(e.target.value);
              setIsTeamNameEmpty(false);
            }}
            fullWidth
            variant='standard'
            required
            error={isTeamNameEmpty}
            helperText={isTeamNameEmpty ? "Team name is required" : ""}
          />
          <Button onClick={handleAddTeam} color="primary">
            Add Team
          </Button>
          <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleCloseSnackbar}>
            <Alert onClose={handleCloseSnackbar} severity={snackbarType} sx={{ width: '100%' }}>
              {snackbarMessage}
            </Alert>
          </Snackbar>
        </div>
      );
    }
  }
};
export default TeamCreation;

