import express from 'express';
import { barbershops, barbers, wallets, services, cashBoxes, inventory, customers, appointments } from '../data/database.js';

const router = express.Router();

// Get all barbershops (para el owner)
router.get('/', (req, res) => {
  const result = barbershops.map(shop => ({
    ...shop,
    // Calculamos ventas del día
    today_sales: services
      .filter(s => s.barbershop_id === shop.id && s.created_at.startsWith('2026-03-25'))
      .reduce((sum, s) => sum + s.amount_total, 0),
    barbers_count: barbers.filter(b => b.barbershop_id === shop.id && b.is_active).length
  }));
  
  res.json({
    success: true,
    data: result
  });
});

// Get single barbershop
router.get('/:id', (req, res) => {
  const shop = barbershops.find(s => s.id === req.params.id);
  
  if (!shop) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Barbería no encontrada'
      }
    });
  }
  
  res.json({
    success: true,
    data: shop
  });
});

// Update barbershop
router.put('/:id', (req, res) => {
  const shopIndex = barbershops.findIndex(s => s.id === req.params.id);
  
  if (shopIndex === -1) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Barbería no encontrada'
      }
    });
  }
  
  const { name, address, phone, zelle_min, pay_day, pay_day_num, bcv_rate_today } = req.body;
  
  if (name) barbershops[shopIndex].name = name;
  if (address) barbershops[shopIndex].address = address;
  if (phone) barbershops[shopIndex].phone = phone;
  if (zelle_min !== undefined) barbershops[shopIndex].zelle_min = zelle_min;
  if (pay_day) barbershops[shopIndex].pay_day = pay_day;
  if (pay_day_num !== undefined) barbershops[shopIndex].pay_day_num = pay_day_num;
  if (bcv_rate_today !== undefined) barbershops[shopIndex].bcv_rate_today = bcv_rate_today;
  
  res.json({
    success: true,
    data: barbershops[shopIndex]
  });
});

// Get barbers from barbershop
router.get('/:id/barbers', (req, res) => {
  const shopBarbers = barbers
    .filter(b => b.barbershop_id === req.params.id && b.is_active)
    .map(barber => {
      const wallet = wallets.find(w => w.barber_id === barber.id);
      return {
        ...barber,
        wallet_balance: wallet ? wallet.balance_usd : 0
      };
    });
  
  res.json({
    success: true,
    data: shopBarbers
  });
});

// Get services from barbershop
router.get('/:id/services', (req, res) => {
  const { date_from, date_to, barber_id, status } = req.query;
  
  let shopServices = services.filter(s => s.barbershop_id === req.params.id);
  
  if (date_from) {
    shopServices = shopServices.filter(s => s.created_at >= date_from);
  }
  if (date_to) {
    shopServices = shopServices.filter(s => s.created_at <= date_to);
  }
  if (barber_id) {
    shopServices = shopServices.filter(s => s.barber_id === barber_id);
  }
  if (status) {
    shopServices = shopServices.filter(s => s.status === status);
  }
  
  // Ordenar por fecha descendente
  shopServices.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  
  res.json({
    success: true,
    data: shopServices
  });
});

// Create service
router.post('/:id/services', (req, res) => {
  const shop = barbershops.find(s => s.id === req.params.id);
  if (!shop) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Barbería no encontrada' }
    });
  }
  
  const { barber_id, customer_id, customer_name, customer_phone, service_type, amount_total, payment_method, tip_amount, products_used } = req.body;
  
  const barber = barbers.find(b => b.id === barber_id);
  if (!barber) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Barbero no encontrado' }
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
    barbershop_id: req.params.id,
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
  
  // Actualizar wallet del barbero
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
      },
      message: 'Servicio registrado exitosamente'
    }
  });
});

// Get inventory from barbershop
router.get('/:id/inventory', (req, res) => {
  const shopInventory = inventory
    .filter(i => i.barbershop_id === req.params.id)
    .map(item => ({
      ...item,
      needs_alert: item.current_stock <= item.min_stock
    }));
  
  res.json({
    success: true,
    data: shopInventory
  });
});

// Get customers from barbershop
router.get('/:id/customers', (req, res) => {
  const { search, has_credit } = req.query;
  
  let shopCustomers = customers.filter(c => c.barbershop_id === req.params.id && c.is_active);
  
  if (search) {
    const searchLower = search.toLowerCase();
    shopCustomers = shopCustomers.filter(c => 
      c.name.toLowerCase().includes(searchLower) || 
      c.phone.includes(search)
    );
  }
  
  if (has_credit === 'true') {
    shopCustomers = shopCustomers.filter(c => c.credit_balance > 0);
  }
  
  res.json({
    success: true,
    data: shopCustomers
  });
});

// Get cash boxes from barbershop
router.get('/:id/cash-boxes', (req, res) => {
  const { date_from, date_to } = req.query;
  
  let shopBoxes = cashBoxes.filter(c => c.barbershop_id === req.params.id);
  
  if (date_from) {
    shopBoxes = shopBoxes.filter(c => c.date >= date_from);
  }
  if (date_to) {
    shopBoxes = shopBoxes.filter(c => c.date <= date_to);
  }
  
  shopBoxes.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  res.json({
    success: true,
    data: shopBoxes
  });
});

// Open cash box
router.post('/:id/cash-boxes', (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  
  // Verificar si ya hay caja abierta hoy
  const existingBox = cashBoxes.find(c => 
    c.barbershop_id === req.params.id && 
    c.date === today && 
    c.status === 'OPEN'
  );
  
  if (existingBox) {
    return res.json({
      success: true,
      data: existingBox
    });
  }
  
  const newBox = {
    id: `cash-${Date.now()}`,
    barbershop_id: req.params.id,
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

// Update cash box (register income/expense)
router.put('/:id/cash-boxes/:boxId', (req, res) => {
  const box = cashBoxes.find(c => c.id === req.params.boxId && c.barbershop_id === req.params.id);
  
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
    if (currency === 'BS') {
      box.total_expenses += amount;
    }
  }
  
  res.json({
    success: true,
    data: box
  });
});

// Close cash box
router.put('/:id/cash-boxes/:boxId/close', (req, res) => {
  const box = cashBoxes.find(c => c.id === req.params.boxId && c.barbershop_id === req.params.id);
  
  if (!box) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Caja no encontrada' }
    });
  }
  
  box.status = 'CLOSED';
  box.closed_by = 'user-3'; // Mock: cashier
  box.closed_at = new Date().toISOString();
  
  res.json({
    success: true,
    data: {
      ...box,
      totals: {
        income_usd: box.total_usd,
        income_bs: box.total_bs,
        expenses_bs: box.total_expenses,
        owner_withdrawals: 0
      }
    }
  });
});

// Get appointments from barbershop
router.get('/:id/appointments', (req, res) => {
  const { date, barber_id, status } = req.query;
  
  let shopAppointments = appointments.filter(a => a.barbershop_id === req.params.id);
  
  if (date) {
    shopAppointments = shopAppointments.filter(a => a.date === date);
  }
  if (barber_id) {
    shopAppointments = shopAppointments.filter(a => a.barber_id === barber_id);
  }
  if (status) {
    shopAppointments = shopAppointments.filter(a => a.status === status);
  }
  
  shopAppointments.sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.time.localeCompare(b.time);
  });
  
  res.json({
    success: true,
    data: shopAppointments
  });
});

// Get available slots
router.get('/:id/appointments/available-slots', (req, res) => {
  const { date, barber_id } = req.query;
  
  // Slots disponibles (9 AM a 7 PM, cada 30 min)
  const allSlots = [];
  for (let h = 9; h < 19; h++) {
    allSlots.push(`${h.toString().padStart(2, '0')}:00`);
    allSlots.push(`${h.toString().padStart(2, '0')}:30`);
  }
  
  // Filtrar barberos
  let shopBarbers = barbers.filter(b => b.barbershop_id === req.params.id && b.is_active);
  if (barber_id) {
    shopBarbers = shopBarbers.filter(b => b.id === barber_id);
  }
  
  const result = shopBarbers.map(barber => {
    // Obtener citas del día para este barbero
    const bookedSlots = appointments
      .filter(a => a.barbershop_id === req.params.id && a.barber_id === barber.id && a.date === date)
      .map(a => a.time);
    
    const availableSlots = allSlots.filter(slot => !bookedSlots.includes(slot));
    
    return {
      barber_id: barber.id,
      barber_name: barber.name,
      slots: availableSlots
    };
  });
  
  res.json({
    success: true,
    data: {
      date: date || new Date().toISOString().split('T')[0],
      barbers: result
    }
  });
});

// Get dashboard for barbershop
router.get('/:id/dashboard', (req, res) => {
  const shopId = req.params.id;
  const shop = barbershops.find(s => s.id === shopId);
  
  // Servicios de hoy
  const todayServices = services.filter(s => 
    s.barbershop_id === shopId && 
    s.created_at.startsWith('2026-03-25') &&
    s.status === 'completed'
  );
  
  // Servicios de la semana
  const weekServices = services.filter(s => 
    s.barbershop_id === shopId &&
    s.created_at >= '2026-03-19' &&
    s.status === 'completed'
  );
  
  // Servicios del mes
  const monthServices = services.filter(s => 
    s.barbershop_id === shopId &&
    s.created_at >= '2026-03-01' &&
    s.status === 'completed'
  );
  
  // Resumen por barbero
  const barbersSummary = barbers
    .filter(b => b.barbershop_id === shopId && b.is_active)
    .map(barber => {
      const wallet = wallets.find(w => w.barber_id === barber.id);
      const barberTodayServices = todayServices.filter(s => s.barber_id === barber.id);
      return {
        id: barber.id,
        name: barber.name,
        commission_type: barber.commission_type,
        today_services: barberTodayServices.length,
        wallet_balance: wallet ? wallet.balance_usd : 0
      };
    });
  
  // Productos con stock bajo
  const lowStockItems = inventory
    .filter(i => i.barbershop_id === shopId && i.current_stock <= i.min_stock);
  
  // Próximas citas
  const upcomingAppointments = appointments
    .filter(a => a.barbershop_id === shopId && a.status !== 'cancelled')
    .slice(0, 5);
  
  res.json({
    success: true,
    data: {
      today: {
        services_count: todayServices.length,
        total_sales_usd: todayServices.reduce((sum, s) => sum + s.amount_total, 0),
        total_sales_bs: todayServices.reduce((sum, s) => sum + s.amount_bs, 0),
        owner_earnings: todayServices.reduce((sum, s) => sum + s.amount_owner, 0),
        tips_total: todayServices.reduce((sum, s) => sum + s.tip_amount, 0)
      },
      week: {
        services_count: weekServices.length,
        total_sales_usd: weekServices.reduce((sum, s) => sum + s.amount_total, 0)
      },
      month: {
        services_count: monthServices.length,
        total_sales_usd: monthServices.reduce((sum, s) => sum + s.amount_total, 0)
      },
      barbers: barbersSummary,
      low_stock_items: lowStockItems,
      upcoming_appointments: upcomingAppointments,
      bcv_rate: shop ? shop.bcv_rate_today : BCV_RATE
    }
  });
});

// BCV Rate
router.get('/:id/bcv-rate', (req, res) => {
  const shop = barbershops.find(s => s.id === req.params.id);
  
  res.json({
    success: true,
    data: {
      rate: shop ? shop.bcv_rate_today : 36.50,
      source: 'BCV',
      updated_at: new Date().toISOString()
    }
  });
});

// Update BCV Rate
router.put('/:id/bcv-rate', (req, res) => {
  const shopIndex = barbershops.findIndex(s => s.id === req.params.id);
  
  if (shopIndex === -1) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Barbería no encontrada' }
    });
  }
  
  barbershops[shopIndex].bcv_rate_today = req.body.rate;
  
  res.json({
    success: true,
    data: {
      rate: req.body.rate,
      source: 'MANUAL',
      updated_at: new Date().toISOString()
    }
  });
});

export default router;
