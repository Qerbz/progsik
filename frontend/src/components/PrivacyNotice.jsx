// frontend/src/components/PrivacyNotice.jsx

import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, CircularProgress, Box } from '@mui/material';
import FieldsService from '../services/fields';

const PrivacyNotice = () => {
  const [fieldsInUse, setFieldsInUse] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    FieldsService.FetchFieldsInUse()
      .then(data => {
        setFieldsInUse(data);
        setLoading(false);
      })
      .catch(err => {
        console.log(err);
        setError('Could not fetch fields in use.');
        setLoading(false);
      });
  }, []);

  const fieldsInUseText = fieldsInUse.map(field => field.field_name).join(', ');

  const privacyCards = [
    {
      header: 'Filming',
      text: 'Matches are filmed to be watched by authorized users such as managers or guardians.'
    },
    {
      header: 'Video Usage',
      text: 'Performance analysis\nFor family of teams to see',
    },
    {
      header: 'Viewership',
      text: 'Authorized staff and security personnel\nTeam coaches and officials',
    },
    {
      header: 'Data Storage',
      text: 'The video data will be stored securely and retained for a period of 12 months',
    },
    {
      header: 'More Information',
      text: 'For more information contact: ola.nordmann@gmail.com',
    },];

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <Box display="flex" flexDirection="column" alignItems="center" mt={2}>
      <Card style={{ width: '100%', maxWidth: 400, marginBottom: '1rem' }}>
        <CardContent>
          <Typography variant="h6" component="h3" align="center" fontWeight="bold">
            Field
          </Typography>
          <Typography variant="body2" align="center" style={{ whiteSpace: 'pre-line' }}>
            {fieldsInUse.length > 0 ? `Fields currently in use: ${fieldsInUseText}` : 'No fields are currently in use.'}
          </Typography>
        </CardContent>
      </Card>
      {privacyCards.map((card, index) => (
        <Card key={index} style={{ width: '100%', maxWidth: 400, marginBottom: '1rem' }}>
          <CardContent>
            <Typography variant="h6" component="h3" align="center" fontWeight="bold">
              {card.header}
            </Typography>
            <Typography variant="body2" align="center" style={{ whiteSpace: 'pre-line' }}>
              {card.text}
            </Typography>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};

export default PrivacyNotice;

