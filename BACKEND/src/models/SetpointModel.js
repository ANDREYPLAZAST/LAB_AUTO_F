const mongoose = require('mongoose');

const setpointSchema = new mongoose.Schema({
  hora: String,
  referencia_nivel_tanque_cm: Number,
  origen: String
}, { versionKey: false });

module.exports = mongoose.model('Setpoint', setpointSchema); 