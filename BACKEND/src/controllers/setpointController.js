const SetpointModel = require('../models/SetpointModel');
const PLCService = require('../services/plcService');

class SetpointController {
  static async getLatestSetpoint(req, res) {
    try {
      const latestSetpoint = await SetpointModel.findOne().sort({ _id: -1 });
      res.json(latestSetpoint);
    } catch (err) {
      console.error('Error getting setpoint:', err);
      res.status(500).json({ error: 'Error getting setpoint' });
    }
  }

  static async updateSetpoint(req, res) {
    try {
      const { referencia_nivel_tanque_cm } = req.body;
      
      // Write to PLC first
      const plcResult = await PLCService.writePLC(referencia_nivel_tanque_cm);
      
      if (!plcResult.success) {
        throw new Error(`Error writing to PLC: ${plcResult.error}`);
      }
      
      // If PLC write successful, save to database
      const nuevoSetpoint = {
        hora: new Date().toLocaleTimeString('es-CO', { timeZone: 'America/Bogota' }),
        referencia_nivel_tanque_cm,
        origen: 'Frontend'
      };
      
      const setpoint = new SetpointModel(nuevoSetpoint);
      await setpoint.save();
      
      res.json(setpoint);
    } catch (err) {
      console.error('Error updating setpoint:', err);
      res.status(500).json({ error: 'Error updating setpoint' });
    }
  }
}

module.exports = SetpointController; 