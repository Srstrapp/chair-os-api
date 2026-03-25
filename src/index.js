import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

// Routes
import authRoutes from './routes/auth.js';
import barbershopRoutes from './routes/barbershops.js';
import barberRoutes from './routes/barbers.js';
import serviceRoutes from './routes/services.js';
import walletRoutes from './routes/wallet.js';
import cashBoxRoutes from './routes/cashBox.js';
import inventoryRoutes from './routes/inventory.js';
import customerRoutes from './routes/customers.js';
import dashboardRoutes from './routes/dashboard.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: '*', // Permitir todos los orígenes para el prototipo
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/barbershops', barbershopRoutes);
app.use('/api/v1/barbers', barberRoutes);
app.use('/api/v1/services', serviceRoutes);
app.use('/api/v1/wallet', walletRoutes);
app.use('/api/v1/cash-box', cashBoxRoutes);
app.use('/api/v1/inventory', inventoryRoutes);
app.use('/api/v1/customers', customerRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Error interno del servidor'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Ruta ${req.method} ${req.path} no encontrada`
    }
  });
});

app.listen(PORT, () => {
  console.log(`
  ╔═══════════════════════════════════════════════════════╗
  ║                                                       ║
  ║   🪮 CHAIR-OS API - Sistema Operativo para Barberías ║
  ║                                                       ║
  ║   🚀 Server running on port ${PORT}                     ║
  ║   📚 API Docs: http://localhost:${PORT}/api/v1          ║
  ║                                                       ║
  ╚═══════════════════════════════════════════════════════╝
  `);
});

export default app;
