import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import ElectricBoltIcon from '@mui/icons-material/ElectricBolt';

// Animación CSS para los íconos activos
const animStyle = {
  animation: 'spin 1s linear infinite',
  '@keyframes spin': {
    '0%': { transform: 'rotate(0deg)' },
    '100%': { transform: 'rotate(360deg)' }
  }
};

const DataTable = ({ data }) => {
  return (
    <TableContainer 
      component={Paper} 
      sx={{
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 2,
        '& .MuiTableCell-root': {
          borderColor: 'rgba(255, 255, 255, 0.1)',
          color: 'white',
          padding: '12px',
        }
      }}
    >
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Hora</TableCell>
            <TableCell align="center">SetPoint</TableCell>
            <TableCell align="center">Temperatura (°C)</TableCell>
            <TableCell align="center">Start</TableCell>
            <TableCell align="center">Stop</TableCell>
            <TableCell align="center">Paro Emergencia</TableCell>
            <TableCell align="center">Confirmar</TableCell>
            <TableCell align="center">Alarma TEH</TableCell>
            <TableCell align="center">Alarma TEL</TableCell>
            <TableCell align="center">Alarma Sensor</TableCell>
            <TableCell align="center">Alarma Actuador</TableCell>
            <TableCell align="center">PID Sintonizado</TableCell>
            <TableCell align="center">PID Clásico</TableCell>
            <TableCell align="center">PID Servosistema</TableCell>
            <TableCell align="center">Servo</TableCell>
            <TableCell align="center">Variador</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow
            sx={{
              '&:last-child td, &:last-child th': { border: 0 },
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
              },
            }}
          >
            <TableCell>{data.hora}</TableCell>
            <TableCell align="center">{data.setpoint}</TableCell>
            <TableCell align="center">{data.temperatura?.toFixed(1)}</TableCell>
            <TableCell align="center">
              <span style={{ color: data.b_start ? '#4caf50' : '#f44336', fontWeight: 'bold' }}>
                {data.b_start ? 'Activo' : 'Inactivo'}
              </span>
            </TableCell>
            <TableCell align="center">
              <span style={{ color: data.b_stop ? '#4caf50' : '#f44336', fontWeight: 'bold' }}>
                {data.b_stop ? 'Activo' : 'Inactivo'}
              </span>
            </TableCell>
            <TableCell align="center">
              <span style={{ color: data.b_paroE ? '#4caf50' : '#f44336', fontWeight: 'bold' }}>
                {data.b_paroE ? 'Activo' : 'Inactivo'}
              </span>
            </TableCell>
            <TableCell align="center">
              <span style={{ color: data.b_confirma ? '#4caf50' : '#f44336', fontWeight: 'bold' }}>
                {data.b_confirma ? 'Activo' : 'Inactivo'}
              </span>
            </TableCell>
            {/* Alarmas */}
            <TableCell align="center">
              <span style={{ color: data.alarma_teh ? '#f44336' : '#4caf50', fontWeight: 'bold' }}>
                {data.alarma_teh ? 'Alarma' : 'OK'}
              </span>
            </TableCell>
            <TableCell align="center">
              <span style={{ color: data.alarma_tel ? '#f44336' : '#4caf50', fontWeight: 'bold' }}>
                {data.alarma_tel ? 'Alarma' : 'OK'}
              </span>
            </TableCell>
            <TableCell align="center">
              <span style={{ color: data.alarma_sensor ? '#f44336' : '#4caf50', fontWeight: 'bold' }}>
                {data.alarma_sensor ? 'Alarma' : 'OK'}
              </span>
            </TableCell>
            <TableCell align="center">
              <span style={{ color: data.alarma_actuador ? '#f44336' : '#4caf50', fontWeight: 'bold' }}>
                {data.alarma_actuador ? 'Alarma' : 'OK'}
              </span>
            </TableCell>
            {/* PID */}
            <TableCell align="center">
              <span style={{ color: data.pid_auto ? '#2196f3' : '#bdbdbd', fontWeight: 'bold' }}>
                {data.pid_auto ? 'Activo' : '—'}
              </span>
            </TableCell>
            <TableCell align="center">
              <span style={{ color: data.pid_clasico ? '#2196f3' : '#bdbdbd', fontWeight: 'bold' }}>
                {data.pid_clasico ? 'Activo' : '—'}
              </span>
            </TableCell>
            <TableCell align="center">
              <span style={{ color: data.pid_servosis ? '#2196f3' : '#bdbdbd', fontWeight: 'bold' }}>
                {data.pid_servosis ? 'Activo' : '—'}
              </span>
            </TableCell>
            {/* Servo motor */}
            <TableCell align="center">
              <Tooltip title={data.estado_servo ? 'Servo en movimiento' : 'Servo detenido'}>
                <SettingsIcon sx={{ color: data.estado_servo ? '#ffb300' : '#bdbdbd', fontSize: 32, ...(data.estado_servo ? animStyle : {}) }} />
              </Tooltip>
            </TableCell>
            {/* Variador */}
            <TableCell align="center">
              <Tooltip title={data.estado_variador ? 'Variador activo' : 'Variador apagado'}>
                <ElectricBoltIcon sx={{ color: data.estado_variador ? '#00e676' : '#bdbdbd', fontSize: 32, ...(data.estado_variador ? animStyle : {}) }} />
              </Tooltip>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default DataTable;