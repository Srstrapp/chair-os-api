import express from 'express';
import { wallets, walletLogs } from '../data/database.js';

const router = express.Router();

// Get wallet by barber ID
router.get('/:barberId', (req, res) => {
  const wallet = wallets.find(w => w.barber_id === req.params.barberId);
  
  if (!wallet) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Wallet no encontrada' }
    });
  }
  
  res.json({
    success: true,
    data: wallet
  });
});

// Get wallet logs
router.get('/:barberId/logs', (req, res) => {
  const { page = 1, limit = 20, type } = req.query;
  
  let logs = walletLogs.filter(l => l.wallet_id === wallets.find(w => w.barber_id === req.params.barberId)?.id);
  
  if (type) {
    logs = logs.filter(l => l.type === type);
  }
  
  logs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  
  res.json({
    success: true,
    data: {
      logs: logs.slice(0, parseInt(limit)),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: logs.length
      }
    }
  });
});

export default router;
