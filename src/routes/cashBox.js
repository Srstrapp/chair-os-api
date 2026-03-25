import express from 'express';
import { cashBoxes, expenses } from '../data/database.js';

const router = express.Router();

// Get cash boxes
router.get('/', (req, res) => {
  const { barbershop_id, date_from, date_to } = req.query;
  
  let result = [...cashBoxes];
  
  if (barbershop_id) result = result.filter(c => c.barbershop_id === barbershop_id);
  if (date_from) result = result.filter(c => c.date >= date_from);
  if (date_to) result = result.filter(c => c.date <= date_to);
  
  result.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  res.json({
    success: true,
    data: result
  });
});

// Get cash box by ID
router.get('/:id', (req, res) => {
  const box = cashBoxes.find(c => c.id === req.params.id);
  
  if (!box) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Caja no encontrada' }
    });
  }
  
  res.json({
    success: true,
    data: box
  });
});

// Open cash box
router.post('/', (req, res) => {
  const { barbershop_id } = req.body;
  const today = new Date().toISOString().split('T')[0];
  
  const existingBox = cashBoxes.find(c => 
    c.barbershop_id === barbershop_id && 
    c.date === today && 
    c.status === 'OPEN'
  );
  
  if (existingBox) {
    return res.json({ success: true, data: existingBox });
  }
  
  const newBox = {
    id: `cash-${Date.now()}`,
    barbershop_id: barbershop_id || 'shop-1',
    date: today,
    total_usd: 0,
    total_bs: 0,
    total_zelle: 0,
    total_paymobile: 0,
    total_crypto: 0,
    total_expenses: 0,
    status: 'OPEN',
    closed_by: null,
    closed_at: null,
    created_at: new Date().toISOString()
  };
  
  cashBoxes.push(newBox);
  
  res.status(201).json({
    success: true,
    data: newBox
  });
});

// Update cash box
router.put('/:id', (req, res) => {
  const box = cashBoxes.find(c => c.id === req.params.id);
  
  if (!box) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Caja no encontrada' }
    });
  }
  
  if (box.status === 'CLOSED') {
    return res.status(400).json({
      success: false,
      error: { code: 'CASH_BOX_CLOSED', message: 'La caja ya está cerrada' }
    });
  }
  
  const { type, amount, currency, payment_method, category, description } = req.body;
  
  if (type === 'income') {
    if (currency === 'USD') {
      box.total_usd += amount;
      if (payment_method === 'ZELLE') box.total_zelle += amount;
      if (payment_method === 'PAYMOBILE') box.total_paymobile += amount;
      if (payment_method === 'CRYPTO') box.total_crypto += amount;
    } else {
      box.total_bs += amount;
    }
  } else if (type === 'expense') {
    if (currency === 'BS') box.total_expenses += amount;
    
    // Registrar gasto
    expenses.push({
      id: `exp-${Date.now()}`,
      barbershop_id: box.barbershop_id,
      cash_box_id: box.id,
      cashier_id: 'user-3',
      amount,
      currency,
      category: category || 'other',
      description: description || '',
      created_at: new Date().toISOString()
    });
  }
  
  res.json({
    success: true,
    data: box
  });
});

// Close cash box
router.put('/:id/close', (req, res) => {
  const box = cashBoxes.find(c => c.id === req.params.id);
  
  if (!box) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Caja no encontrada' }
    });
  }
  
  box.status = 'CLOSED';
  box.closed_by = 'user-3';
  box.closed_at = new Date().toISOString();
  
  res.json({
    success: true,
    data: box
  });
});

export default router;
