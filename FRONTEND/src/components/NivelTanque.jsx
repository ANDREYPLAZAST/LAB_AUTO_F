// frontend/src/components/NivelTanque.jsx
import React from 'react';

function NivelTanque({ nivel }) {
  // Convertir el nivel de cm a porcentaje (asumiendo que 100cm es el 100%)
  const porcentaje = Math.max(0, Math.min(100, nivel));

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
        <div style={{
          width: 80,
          height: 200,
          border: '4px solid #aaa',
          borderRadius: 20,
          background: '#222',
          position: 'relative',
          overflow: 'hidden',
          marginBottom: 10
        }}>
          <div style={{
            position: 'absolute',
            bottom: 0,
            width: '100%',
            height: `${porcentaje}%`,
            background: 'linear-gradient(to top, #00bfff, #66e0ff)',
            transition: 'height 0.5s'
          }} />
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
        <span style={{ color: 'white', fontWeight: 'bold', fontSize: '1.2rem' }}>
          {nivel || 0} cm
        </span>
        <span style={{ color: '#aaa', fontSize: '1rem' }}>
          ({porcentaje}%)
        </span>
      </div>
    </div>
  );
}

export default NivelTanque;