import express from 'express';
import { customers, services } from '../data/database.js';

const router = express.Router();

// Get customers
router.get('/', (req, res) => {
  const { barbershop_id, search, has_credit } = req.query;
  
  let result = customers.filter(c => c.is_active);
  
  if (barbershop_id) result = result.filter(c => c.barbershop_id === barbershop_id);
  
  if (search) {
    const searchLower = search.toLowerCase();
    result = result.filter(c => 
      c.name.toLowerCase().includes(searchLower) || 
      c.phone.includes(search)
    );
  }
  
  if (has_credit === 'true') {
    result = result.filter(c => c.credit_balance > 0);
  }
  
  // Agregar stats
  result = result.map(customer => {
    const customerServices = services.filter(s => s.customer_id === customer.id);
    return {
      ...customer,
      services_count: customerServices.length,
      last_visit: customerServices[0]?.created_at || null
    };
  });
  
  res.json({
    success: true,
    data: result
  });
});

// Get customer by ID
router.get('/:id', (req, res) => {
  const customer = customers.find(c => c.id === req.params.id);
  
  if (!customer) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Cliente no encontrado' }
    });
  }
  
  const customerServices = services.filter(s => s.customer_id === customer.id);
  
  res.json({
    success: true,
    data: {
      ...customer,
      services_count: customerServices.length,
      services: customerServices.slice(0, 10),
      last_visit: customerServices[0]?.created_at || null
    }
  });
});

// Create customer
router.post('/', (req, res) => {
  const { barbershop_id, name, phone, favorite_barber_id } = req.body;
  
  if (!name || !phone) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Nombre y teléfono requeridos' }
    });
  }
  
  const newCustomer = {
    id: `cust-${Date.now()}`,
    barbershop_id: barbershop_id || 'shop-1',
    name,
    phone,
    favorite_barber_id: favorite_barber_id || null,
    credit_balance: 0,
    is_active: true,
    created_at: new Date().toISOString()
  };
  
  customers.push(newCustomer);
  
  res.status(201).json({
    success: true,
    data: newCustomer
  });
});

// Update customer
router.put('/:id', (req, res) => {
  const customerIndex = customers.findIndex(c => c.id === req.params.id);
  
  if (customerIndex === -1) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Cliente no encontrado' }
    });
  }
  
  const { name, phone, favorite_barber_id, credit_balance } = req.body;
  
  if (name) customers[customerIndex].name = name;
  if (phone) customers[customerIndex].phone = phone;
  if (favorite_barber_id !== undefined) customers[customerIndex].favorite_barber_id = favorite_barber_id;
  if (credit_balance !== undefined) customers[customerIndex].credit_balance = credit_balance;
  
  res.json({
    success: true,
    data: customers[customerIndex]
  });
});

// Add credit to customer
router.post('/:id/credit', (req, res) => {
  const customer = customers.find(c => c.id === req.params.id);
  
  if (!customer) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Cliente no encontrado' }
    });
  }
  
  const { amount, description } = req.body;
  
  customer.credit_balance += amount;
  
  res.json({
    success: true,
    data: customer
  });
});

export default router;
