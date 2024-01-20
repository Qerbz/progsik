import React, { useState, useEffect } from 'react';
import Snackbar from "@mui/material/Snackbar";
import dayjs from 'dayjs';
import {
  Container,
  Typography,
  TextField,
  Button,
  MenuItem,
  Grid,
  Select,
  InputLabel,
  FormControl
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import MatchesService from '../services/matches';
import AuthService from '../services/auth';
import FieldsService from '../services/fields';

const CreateMatch = () => {
  const [teams, setTeams] = useState([]);
  const [unavailableTimeSlots, setUnavailableTimeSlots] = useState([]);
  const [formData, setFormData] = useState({
    team1: '',
    team2: '',
    field: '',
    description: '',
    date: '',
    time: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarStyle, setSnackbarStyle] = useState({});

  const [fields, setFields] = useState([]); 

  const [validationErrors, setValidationErrors] = useState({});

  const validateForm = () => {
    const errors = {};
    if (!formData.team1) errors.team1 = 'Team 1 is required';
    if (!formData.team2) errors.team2 = 'Team 2 is required';
    if (!formData.field) errors.field = 'Field is required';
    if (!formData.description) errors.description = 'Description is required';
    if (!formData.date) errors.date = 'Date is required';
    if (!formData.time) errors.time = 'Time is required';

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };


  useEffect(() => {
    AuthService.fetchTeams()
      .then((response) => {
        setTeams(response);
      })
      .catch((error) => {
        console.error('Error fetching teams:', error);
      });

    FieldsService.FetchAllFields()
      .then((response) => {
        setFields(response); // Set the fields data
      })
      .catch((error) => {
        console.error('Error fetching fields:', error);
      });
  }, []);

  useEffect(() => {
    if (formData.field && formData.date) {
      FieldsService.FetchAvailableTimeSlots(formData.field, formData.date, "GMT")
        .then((response) => {
          const parsedResponse = response.map((timeSlot) => ({
            ...timeSlot,
            start_time: dayjs(timeSlot.start_time),
            end_time: dayjs(timeSlot.end_time),
          }));
          setUnavailableTimeSlots(parsedResponse);
        })
        .catch((error) => {
          console.error('Error fetching available time slots:', error);
        });
    }
  }, [formData.field, formData.date, formData.timezone]);

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!validateForm()) return;

    const dateTime = `${formData.date.format('YYYY-MM-DD')}T${formData.time}:00`;

    const dataToSubmit = {
      team1: formData.team1,
      team2: formData.team2,
      field: formData.field,
      description: formData.description,
      date_time: dateTime,
      timezone: formData.timezone,
    };

    if (formData.team1 === formData.team2) {
        setSnackbarMessage('Use two different teams.');
        setSnackbarStyle({ backgroundColor: 'red' });
        setSnackbarOpen(true);
      return
    }

    MatchesService.AddMatch(dataToSubmit)
      .then((response) => {
        console.log('Match added successfully:', response);
        // Update snackbar for success
        setSnackbarMessage('Match added successfully');
        setSnackbarStyle({ backgroundColor: 'green' });
        setSnackbarOpen(true);
      })
      .catch((error) => {
        console.error('Error adding match:', error);
        // Update snackbar for failure
        setSnackbarMessage('Request failed');
        setSnackbarStyle({ backgroundColor: 'red' });
        setSnackbarOpen(true);
      });
  };

  const handleTimeChange = (newValue) => {
    setFormData({ ...formData, time: newValue.format('HH:mm') });
  };

  const isTimeDisabled = (time) => {
    const date = formData.date;
    const newTime = time.year(date.year())
      .month(date.month())
      .date(date.date());

    return unavailableTimeSlots.some((timeSlot) => {
      const startTime = new Date(timeSlot.start_time);
      const endTime = new Date(timeSlot.end_time - 60 * 1000);
      const timeHour = newTime.hour();
      return (
        timeHour >= startTime.getHours() &&
        timeHour <= endTime.getHours() &&
        newTime.date() === startTime.getDate() &&
        newTime.month() === startTime.getMonth() &&
        newTime.year() === startTime.getFullYear()
      );
    });
  };

  return (
    <Container maxWidth="md">
      <Typography sx={{ textAlign: 'center', marginTop: 3 }} variant="h2">
        Create Match
      </Typography>

      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          margin="normal"
          label="Team 1"
          name="team1"
          variant="outlined"
          select
          value={formData.team1}
          onChange={(e) => setFormData({ ...formData, team1: e.target.value })}
          error={!!validationErrors.team1}
          helperText={validationErrors.team1}
        >
          {teams.map((team) => (
            <MenuItem key={team.id} value={team.id}>
              {team.name}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          fullWidth
          margin="normal"
          label="Team 2"
          name="team2"
          variant="outlined"
          select
          value={formData.team2}
          onChange={(e) => setFormData({ ...formData, team2: e.target.value })}
          error={!!validationErrors.team2}
          helperText={validationErrors.team2}
        >
          {teams.map((team) => (
            <MenuItem key={team.id} value={team.id}>
              {team.name}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          fullWidth
          margin="normal"
          label="Description"
          name="description"
          variant="outlined"
          multiline
          minRows={3}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          error={!!validationErrors.description}
          helperText={validationErrors.description}
        />

        <FormControl fullWidth margin="normal">
          <InputLabel id="field-label">Field</InputLabel>
          <Select
            labelId="field-label"
            id="field"
            value={formData.field}
            label="Field"
            onChange={(e) => setFormData({ ...formData, field: e.target.value })}
            error={!!validationErrors.field}
            helperText={validationErrors.field}
          >
            {fields.map((field) => (
              <MenuItem key={field.id} value={field.id}>
                {field.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Grid container spacing={2} sx={{ width: '100%' }}>
            <Grid item xs={6}>
              <DatePicker
                label="Date"
                value={formData.date}
                onChange={(newValue) => {
                  setFormData({ ...formData, date: newValue });
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                  />
                )}
                sx={{ width: '100%' }}
              />
            </Grid>
            <Grid item xs={6}>
              <TimePicker
                label="Time"
                value={formData.time}
                onChange={handleTimeChange}
                shouldDisableTime={isTimeDisabled}
                views={['hours']}
                ampm={false}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    margin="normal"
                    name="time"
                    variant="outlined"
                  />
                )}
                sx={{ width: '100%' }}
              />
            </Grid>
          </Grid>
        </LocalizationProvider>


        <Button
          type="submit"
          fullWidth
          variant="contained"
          color="primary"
          sx={{ mt: 3, mb: 2 }}
        >
          Submit
        </Button>
      </form>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message={snackbarMessage}
        ContentProps={{ style: snackbarStyle }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
      />
    </Container>
  );
};

export default CreateMatch;

