// Servicio para comunicación con el PLC usando scripts Python
const { PythonShell } = require('python-shell');
const path = require('path');

class PLCService {
  // Lee todas las variables del PLC
  static async readPLC() {
    try {
      // Ejecuta el script Python que lee el DB7
      const results = await PythonShell.run(path.join(__dirname, '../../read_plc.py'), null);
      // Devuelve el JSON con todas las variables
      return JSON.parse(results[0]);
    } catch (error) {
      console.error('Error leyendo del PLC:', error);
      throw error;
    }
  }

  // Escribe el setpoint en el PLC (puedes expandir para otras variables si lo necesitas)
  static async writePLC(value) {
    try {
      // Ejecuta el script Python que escribe el setpoint
      const results = await PythonShell.run(path.join(__dirname, '../../write_plc.py'), {
        args: [value.toString()]
      });
      return JSON.parse(results[0]);
    } catch (error) {
      console.error('Error escribiendo en el PLC:', error);
      throw error;
    }
  }

  // Escribe los bits de PID en el PLC
  static async writePID(pid_auto, pid_clasico, pid_servosis) {
    try {
      const results = await PythonShell.run(path.join(__dirname, '../../write_pid_plc.py'), {
        args: [
          pid_auto ? '1' : '0',
          pid_clasico ? '1' : '0',
          pid_servosis ? '1' : '0'
        ]
      });
      return JSON.parse(results[0]);
    } catch (error) {
      console.error('Error escribiendo PID en el PLC:', error);
      throw error;
    }
  }
}

module.exports = PLCService; 