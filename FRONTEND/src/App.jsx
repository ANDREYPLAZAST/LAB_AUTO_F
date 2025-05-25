import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import NivelTanque from './components/NivelTanque';
import DataTable from './components/DataTable';
import SetpointControl from './components/SetpointControl';
import BotonesControl from './components/BotonesControl';
import PIDSelector from './components/PIDSelector';
import Termometro from './components/Termometro';
import GraficaTemperatura from './components/GraficaTemperatura';
import { CircularProgress, Alert, Snackbar, Box } from '@mui/material';

const API_BASE_URL = 'http://localhost:5000';

// Configurar axios con timeout y reintentos
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000, // 5 segundos de timeout
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  }
});

function App() {
  const [data, setData] = useState(null);
  const [history, setHistory] = useState([]); // Historial para la gráfica
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(true);
  const retryCount = useRef(0);
  const maxRetries = 3;
  const retryDelay = 2000; // 2 segundos entre reintentos

  const fetchData = async () => {
    try {
      const response = await axiosInstance.get('/api/data');
      setData(response.data);
      // Obtener historial para la gráfica
      const histRes = await axiosInstance.get('/api/data/history');
      setHistory(histRes.data || []);
      setError(null);
      setIsConnected(true);
      retryCount.current = 0; // Resetear el contador de reintentos
    } catch (error) {
      console.error('Error al obtener los datos:', error);
      retryCount.current += 1;
      
      if (retryCount.current >= maxRetries) {
        setError('Error al conectar con el servidor');
        setIsConnected(false);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let intervalId;
    
    const startPolling = () => {
      fetchData();
      intervalId = setInterval(fetchData, 2000); // Actualizar cada 2 segundos
    };

    const stopPolling = () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };

    startPolling();

    // Limpiar el intervalo cuando el componente se desmonte
    return () => {
      stopPolling();
    };
  }, []);

  // Efecto para manejar la reconexión
  useEffect(() => {
    let reconnectTimeout;
    
    if (!isConnected) {
      reconnectTimeout = setTimeout(() => {
        setIsConnected(true);
        retryCount.current = 0;
      }, retryDelay);
    }

    return () => {
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
    };
  }, [isConnected]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#1a1a1a',
        color: 'white',
        overflow: 'hidden'
      }}
    >
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          maxWidth: '1600px',
          mx: 'auto',
          px: 4,
          py: 4
        }}
      >
        <h1 style={{
          textAlign: 'center',
          fontSize: '2.5rem',
          margin: '0 0 3rem 0',
          color: 'white',
          textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
        }}>
          Sistema de Supervisión Planta Térmica
        </h1>

        {/* Tabla de Datos */}
        <Box sx={{ 
          width: '100%',
          bgcolor: 'rgba(32, 32, 32, 0.95)',
          borderRadius: 1,
          overflow: 'auto',
          mb: 6
        }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress sx={{ color: 'white' }} />
            </Box>
          ) : !error && data ? (
            <DataTable data={data} />
          ) : null}
        </Box>

        {/* Panel Principal */}
        <Box sx={{ 
          width: '100%',
          display: 'flex',
          gap: 8,
          justifyContent: 'center',
          alignItems: 'center',
          mb: 4
        }}>
          {/* Panel Izquierdo - Setpoint */}
          <Box sx={{ 
            width: '400px',
            bgcolor: 'rgba(32, 32, 32, 0.95)',
            borderRadius: 2,
            p: 4
          }}>
            <SetpointControl />
          </Box>

          {/* Panel Central - Termómetro */}
          <Box sx={{ 
            width: '400px',
            bgcolor: 'rgba(32, 32, 32, 0.95)',
            borderRadius: 2,
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            <Termometro temperatura={data?.temperatura || 0} />
          </Box>

          {/* Panel Derecho - Botones */}
          <Box sx={{ 
            width: '400px',
            bgcolor: 'rgba(32, 32, 32, 0.95)',
            borderRadius: 2,
            p: 4
          }}>
            <PIDSelector />
            <BotonesControl />
          </Box>
        </Box>
      </Box>

      {/* Gráfica de Setpoint y Temperatura */}
      <GraficaTemperatura data={history} />

      {/* Snackbar para mostrar errores de conexión */}
      <Snackbar
        open={!isConnected}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="error" sx={{ width: '100%' }}>
          Error de conexión con el servidor. Intentando reconectar...
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default App;