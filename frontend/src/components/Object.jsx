import { Stack, Typography, Snackbar, TextField, Button } from "@mui/material";
import React, { useState } from "react";
import MuiAlert from "@mui/material/Alert";
import ObjectionsService from '../services/objections';


const Object = () => {
  const [objectionText, setObjectionText] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarText, setSnackbarText] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant='filled' {...props} />;
  });

  const OpenSnackbar = (text, severity = "success") => {
    setSnackbarText(text);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };


  const handleClose = (_, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const fileName = `${(new Date()).toISOString()}`
    console.log(fileName)
    // Create a FormData object to hold the text and file
    const formData = new FormData();
    formData.append("name", fileName)
    if (objectionText) {
      formData.append("text", objectionText)
    }
    if (selectedFile) {
      formData.append('document', selectedFile);
    }

    ObjectionsService.AddNewObjection(formData)
      .then(() => {
        OpenSnackbar('Objection submitted successfully!', 'success');
        setObjectionText('');
        setSelectedFile(null);
      })
      .catch((error) => {
        console.error('Error submitting objection:', error);
        OpenSnackbar('Error submitting objection. Please try again.', 'error');
      });
  };

  return (
    <>
      <Stack alignItems='center' spacing={1} marginTop={2}>
        <Typography variant='h2'>Submit Your Objections</Typography>
        <Typography variant='h6' style={{ textAlign: 'center' }}>
          Add objections if you want to contact administrators regarding any issues or objections with the service.
        </Typography>

        <Typography variant='h5'>Your Objection:</Typography>
        <TextField
          fullWidth
          multiline
          rows={6}
          variant="outlined"
          value={objectionText}
          onChange={(e) => setObjectionText(e.target.value)}
        />

        <Button variant='contained' component='label'>
          Upload Additional Documents (PDF-format)
          <input
            hidden
            type='file'
            onChange={(e) => setSelectedFile(e.target.files[0])}
          />
        </Button>

        <Typography variant='h6'>
          {selectedFile ? selectedFile.name : "No document selected"}
        </Typography>

        <Button
          variant='contained'
          onClick={handleSubmit}
          disabled={!objectionText && !selectedFile}
        >
          Submit Objection
        </Button>
      </Stack>

      <Snackbar
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        open={snackbarOpen}
        autoHideDuration={5000}
        onClose={handleClose}
      >
        <Alert onClose={handleClose} severity={snackbarSeverity} sx={{ width: "100%" }}>
          {snackbarText}
        </Alert>
      </Snackbar>

    </>
  );
};

export default Object;


