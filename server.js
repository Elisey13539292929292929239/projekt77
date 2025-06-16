import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
const app = express();

import bodyParser from 'body-parser';
import path from 'path';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';

import animeListRouter from './routes/animeListRoutes.js';
import connectDB from './config/dbConnection.js';
import { swaggerUi, swaggerSpec } from './swagger.js';

import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

app.use(cookieParser());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

import { checkUser } from './middleware/authMiddleware.js';
app.use('*', checkUser);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/', animeListRouter);

connectDB();

const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'test') {
  mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  });
}

app.use((err, req, res, next) => {
  console.error('❌ GLOBAL ERROR:', err.stack || err);
  res.status(500).send('Internal Server Error');
});

export default app;
