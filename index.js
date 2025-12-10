// index.js
import 'dotenv/config'
import express from 'express';
import cors from 'cors';
import webhooksRouter from './routes/webhooks.js';
import adminRouter from './routes/admin.js';
import { checkDbConnection } from './services/database.js';


const app = express();
app.use(cors()); // Enable CORS for all routes
app.use(express.json());
const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // 1. CONNECT to Redis and wait for it to be ready
    console.log('Attempting to connect to database...');
    await checkDbConnection(); // Check if we can connect to the database
    console.log('Database connection successful!');

    // 2. CONFIGURE Express routes AFTER the database is connected
    app.use('/admin', adminRouter);
    app.use('/', webhooksRouter);

    // Add a root route for health checks
    app.get('/', (req, res) => {
      res.status(200).send('Server is running and db is connected.');
    });

    // 3. LISTEN for requests only when everything is ready
    app.listen(PORT, () => {
      console.log(`Server is listening on port ${PORT}`);
    });

  } catch (err) {
    console.error('Failed to start the server:', err);
    process.exit(1); // Exit if we can't connect to Redis
  }
}

// --- Run the server ---
startServer();