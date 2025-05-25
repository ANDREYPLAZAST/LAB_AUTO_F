const express = require('express');
const router = express.Router();
const DataController = require('../controllers/dataController');

router.get('/data', DataController.getLatestData);
router.get('/data/history', DataController.getHistory);

module.exports = router; 