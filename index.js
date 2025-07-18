// index.js
import 'dotenv/config'
import express from 'express';
import webhooksRouter from './routes/webhooks.js';
import adminRouter from './routes/admin.js';

const app = express();
app.use(express.json());

// Set up routes
app.use('/', webhooksRouter); // Handles /instagram
app.use('/admin', adminRouter); // Handles /admin/postdata

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server is listening on port ${port}`));