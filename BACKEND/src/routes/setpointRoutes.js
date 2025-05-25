const express = require('express');
const router = express.Router();
const SetpointController = require('../controllers/setpointController');

router.get('/setpoint', SetpointController.getLatestSetpoint);
router.post('/setpoint', SetpointController.updateSetpoint);

module.exports = router; 