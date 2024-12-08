import express from 'express';
import cors from 'cors';

import { errorHandler } from './middleware/errorHandler.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import { config } from './config/index.js';
import { apiRoutes } from './routes/index.js';

const app = express();




// Routes
app.use('/api', apiRoutes);

// Error Handling (moved to the end)
app.use(notFoundHandler);
app.use(errorHandler);

export { app };