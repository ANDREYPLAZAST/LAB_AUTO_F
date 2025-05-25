const express = require('express');
const router = express.Router();
const pidController = require('../controllers/pidController');

// Ruta para actualizar el PID
router.post('/pid', pidController.setPID);

module.exports = router; 