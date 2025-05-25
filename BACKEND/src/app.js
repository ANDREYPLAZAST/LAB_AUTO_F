require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectCloudDB, connectLocalDB } = require('./config/database');
const dataRoutes = require('./routes/dataRoutes');
const setpointRoutes = require('./routes/setpointRoutes');
const errorHandler = require('./middleware/errorHandler');
const DataController = require('./controllers/dataController');
const pidRoutes = require('./routes/pidRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api', dataRoutes);
app.use('/api', setpointRoutes);
app.use('/api', pidRoutes);

// Error handling
app.use(errorHandler);

// PLC Data Polling
let isProcessing = false;
let intervalId;

async function startPLCPolling() {
  try {
    await connectCloudDB();
    const localConnection = await connectLocalDB();
    
    intervalId = setInterval(async () => {
      if (!isProcessing) {
        isProcessing = true;
        try {
          await DataController.processPLCData();
        } catch (error) {
          console.error('Error in PLC polling cycle:', error);
        } finally {
          isProcessing = false;
        }
      }
    }, 1000);
    
    console.log('PLC polling started');
  } catch (error) {
    console.error('Error starting PLC polling:', error);
    process.exit(1);
  }
}

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  startPLCPolling();
});

// Handle process termination
process.on('SIGTERM', () => {
  clearInterval(intervalId);
  process.exit(0);
});

process.on('SIGINT', () => {
  clearInterval(intervalId);
  process.exit(0);
}); 