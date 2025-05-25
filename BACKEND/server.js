// ====================================================
// CONFIGURACIÓN INICIAL Y DEPENDENCIAS
// ===================================================
// Carga las variables de entorno desde el archivo .env
// Esto permite usar variables como MONGODB_URI y PORT de forma segura
require('dotenv').config();

// Importación de las dependencias necesarias
const express = require('express'); // Framework web para Node.js
const mongoose = require('mongoose'); // ODM (Object Document Mapper) para MongoDB
const cors = require('cors'); // Middleware para habilitar CORS (Cross-Origin Resource Sharing)
const { PythonShell } = require('python-shell'); // Para ejecutar scripts de Python

// ====================================================
// CONFIGURACIÓN DEL SERVIDOR EXPRESS
// ====================================================

// Creación de la aplicación Express
const app = express();
// Puerto en el que correrá el servidor, usa el de .env o 5000 por defecto
const PORT = process.env.PORT || 5000;

// Configuración de CORS más específica
app.use(cors({
  origin: '*', // O especifica el origen exacto de tu frontend
  methods: ['GET', 'POST'],
  credentials: true
}));

app.use(express.json()); // Permite parsear el cuerpo de las peticiones como JSON

// ====================================================
// CONEXIÓN A MONGODB
// ====================================================

// Conexión a MongoDB en la nube
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Conectado a MongoDB en la nube'))
  .catch(err => console.error('Error de conexión a MongoDB en la nube:', err));

// Conexión a MongoDB local
const localMongoUri = process.env.MONGODB_LOCAL_URI;
const localConnection = mongoose.createConnection(localMongoUri);

localConnection.on('error', console.error.bind(console, 'Error de conexión a MongoDB local:'));
localConnection.once('open', () => {
  console.log('Conectado a MongoDB local');
});

// Definir el esquema de datos para MongoDB
const dataSchema = new mongoose.Schema({
  hora: String, // Hora de la lectura
  referencia_nivel_tanque_cm: Number, // Referencia del nivel del tanque
  nivel_actual_tanque_cm: Number, // Nivel actual del tanque
  rpms_bomba: Number, // RPMs de la bomba
  estado_boton_start: Number, // Estado del botón de inicio
  estado_boton_stop: Number, // Estado del botón de parada
  estado_boton_paro_emergencia: Number, // Estado del botón de paro de emergencia
  estado_boton_confirmar: Number, // Estado del botón de confirmación
  sensor_alto: Boolean, // Estado del sensor de nivel alto
  sensor_bajo: Boolean // Estado del sensor de nivel bajo
}, { versionKey: false }); // Desactivar el campo __v

// Crear un modelo de datos basado en el esquema para la base de datos en la nube
const DataModel = mongoose.model('Datos_monitoreo', dataSchema);

// Crear un modelo de datos para la base de datos local
const LocalDataModel = localConnection.model('datos_monitoreo_local', dataSchema);

// Definir el esquema de datos para el setpoint
const setpointSchema = new mongoose.Schema({
  hora: String, // Hora de la lectura
  referencia_nivel_tanque_cm: Number, // Referencia del nivel del tanque
  origen: String, // Para identificar si viene del frontend o Python
}, { versionKey: false }); // Desactivar el campo __v

// Crear un modelo de datos para el setpoint
const SetpointModel = mongoose.model('Setpoint', setpointSchema);

// ====================================================
// LECTURA PERIÓDICA DEL PLC
// ====================================================
let ultimoDatoGuardado = null;
let isProcessing = false; // Bandera para evitar procesamiento simultáneo

// Función para obtener el último setpoint
async function getLatestSetpoint() {
  try {
    const latestSetpoint = await SetpointModel.findOne().sort({ _id: -1 });
    return latestSetpoint ? latestSetpoint.referencia_nivel_tanque_cm : 100; // valor por defecto 100
  } catch (error) {
    console.error('Error al obtener el último setpoint:', error);
    return 100; // valor por defecto en caso de error
  }
}

// Función para leer datos del PLC
async function leerDatosPLC() {
  if (isProcessing) return; // Evitar procesamiento simultáneo
  
  try {
    isProcessing = true;
    
    // Verificar conexión a MongoDB
    if (mongoose.connection.readyState !== 1) {
      console.log('Esperando conexión a MongoDB...');
      return;
    }

    // Ejecuta el script Python que lee los datos del PLC
    const results = await PythonShell.run('read_plc.py', null);
    const plcData = JSON.parse(results[0]);
    
    // Obtiene la hora actual en formato de Bogotá
    const hora = new Date().toLocaleTimeString('es-CO', { timeZone: 'America/Bogota' });

    // Prepara los datos para guardar
    const dataToSave = {
      hora,
      ...plcData
    };

    // Verificar si hay cambios en los datos
    const hayCambiosEnDatos = !ultimoDatoGuardado || 
      Object.keys(plcData).some(key => 
        key !== 'hora' && plcData[key] !== ultimoDatoGuardado[key]
      );

    if (hayCambiosEnDatos) {
      // Guarda los datos de monitoreo en MongoDB en la nube
      const data = new DataModel(dataToSave);
      await data.save();
      
      // Guarda los datos de monitoreo en MongoDB local
      const localData = new LocalDataModel(dataToSave);
      await localData.save();
      
      console.log('Datos guardados en ambas bases de datos:', dataToSave);
      ultimoDatoGuardado = plcData;

      // Verificar si se alcanzó el límite de 500 registros
      await gestionarLimiteDatos();
    } else {
      // Sobrescribir el último documento si no ha cambiado en ambas bases de datos
      await DataModel.findOneAndUpdate({}, dataToSave, { sort: { _id: -1 } });
      await LocalDataModel.findOneAndUpdate({}, dataToSave, { sort: { _id: -1 } });
      console.log('Datos sobrescritos en ambas bases de datos:', dataToSave);
    }

    // Si el botón de confirmar está activado (valor 1), guarda un nuevo setpoint
    if (plcData.estado_boton_confirmar === 1) {
      const setpoint = new SetpointModel({
        hora,
        referencia_nivel_tanque_cm: plcData.referencia_nivel_tanque_cm,
        origen: 'PLC'
      });
      await setpoint.save();
      console.log('Setpoint guardado:', setpoint);
    }

  } catch (err) {
    console.error('Error en el ciclo de lectura:', err);
  } finally {
    isProcessing = false;
  }
}

// Función para gestionar el límite de datos en ambas bases de datos
async function gestionarLimiteDatos() {
  try {
    const count = await DataModel.countDocuments();
    if (count >= 500) {
      // Eliminar los primeros 100 documentos uno por uno en ambas bases de datos
      for (let i = 0; i < 100; i++) {
        await DataModel.findOneAndDelete({}, { sort: { _id: 1 } });
        await LocalDataModel.findOneAndDelete({}, { sort: { _id: 1 } });
      }
      console.log('Se eliminaron los primeros 100 registros en ambas bases de datos');
    }
  } catch (err) {
    console.error('Error al gestionar el límite de datos:', err);
  }
}

// Configurar intervalo de lectura con manejo de errores
let intervalId = setInterval(leerDatosPLC, 1000);

// Función para reiniciar el intervalo en caso de error
function reiniciarIntervalo() {
  clearInterval(intervalId);
  intervalId = setInterval(leerDatosPLC, 1000);
}

// Manejador de errores no capturados
process.on('uncaughtException', (err) => {
  console.error('Error no capturado:', err);
  reiniciarIntervalo();
});

// ====================================================
// ENDPOINTS DE LA API
// ====================================================

// Endpoint para obtener el último dato de monitoreo
app.get('/api/data', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: 'Servicio no disponible - Base de datos desconectada' });
    }
    const latestData = await DataModel.findOne().sort({ _id: -1 });
    res.json(latestData);
  } catch (err) {
    console.error('Error al obtener datos:', err);
    res.status(500).json({ error: 'Error al obtener los datos' });
  }
});

app.get('/api/setpoint', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: 'Servicio no disponible - Base de datos desconectada' });
    }
    const latestSetpoint = await SetpointModel.findOne().sort({ _id: -1 });
    res.json(latestSetpoint);
  } catch (err) {
    console.error('Error al obtener setpoint:', err);
    res.status(500).json({ error: 'Error al obtener el setpoint' });
  }
});

// Endpoint para actualizar el setpoint desde el frontend
app.post('/api/setpoint', async (req, res) => {
  try {
    const { referencia_nivel_tanque_cm } = req.body;
    
    // Primero intentar escribir en el PLC
    try {
      const results = await PythonShell.run('write_plc.py', {
        args: [referencia_nivel_tanque_cm.toString()]
      });
      
      const plcResult = JSON.parse(results[0]);
      
      if (!plcResult.success) {
        throw new Error(`Error al escribir en el PLC: ${plcResult.error}`);
      }
      
      // Si la escritura en el PLC fue exitosa, guardar en las bases de datos
      const nuevoSetpoint = {
        hora: new Date().toLocaleTimeString('es-CO', { timeZone: 'America/Bogota' }),
        referencia_nivel_tanque_cm: referencia_nivel_tanque_cm,
        origen: 'frontend'
      };

      // Guardar en la nube
      const setpoint = new SetpointModel(nuevoSetpoint);
      await setpoint.save();
      
      // Guardar localmente
      const setpointLocal = new SetpointModelLocal(nuevoSetpoint);
      await setpointLocal.save();
      
      console.log('Setpoint guardado en ambas bases de datos y escrito en PLC:', nuevoSetpoint);
      res.json({ 
        success: true, 
        setpoint: nuevoSetpoint, 
        plcResult: plcResult,
        message: 'Setpoint actualizado en PLC y bases de datos'
      });

    } catch (plcError) {
      console.error('Error al escribir en el PLC:', plcError);
      throw new Error(`Error al escribir en el PLC: ${plcError.message}`);
    }

  } catch (error) {
    console.error('Error al actualizar el setpoint:', error);
    res.status(500).json({ 
      error: 'Error al actualizar el setpoint',
      details: error.message
    });
  }
});

// Endpoint para actualizar los estados de los botones desde el frontend
app.post('/api/buttons', async (req, res) => {
  try {
    const { estado_boton_start, estado_boton_stop, estado_boton_paro_emergencia } = req.body;
    
    // Obtener la hora actual
    const hora = new Date().toLocaleTimeString('es-CO', { timeZone: 'America/Bogota' });

    // Preparar los datos para guardar
    const buttonData = {
      hora,
      estado_boton_start: estado_boton_start ? 1 : 0,
      estado_boton_stop: estado_boton_stop ? 1 : 0,
      estado_boton_paro_emergencia: estado_boton_paro_emergencia ? 1 : 0,
      origen: 'frontend'
    };

    // Guardar en la base de datos en la nube
    const data = new DataModel(buttonData);
    await data.save();
    
    // Guardar en la base de datos local
    const localData = new LocalDataModel(buttonData);
    await localData.save();

    // Intentar escribir en el PLC
    try {
      const results = await PythonShell.run('write_botones_plc.py', {
        args: [
          estado_boton_start.toString(),
          estado_boton_stop.toString(),
          estado_boton_paro_emergencia.toString()
        ]
      });
      
      const plcResult = JSON.parse(results[0]);
      
      if (!plcResult.success) {
        throw new Error(`Error al escribir en el PLC: ${plcResult.error}`);
      }
      
      console.log('Estados de botones guardados y escritos en PLC:', buttonData);
      res.json({ 
        success: true, 
        data: buttonData,
        plcResult: plcResult,
        message: 'Estados de botones actualizados en PLC y bases de datos'
      });

    } catch (plcError) {
      console.error('Error al escribir en el PLC:', plcError);
      // Aún así respondemos con éxito ya que se guardó en las bases de datos
      res.json({ 
        success: true, 
        data: buttonData,
        warning: 'Datos guardados en bases de datos pero no en PLC',
        plcError: plcError.message
      });
    }

  } catch (error) {
    console.error('Error al actualizar los estados de los botones:', error);
    res.status(500).json({ 
      error: 'Error al actualizar los estados de los botones',
      details: error.message
    });
  }
});

// ====================================================
// INICIO DEL SERVIDOR
// ====================================================

// Inicia el servidor en el puerto especificado
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
