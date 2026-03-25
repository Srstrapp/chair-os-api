import express from 'express';
import { inventory, inventoryLogs, wallets } from '../data/database.js';

const router = express.Router();

// Get inventory
router.get('/', (req, res) => {
  const { barbershop_id } = req.query;
  
  let result = [...inventory];
  
  if (barbershop_id) result = result.filter(i => i.barbershop_id === barbershop_id);
  
  result = result.map(item => ({
    ...item,
    needs_alert: item.current_stock <= item.min_stock
  }));
  
  res.json({
    success: true,
    data: result
  });
});

// Get inventory item
router.get('/:id', (req, res) => {
  const item = inventory.find(i => i.id === req.params.id);
  
  if (!item) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Producto no encontrado' }
    });
  }
  
  res.json({
    success: true,
    data: { ...item, needs_alert: item.current_stock <= item.min_stock }
  });
});

// Create inventory item
router.post('/', (req, res) => {
  const { barbershop_id, name, unit, cost_per_unit, min_stock, current_stock } = req.body;
  
  if (!name || !unit || cost_per_unit === undefined) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Faltan campos requeridos' }
    });
  }
  
  const newItem = {
    id: `inv-${Date.now()}`,
    barbershop_id: barbershop_id || 'shop-1',
    name,
    unit,
    cost_per_unit,
    min_stock: min_stock || 10,
    current_stock: current_stock || 0,
    updated_at: new Date().toISOString()
  };
  
  inventory.push(newItem);
  
  res.status(201).json({
    success: true,
    data: { ...newItem, needs_alert: newItem.current_stock <= newItem.min_stock }
  });
});

// Update inventory item
router.put('/:id', (req, res) => {
  const itemIndex = inventory.findIndex(i => i.id === req.params.id);
  
  if (itemIndex === -1) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Producto no encontrado' }
    });
  }
  
  const { name, unit, cost_per_unit, min_stock, current_stock } = req.body;
  
  if (name) inventory[itemIndex].name = name;
  if (unit) inventory[itemIndex].unit = unit;
  if (cost_per_unit !== undefined) inventory[itemIndex].cost_per_unit = cost_per_unit;
  if (min_stock !== undefined) inventory[itemIndex].min_stock = min_stock;
  if (current_stock !== undefined) inventory[itemIndex].current_stock = current_stock;
  inventory[itemIndex].updated_at = new Date().toISOString();
  
  res.json({
    success: true,
    data: { ...inventory[itemIndex], needs_alert: inventory[itemIndex].current_stock <= inventory[itemIndex].min_stock }
  });
});

// Use inventory item (descontar del inventario y del wallet del barbero)
router.post('/:id/use', (req, res) => {
  const item = inventory.find(i => i.id === req.params.id);
  
  if (!item) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Producto no encontrado' }
    });
  }
  
  const { barber_id, quantity, service_id } = req.body;
  
  if (!barber_id || !quantity) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Barbero y cantidad requeridos' }
    });
  }
  
  if (quantity > item.current_stock) {
    return res.status(400).json({
      success: false,
      error: { code: 'INSUFFICIENT_STOCK', message: 'Stock insuficiente' }
    });
  }
  
  // Descontar del inventario
  item.current_stock -= quantity;
  item.updated_at = new Date().toISOString();
  
  // Registrar uso
  const log = {
    id: `inv-log-${Date.now()}`,
    inventory_id: item.id,
    barber_id,
    quantity,
    service_id: service_id || null,
    created_at: new Date().toISOString()
  };
  inventoryLogs.push(log);
  
  // Descontar del wallet del barbero
  const wallet = wallets.find(w => w.barber_id === barber_id);
  const cost = item.cost_per_unit * quantity;
  
  if (wallet) {
    wallet.balance_usd -= cost;
    wallet.updated_at = new Date().toISOString();
  }
  
  res.json({
    success: true,
    data: {
      inventory: { ...item, needs_alert: item.current_stock <= item.min_stock },
      wallet_debit: wallet ? {
        barber_id,
        amount: cost,
        new_balance: wallet.balance_usd
      } : null
    }
  });
});

// Get inventory logs
router.get('/:id/logs', (req, res) => {
  const logs = inventoryLogs.filter(l => l.inventory_id === req.params.id);
  
  logs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  
  res.json({
    success: true,
    data: logs
  });
});

export default router;
