import React, { useEffect, useState } from 'react';
import { Box, Typography, ToggleButton, ToggleButtonGroup, CircularProgress, Alert } from '@mui/material';
import axios from 'axios';

// Componente para seleccionar el tipo de PID activo
// Solo uno puede estar activo a la vez
const API_BASE_URL = 'http://localhost:5000';

const PIDSelector = () => {
  const [pid, setPid] = useState(null); // Estado local del PID activo
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);

  // Obtener el valor actual del PID desde la base de datos
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_BASE_URL}/api/data`);
        if (res.data) {
          if (res.data.pid_auto) setPid('auto');
          else if (res.data.pid_clasico) setPid('clasico');
          else if (res.data.pid_servosis) setPid('servosis');
          else setPid(null);
        }
        setError(null);
      } catch (err) {
        setError('Error al obtener el estado del PID');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    // Opcional: actualizar cada 2 segundos
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, []);

  // Manejar el cambio de selección
  const handleChange = async (event, newPid) => {
    if (!newPid || newPid === pid) return;
    setPid(newPid);
    setSending(true);
    setError(null);
    // Construir el payload: solo uno en true
    const payload = {
      pid_auto: newPid === 'auto',
      pid_clasico: newPid === 'clasico',
      pid_servosis: newPid === 'servosis'
    };
    try {
      await axios.post(`${API_BASE_URL}/api/pid`, payload);
    } catch (err) {
      setError('Error al actualizar el PID');
    } finally {
      setSending(false);
    }
  };

  return (
    <Box sx={{ bgcolor: 'rgba(32,32,32,0.95)', borderRadius: 2, p: 3, mb: 2, textAlign: 'center' }}>
      <Typography variant="h6" sx={{ mb: 2, color: 'white' }}>
        Tipo de PID activo
      </Typography>
      {loading ? (
        <CircularProgress sx={{ color: 'white' }} />
      ) : (
        <ToggleButtonGroup
          value={pid}
          exclusive
          onChange={handleChange}
          color="primary"
        >
          <ToggleButton value="auto" sx={{ width: 150 }}>
            PID Sintonizado
          </ToggleButton>
          <ToggleButton value="clasico" sx={{ width: 150 }}>
            PID Clásico
          </ToggleButton>
          <ToggleButton value="servosis" sx={{ width: 150 }}>
            PID Servosistema
          </ToggleButton>
        </ToggleButtonGroup>
      )}
      {sending && <Typography sx={{ color: 'white', mt: 1 }}>Enviando...</Typography>}
      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
    </Box>
  );
};

export default PIDSelector; 