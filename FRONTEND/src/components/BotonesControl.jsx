import React, { useState, useEffect } from 'react';
import {
  Box,
  FormControlLabel,
  Radio,
  RadioGroup
} from '@mui/material';

const API_BASE_URL = 'http://localhost:5000';

const BotonesControl = () => {
  const [botonesState, setBotonesState] = useState({
    estado_boton_start: 0,
    estado_boton_stop: 0,
    estado_boton_paro_emergencia: 0
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchBotonesState = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/data`);
        if (response.ok) {
          const data = await response.json();
          if (data) {
            setBotonesState({
              estado_boton_start: data.estado_boton_start || 0,
              estado_boton_stop: data.estado_boton_stop || 0,
              estado_boton_paro_emergencia: data.estado_boton_paro_emergencia || 0
            });
          }
        }
      } catch (error) {
        console.error('Error al obtener estado de botones:', error);
      }
    };

    fetchBotonesState();
    const interval = setInterval(fetchBotonesState, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleBotonChange = async (boton, valor) => {
    if (isLoading) return;
    
    setIsLoading(true);
    const newState = {
      ...botonesState,
      [boton]: valor
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/buttons`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(newState),
      });

      if (response.ok) {
        setBotonesState(newState);
      }
    } catch (error) {
      console.error('Error de conexión:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonStyle = (isActive, defaultColor) => ({
    height: '65px',
    fontSize: '1.4rem',
    fontWeight: 500,
    textTransform: 'none',
    mb: 2,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 1,
    boxShadow: 2,
    bgcolor: isActive ? defaultColor : 'rgba(128, 128, 128, 0.3)',
    color: 'white',
    opacity: isActive ? 1 : 0.7,
    transition: 'all 0.3s ease',
    '&:hover': {
      opacity: 0.9,
      transform: 'scale(1.02)'
    }
  });

  const radioGroupStyle = {
    flexDirection: 'row',
    justifyContent: 'center',
    '& .MuiFormControlLabel-root': {
      margin: '0 16px'
    }
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      gap: 4,
      width: '100%',
      '& > *': { flex: 1 }
    }}>
      {/* Start Button */}
      <Box sx={{ textAlign: 'center' }}>
        <Box
          sx={getButtonStyle(botonesState.estado_boton_start === 1, '#2e7d32')}
          onClick={() => handleBotonChange('estado_boton_start', botonesState.estado_boton_start === 1 ? 0 : 1)}
        >
          Start
        </Box>
        <RadioGroup
          value={botonesState.estado_boton_start.toString()}
          onChange={(e) => handleBotonChange('estado_boton_start', parseInt(e.target.value))}
          sx={radioGroupStyle}
        >
          <FormControlLabel
            value="1"
            control={<Radio size="large" sx={{ color: 'white', '&.Mui-checked': { color: 'white' } }} />}
            label="ON"
            sx={{ color: 'white', '.MuiFormControlLabel-label': { fontSize: '1.2rem' } }}
          />
          <FormControlLabel
            value="0"
            control={<Radio size="large" sx={{ color: 'white', '&.Mui-checked': { color: 'white' } }} />}
            label="OFF"
            sx={{ color: 'white', '.MuiFormControlLabel-label': { fontSize: '1.2rem' } }}
          />
        </RadioGroup>
      </Box>

      {/* Stop Button */}
      <Box sx={{ textAlign: 'center' }}>
        <Box
          sx={getButtonStyle(botonesState.estado_boton_stop === 1, '#d32f2f')}
          onClick={() => handleBotonChange('estado_boton_stop', botonesState.estado_boton_stop === 1 ? 0 : 1)}
        >
          Stop
        </Box>
        <RadioGroup
          value={botonesState.estado_boton_stop.toString()}
          onChange={(e) => handleBotonChange('estado_boton_stop', parseInt(e.target.value))}
          sx={radioGroupStyle}
        >
          <FormControlLabel
            value="1"
            control={<Radio size="large" sx={{ color: 'white', '&.Mui-checked': { color: 'white' } }} />}
            label="ON"
            sx={{ color: 'white', '.MuiFormControlLabel-label': { fontSize: '1.2rem' } }}
          />
          <FormControlLabel
            value="0"
            control={<Radio size="large" sx={{ color: 'white', '&.Mui-checked': { color: 'white' } }} />}
            label="OFF"
            sx={{ color: 'white', '.MuiFormControlLabel-label': { fontSize: '1.2rem' } }}
          />
        </RadioGroup>
      </Box>

      {/* Emergency Stop Button */}
      <Box sx={{ textAlign: 'center' }}>
        <Box
          sx={getButtonStyle(botonesState.estado_boton_paro_emergencia === 1, '#ed6c02')}
          onClick={() => handleBotonChange('estado_boton_paro_emergencia', botonesState.estado_boton_paro_emergencia === 1 ? 0 : 1)}
        >
          Paro de Emergencia
        </Box>
        <RadioGroup
          value={botonesState.estado_boton_paro_emergencia.toString()}
          onChange={(e) => handleBotonChange('estado_boton_paro_emergencia', parseInt(e.target.value))}
          sx={radioGroupStyle}
        >
          <FormControlLabel
            value="1"
            control={<Radio size="large" sx={{ color: 'white', '&.Mui-checked': { color: 'white' } }} />}
            label="ON"
            sx={{ color: 'white', '.MuiFormControlLabel-label': { fontSize: '1.2rem' } }}
          />
          <FormControlLabel
            value="0"
            control={<Radio size="large" sx={{ color: 'white', '&.Mui-checked': { color: 'white' } }} />}
            label="OFF"
            sx={{ color: 'white', '.MuiFormControlLabel-label': { fontSize: '1.2rem' } }}
          />
        </RadioGroup>
      </Box>
    </Box>
  );
};

export default BotonesControl; 