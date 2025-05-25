import React, { useState, useEffect } from 'react';
import {
  Box,
  Slider,
  TextField,
  Button,
  Typography,
  Paper,
  Stack,
  Snackbar,
  Alert
} from '@mui/material';

const API_BASE_URL = 'http://localhost:5000'; // Base URL for API calls

const SetpointControl = () => {
  const [setpoint, setSetpoint] = useState(0);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [isLoading, setIsLoading] = useState(false);

  // Manejar cambios en el slider
  const handleSliderChange = (event, newValue) => {
    setSetpoint(newValue);
  };

  // Manejar cambios en el campo de texto
  const handleInputChange = (event) => {
    const value = event.target.value === '' ? '' : Number(event.target.value);
    if (value === '' || (value >= 0 && value <= 100)) {
      setSetpoint(value);
    }
  };

  // Manejar el enfoque perdido en el campo de texto
  const handleBlur = () => {
    if (setpoint < 0) {
      setSetpoint(0);
    } else if (setpoint > 100) {
      setSetpoint(100);
    }
  };

  // Función para enviar el setpoint al servidor
  const handleSetpointConfirmation = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/setpoint`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          referencia_nivel_tanque_cm: setpoint,
        }),
      });

      const data = await response.json();
      setSnackbarMessage('Setpoint actualizado correctamente');
      setSnackbarSeverity('success');
      setOpenSnackbar(true);

    } catch (error) {
      console.error('Error de conexión:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar el último setpoint al montar el componente
  useEffect(() => {
    const fetchLastSetpoint = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/setpoint`);
        if (response.ok) {
          const data = await response.json();
          if (data && typeof data.referencia_nivel_tanque_cm === 'number') {
            setSetpoint(data.referencia_nivel_tanque_cm);
          }
        }
      } catch (error) {
        console.error('Error al cargar el último setpoint:', error);
      }
    };

    fetchLastSetpoint();
  }, []);

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        p: 4,
        width: '100%',
        maxWidth: 400,
        bgcolor: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: 2,
      }}
    >
      <Stack spacing={4}>
        <Typography 
          variant="h6" 
          gutterBottom 
          sx={{ 
            color: 'white',
            textAlign: 'center',
            fontWeight: 500,
            letterSpacing: '0.5px'
          }}
        >
          Control de Setpoint
        </Typography>

        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2,
          justifyContent: 'center' 
        }}>
          <TextField
            label="Setpoint"
            value={setpoint}
            onChange={handleInputChange}
            onBlur={handleBlur}
            type="number"
            InputProps={{
              inputProps: {
                min: 0,
                max: 100,
                step: 1,
              },
              sx: {
                color: 'white',
                '& input': {
                  color: 'white',
                },
              }
            }}
            InputLabelProps={{
              sx: { color: 'rgba(255, 255, 255, 0.7)' }
            }}
            size="small"
            sx={{
              width: 120,
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.23)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'primary.main',
                },
              },
            }}
          />
          <Typography sx={{ color: 'white' }}>cm</Typography>
        </Box>

        <Slider
          value={typeof setpoint === 'number' ? setpoint : 0}
          onChange={handleSliderChange}
          min={0}
          max={100}
          step={1}
          marks={[
            { value: 0, label: '0' },
            { value: 25, label: '25' },
            { value: 50, label: '50' },
            { value: 75, label: '75' },
            { value: 100, label: '100' },
          ]}
          sx={{
            color: 'primary.main',
            '& .MuiSlider-markLabel': {
              color: 'rgba(255, 255, 255, 0.7)',
            },
            '& .MuiSlider-rail': {
              opacity: 0.3,
            },
          }}
        />

        <Button
          variant="contained"
          color="primary"
          onClick={handleSetpointConfirmation}
          disabled={isLoading}
          fullWidth
          sx={{
            py: 1.5,
            bgcolor: 'primary.main',
            '&:hover': {
              bgcolor: 'primary.dark',
            },
            textTransform: 'none',
            fontSize: '1rem',
          }}
        >
          {isLoading ? 'Actualizando...' : 'Confirmar Setpoint'}
        </Button>
      </Stack>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setOpenSnackbar(false)}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
          variant="filled"
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default SetpointControl; 