import React from 'react';
import { Box, Typography } from '@mui/material';

// Componente visual de termómetro para mostrar la temperatura actual
const Termometro = ({ temperatura = 0, min = 0, max = 200 }) => {
  // Calcular el porcentaje de llenado
  const percent = Math.max(0, Math.min(1, (temperatura - min) / (max - min)));
  const altura = 180; // px
  const nivel = altura - percent * altura;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
      <Typography variant="h6" sx={{ color: 'white', mb: 1 }}>
        Temperatura actual
      </Typography>
      <svg width="60" height="220" viewBox="0 0 60 220">
        {/* Bulbo */}
        <circle cx="30" cy="200" r="25" fill="#e53935" stroke="#b71c1c" strokeWidth="4" />
        {/* Tubo */}
        <rect x="20" y="20" width="20" height="160" rx="10" fill="#bdbdbd" stroke="#757575" strokeWidth="3" />
        {/* Nivel de mercurio */}
        <rect x="22" y={20 + nivel} width="16" height={altura - nivel + 5} rx="8" fill="#e53935" />
        {/* Escala */}
        <text x="30" y="18" textAnchor="middle" fontSize="16" fill="#fff">{max}°C</text>
        <text x="30" y="210" textAnchor="middle" fontSize="16" fill="#fff">{min}°C</text>
      </svg>
      <Typography variant="h4" sx={{ color: '#e53935', mt: 1, fontWeight: 'bold' }}>
        {temperatura.toFixed(1)} °C
      </Typography>
    </Box>
  );
};

export default Termometro; 