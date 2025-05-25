import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Box, Typography } from '@mui/material';

// Componente para graficar Setpoint y Temperatura vs Hora
const GraficaTemperatura = ({ data }) => {
  return (
    <Box sx={{ width: '100%', bgcolor: 'rgba(32,32,32,0.95)', borderRadius: 2, p: 3, mt: 4 }}>
      <Typography variant="h6" sx={{ color: 'white', mb: 2, textAlign: 'center' }}>
        Setpoint y Temperatura vs Tiempo
      </Typography>
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#444" />
          <XAxis dataKey="hora" stroke="#fff" minTickGap={20} />
          <YAxis stroke="#fff" domain={[0, 'auto']} />
          <Tooltip contentStyle={{ background: '#222', color: '#fff', border: 'none' }} />
          <Legend wrapperStyle={{ color: 'white' }} />
          <Line type="monotone" dataKey="setpoint" name="Setpoint" stroke="#1976d2" strokeWidth={3} dot={false} />
          <Line type="monotone" dataKey="temperatura" name="Temperatura" stroke="#e53935" strokeWidth={3} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default GraficaTemperatura; 