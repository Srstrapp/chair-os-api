import express from 'express';
import { barbers, wallets, services, payouts, barbershops } from '../data/database.js';

const router = express.Router();

// Get all barbers
router.get('/', (req, res) => {
  const allBarbers = barbers.map(barber => {
    const wallet = wallets.find(w => w.barber_id === barber.id);
    const shop = barbershops.find(s => s.id === barber.barbershop_id);
    return {
      ...barber,
      wallet_balance: wallet ? wallet.balance_usd : 0,
      barbershop_name: shop ? shop.name : 'Unknown'
    };
  });
  
  res.json({
    success: true,
    data: allBarbers
  });
});

// Get barber by ID
router.get('/:id', (req, res) => {
  const barber = barbers.find(b => b.id === req.params.id);
  
  if (!barber) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Barbero no encontrado' }
    });
  }
  
  const wallet = wallets.find(w => w.barber_id === barber.id);
  const shop = barbershops.find(s => s.id === barber.barbershop_id);
  
  res.json({
    success: true,
    data: {
      ...barber,
      wallet: wallet || { balance_usd: 0, balance_bs: 0 },
      barbershop_name: shop ? shop.name : 'Unknown'
    }
  });
});

// Get barber wallet
router.get('/:id/wallet', (req, res) => {
  const wallet = wallets.find(w => w.barber_id === req.params.id);
  
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

// Get barber wallet logs
router.get('/:id/wallet/logs', (req, res) => {
  const wallet = wallets.find(w => w.barber_id === req.params.id);
  
  if (!wallet) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Wallet no encontrada' }
    });
  }
  
  const { page = 1, limit = 20, type } = req.query;
  
  let logs = []; // TODO: Implementar logs por wallet
  
  // Por ahora retornamos servicios del barbero como historial
  const barberServices = services
    .filter(s => s.barber_id === req.params.id)
    .slice(0, parseInt(limit))
    .map(s => ({
      id: `log-${s.id}`,
      type: 'credit',
      amount: s.amount_barber,
      description: `${s.service_type} - $${s.amount_total}`,
      service_id: s.id,
      created_at: s.created_at
    }));
  
  res.json({
    success: true,
    data: {
      logs: barberServices,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: barberServices.length
      }
    }
  });
});

// Create barber
router.post('/', (req, res) => {
  const { barbershop_id, name, phone, email, commission_type } = req.body;
  
  if (!name || !phone || !commission_type) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Faltan campos requeridos' }
    });
  }
  
  const commissions = {
    '50_50': { owner: 50, barber: 50 },
    '60_40': { owner: 60, barber: 40 },
    'salary': { owner: 100, barber: 0 }
  };
  
  const newBarber = {
    id: `barber-${Date.now()}`,
    barbershop_id: barbershop_id || 'shop-1',
    name,
    phone,
    email: email || null,
    commission_type,
    commission_owner: commissions[commission_type]?.owner || 50,
    commission_barber: commissions[commission_type]?.barber || 50,
    is_active: true,
    created_at: new Date().toISOString()
  };
  
  barbers.push(newBarber);
  
  // Crear wallet para el barbero
  const newWallet = {
    id: `wallet-${Date.now()}`,
    barber_id: newBarber.id,
    balance_usd: 0,
    balance_bs: 0,
    updated_at: new Date().toISOString()
  };
  wallets.push(newWallet);
  
  res.status(201).json({
    success: true,
    data: {
      ...newBarber,
      wallet: newWallet
    }
  });
});

// Update barber
router.put('/:id', (req, res) => {
  const barberIndex = barbers.findIndex(b => b.id === req.params.id);
  
  if (barberIndex === -1) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Barbero no encontrado' }
    });
  }
  
  const { name, phone, email, commission_type } = req.body;
  
  if (name) barbers[barberIndex].name = name;
  if (phone) barbers[barberIndex].phone = phone;
  if (email !== undefined) barbers[barberIndex].email = email;
  
  if (commission_type) {
    const commissions = {
      '50_50': { owner: 50, barber: 50 },
      '60_40': { owner: 60, barber: 40 },
      'salary': { owner: 100, barber: 0 }
    };
    barbers[barberIndex].commission_type = commission_type;
    barbers[barberIndex].commission_owner = commissions[commission_type].owner;
    barbers[barberIndex].commission_barber = commissions[commission_type].barber;
  }
  
  res.json({
    success: true,
    data: barbers[barberIndex]
  });
});

// Delete barber (soft delete)
router.delete('/:id', (req, res) => {
  const barberIndex = barbers.findIndex(b => b.id === req.params.id);
  
  if (barberIndex === -1) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Barbero no encontrado' }
    });
  }
  
  barbers[barberIndex].is_active = false;
  
  res.json({
    success: true,
    data: { message: 'Barbero desactivado' }
  });
});

// Get barber payouts
router.get('/:id/payouts', (req, res) => {
  const barberPayouts = payouts.filter(p => p.barber_id === req.params.id);
  
  barberPayouts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  
  res.json({
    success: true,
    data: barberPayouts
  });
});

export default router;
