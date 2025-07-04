import React, { useState } from 'react';
import { Box, Button, Typography } from "@mui/material";
import { getConfig } from "@ot/config";
import { BasePage } from "ui";

const config = getConfig();

const getIngestionUrl = () => {
  // Replace '/graphql' or '/graphql/' at the end of the urlApi with '/sheet-ingestion'
  return config.urlApi.replace(/\/graphql\/?$/, '/sheet-ingestion');
};

const IngestionPage = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  const handleIngest = async () => {
    setLoading(true);
    setMessage('');
    try {
      const response = await fetch(getIngestionUrl(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}), // No sheetId, use backend default
      });
      const data = await response.json();
      if (data.success) {
        setMessage('Ingestion started successfully!');
      } else {
        setMessage(data.message || 'Failed to start ingestion.');
      }
    } catch (error) {
        console.log(error);
      setMessage('Error contacting backend.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <BasePage>
      <Box sx={{ maxWidth: 600, margin: '2rem auto', padding: 2, border: '1px solid #eee', borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom>
          Data Ingestion
        </Typography>
        <Typography variant="body1" paragraph>
          Click the button below to start ingesting data from the default Google Sheet. This will trigger the backend ingestion process.
        </Typography>
        <Button 
          onClick={handleIngest} 
          variant="contained" 
          sx={{ color: "white", minWidth: 200 }}
          disabled={loading}
        >
          {loading ? 'Starting...' : 'Start Ingestion'}
        </Button>
        {message && (
          <Typography sx={{ mt: 2 }} color={message.includes('success') ? 'green' : 'red'}>
            {message}
          </Typography>
        )}
      </Box>
    </BasePage>
  );
};

export default IngestionPage;
