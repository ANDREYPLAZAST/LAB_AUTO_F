// frontend/src/components/EstadoBotones.jsx
import React from 'react';

const getButtonStyle = (active, color) => ({
  backgroundColor: active ? color : '#888',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  padding: '16px 32px',
  margin: '0 12px',
  fontSize: '1.2rem',
  cursor: 'pointer',
  opacity: active ? 1 : 0.5,
  transition: 'background 0.3s, opacity 0.3s'
});

function EstadoBotones({ start, stop, paroEmergencia }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', margin: '32px 0' }}>
      <button style={getButtonStyle(start === 1, 'green')}>Start</button>
      <button style={getButtonStyle(stop === 1, 'red')}>Stop</button>
      <button style={getButtonStyle(paroEmergencia === 1, 'goldenrod')}>Paro Emergencia</button>
    </div>
  );
}

export default EstadoBotones;