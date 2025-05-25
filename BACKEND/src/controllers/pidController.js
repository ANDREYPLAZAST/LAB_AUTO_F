const PLCService = require('../services/plcService');

// Controlador para manejar la escritura de PID
const pidController = {
  // Recibe el payload y llama al servicio para escribir en el PLC
  setPID: async (req, res) => {
    const { pid_auto, pid_clasico, pid_servosis } = req.body;
    try {
      // Solo uno puede estar activo
      if ([pid_auto, pid_clasico, pid_servosis].filter(Boolean).length !== 1) {
        return res.status(400).json({ error: 'Solo uno de los PID puede estar activo' });
      }
      const result = await PLCService.writePID(!!pid_auto, !!pid_clasico, !!pid_servosis);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: 'Error al escribir el PID en el PLC' });
    }
  }
};

module.exports = pidController; 