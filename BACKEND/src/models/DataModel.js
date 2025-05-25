const mongoose = require('mongoose');

const dataSchema = new mongoose.Schema({
  hora: String,
  referencia_nivel_tanque_cm: Number,
  nivel_actual_tanque_cm: Number,
  rpms_bomba: Number,
  estado_boton_start: Number,
  estado_boton_stop: Number,
  estado_boton_paro_emergencia: Number,
  estado_boton_confirmar: Number,
  sensor_alto: Boolean,
  sensor_bajo: Boolean
}, { versionKey: false });

module.exports = mongoose.model('Datos_monitoreo', dataSchema); 