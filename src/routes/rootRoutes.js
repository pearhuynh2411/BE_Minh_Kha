import express from 'express';

import authRoutes from './authRoutes.js';

// define object rootRoutes
const rootRoutes = express.Router();


rootRoutes.use("/auth", authRoutes);
export default rootRoutes;