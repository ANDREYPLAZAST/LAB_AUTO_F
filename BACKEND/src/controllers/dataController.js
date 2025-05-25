const DataModel = require('../models/DataModel');
const LocalDataModel = require('../models/LocalDataModel');
const PLCService = require('../services/plcService');

class DataController {
  static async getLatestData(req, res) {
    try {
      const latestData = await DataModel.findOne().sort({ _id: -1 });
      res.json(latestData);
    } catch (err) {
      console.error('Error obteniendo datos:', err);
      res.status(500).json({ error: 'Error obteniendo datos' });
    }
  }

  static async processPLCData() {
    try {
      const plcData = await PLCService.readPLC();
      const hora = new Date().toLocaleTimeString('es-CO', { timeZone: 'America/Bogota' });
      
      const dataToSave = {
        hora,
        ...plcData
      };

      // Save to cloud database
      const data = new DataModel(dataToSave);
      await data.save();

      // Save to local database
      const localData = new LocalDataModel(dataToSave);
      await localData.save();

      // Manage data limit
      await this.manageDataLimit();

      return dataToSave;
    } catch (error) {
      console.error('Error procesando datos del PLC:', error);
      throw error;
    }
  }

  static async manageDataLimit() {
    try {
      const count = await DataModel.countDocuments();
      if (count >= 500) {
        // Delete oldest 100 records from both databases
        for (let i = 0; i < 100; i++) {
          await DataModel.findOneAndDelete({}, { sort: { _id: 1 } });
          await LocalDataModel.findOneAndDelete({}, { sort: { _id: 1 } });
        }
        console.log('Eliminados los 100 registros más antiguos');
      }
    } catch (error) {
      console.error('Error gestionando el límite de datos:', error);
      throw error;
    }
  }

  // Devuelve el historial de los últimos 30 datos para la gráfica
  static async getHistory(req, res) {
    try {
      const history = await DataModel.find({}, { _id: 0, hora: 1, setpoint: 1, temperatura: 1 })
        .sort({ $natural: -1 })
        .limit(30)
        .lean();
      // Devolver en orden ascendente de tiempo
      res.json(history.reverse());
    } catch (err) {
      res.status(500).json({ error: 'Error obteniendo el historial' });
    }
  }
}

module.exports = DataController; 