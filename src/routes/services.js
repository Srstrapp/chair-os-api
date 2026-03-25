import express from 'express';
import { services, barbers, wallets, inventory, barbershops } from '../data/database.js';

const router = express.Router();

// Get all services
router.get('/', (req, res) => {
  const { barbershop_id, date_from, date_to, barber_id, status } = req.query;
  
  let result = [...services];
  
  if (barbershop_id) result = result.filter(s => s.barbershop_id === barbershop_id);
  if (barber_id) result = result.filter(s => s.barber_id === barber_id);
  if (status) result = result.filter(s => s.status === status);
  if (date_from) result = result.filter(s => s.created_at >= date_from);
  if (date_to) result = result.filter(s => s.created_at <= date_to);
  
  result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  
  res.json({
    success: true,
    data: result
  });
});

// Get service by ID
router.get('/:id', (req, res) => {
  const service = services.find(s => s.id === req.params.id);
  
  if (!service) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Servicio no encontrado' }
    });
  }
  
  res.json({
    success: true,
    data: service
  });
});

// Create service
router.post('/', (req, res) => {
  const { barbershop_id, barber_id, customer_id, customer_name, customer_phone, service_type, amount_total, payment_method, tip_amount, products_used } = req.body;
  
  const shop = barbershops.find(s => s.id === barbershop_id);
  const barber = barbers.find(b => b.id === barber_id);
  
  if (!shop || !barber) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Barbershop o barbero no válido' }
    });
  }
  
  // Validar mínimo Zelle
  if (payment_method === 'ZELLE' && amount_total < shop.zelle_min) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'ZELLE_MIN_NOT_MET',
        message: `Monto mínimo para Zelle: $${shop.zelle_min}`
      }
    });
  }
  
  // Calcular distribución
  const amount_owner = amount_total * (barber.commission_owner / 100);
  let amount_barber = amount_total * (barber.commission_barber / 100);
  let products_cost = 0;
  
  // Descontar productos
  if (products_used && products_used.length > 0) {
    for (const use of products_used) {
      const item = inventory.find(i => i.id === use.inventory_id);
      if (item) {
        products_cost += item.cost_per_unit * use.quantity;
        item.current_stock -= use.quantity;
      }
    }
    amount_barber -= products_cost;
  }
  
  const newService = {
    id: `svc-${Date.now()}`,
    barbershop_id,
    barber_id,
    barber_name: barber.name,
    customer_id: customer_id || null,
    customer_name: customer_name || 'Cliente anónimo',
    customer_phone: customer_phone || '',
    service_type: service_type || 'Corte',
    amount_total,
    amount_owner,
    amount_barber,
    products_cost,
    tip_amount: tip_amount || 0,
    payment_method,
    currency: 'USD',
    bcv_rate: shop.bcv_rate_today,
    amount_bs: amount_total * shop.bcv_rate_today,
    status: 'completed',
    created_at: new Date().toISOString()
  };
  
  services.unshift(newService);
  
  // Actualizar wallet
  const wallet = wallets.find(w => w.barber_id === barber_id);
  if (wallet) {
    wallet.balance_usd += amount_barber + (tip_amount || 0);
    wallet.balance_bs += (amount_barber + (tip_amount || 0)) * shop.bcv_rate_today;
    wallet.updated_at = new Date().toISOString();
  }
  
  res.status(201).json({
    success: true,
    data: {
      ...newService,
      wallet_updated: {
        barber_id,
        new_balance: wallet ? wallet.balance_usd : 0
      }
    }
  });
});

// Cancel service
router.put('/:id/cancel', (req, res) => {
  const serviceIndex = services.findIndex(s => s.id === req.params.id);
  
  if (serviceIndex === -1) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Servicio no encontrado' }
    });
  }
  
  services[serviceIndex].status = 'cancelled';
  
  res.json({
    success: true,
    data: services[serviceIndex]
  });
});

export default router;
