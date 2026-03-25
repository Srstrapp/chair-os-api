// Mock Database - Simula la base de datos para el prototipo
import { v4 as uuidv4 } from 'uuid';

// Tasa BCV del día
export const BCV_RATE = 36.50;

// ==================== USERS ====================
export const users = [
  {
    id: 'user-1',
    email: 'owner@barbershop.com',
    password: 'password123', // En producción sería hash
    name: 'Juan Pérez',
    phone: '+584121234567',
    role: 'OWNER',
    created_at: '2026-01-01T00:00:00Z'
  },
  {
    id: 'user-2',
    email: 'barber1@barbershop.com',
    password: 'password123',
    name: 'Carlos Mendoza',
    phone: '+584141234567',
    role: 'BARBER',
    created_at: '2026-01-15T00:00:00Z'
  },
  {
    id: 'user-3',
    email: 'cashier@barbershop.com',
    password: 'password123',
    name: 'María López',
    phone: '+584151234567',
    role: 'CASHIER',
    created_at: '2026-02-01T00:00:00Z'
  }
];

// ==================== BARBERSHOPS ====================
export const barbershops = [
  {
    id: 'shop-1',
    owner_id: 'user-1',
    name: 'Barbería Central',
    address: 'Av. Libertador, Caracas',
    phone: '+582121234567',
    logo_url: null,
    bcv_rate_today: BCV_RATE,
    zelle_min: 5.00,
    pay_day: 'biweekly',
    pay_day_num: 1, // Lunes
    is_active: true,
    created_at: '2026-01-01T00:00:00Z'
  },
  {
    id: 'shop-2',
    owner_id: 'user-1',
    name: 'Barbería Norte',
    address: 'Calle 5, Maracay',
    phone: '+582431234567',
    logo_url: null,
    bcv_rate_today: BCV_RATE,
    zelle_min: 3.00,
    pay_day: 'weekly',
    pay_day_num: 5, // Viernes
    is_active: true,
    created_at: '2026-02-15T00:00:00Z'
  }
];

// ==================== BARBERS ====================
export const barbers = [
  {
    id: 'barber-1',
    barbershop_id: 'shop-1',
    user_id: 'user-2',
    name: 'Carlos Mendoza',
    phone: '+584141234567',
    email: 'carlos@email.com',
    commission_type: '60_40',
    commission_owner: 60,
    commission_barber: 40,
    is_active: true,
    created_at: '2026-01-15T00:00:00Z'
  },
  {
    id: 'barber-2',
    barbershop_id: 'shop-1',
    name: 'Miguel Torres',
    phone: '+584161234567',
    email: 'miguel@email.com',
    commission_type: '50_50',
    commission_owner: 50,
    commission_barber: 50,
    is_active: true,
    created_at: '2026-02-01T00:00:00Z'
  },
  {
    id: 'barber-3',
    barbershop_id: 'shop-1',
    name: 'Pedro Sánchez',
    phone: '+584171234567',
    email: 'pedro@email.com',
    commission_type: 'salary',
    commission_owner: 100,
    commission_barber: 0,
    is_active: true,
    created_at: '2026-02-15T00:00:00Z'
  },
  {
    id: 'barber-4',
    barbershop_id: 'shop-2',
    name: 'Luis Ramírez',
    phone: '+584181234567',
    email: 'luis@email.com',
    commission_type: '50_50',
    commission_owner: 50,
    commission_barber: 50,
    is_active: true,
    created_at: '2026-02-20T00:00:00Z'
  }
];

// ==================== WALLETS ====================
export const wallets = [
  { id: 'wallet-1', barber_id: 'barber-1', balance_usd: 125.50, balance_bs: 4580.75, updated_at: '2026-03-25T14:30:00Z' },
  { id: 'wallet-2', barber_id: 'barber-2', balance_usd: 210.00, balance_bs: 7665.00, updated_at: '2026-03-25T14:30:00Z' },
  { id: 'wallet-3', barber_id: 'barber-3', balance_usd: 0, balance_bs: 0, updated_at: '2026-03-25T14:30:00Z' }, // Asalariado
  { id: 'wallet-4', barber_id: 'barber-4', balance_usd: 85.00, balance_bs: 3102.50, updated_at: '2026-03-25T14:30:00Z' }
];

// ==================== WALLET LOGS ====================
export const walletLogs = [
  { id: 'log-1', wallet_id: 'wallet-1', type: 'credit', amount: 6.00, description: 'Corte Fade - $15.00', service_id: 'svc-1', created_at: '2026-03-25T10:00:00Z' },
  { id: 'log-2', wallet_id: 'wallet-1', type: 'credit', amount: 7.50, description: 'Corte Clásico - $15.00', service_id: 'svc-2', created_at: '2026-03-25T12:00:00Z' },
  { id: 'log-3', wallet_id: 'wallet-1', type: 'debit', amount: 2.00, description: 'Productos: Navajas x2', inventory_log_id: 'inv-log-1', created_at: '2026-03-25T12:00:00Z' },
  { id: 'log-4', wallet_id: 'wallet-1', type: 'tip', amount: 5.00, description: 'Propina en caja', service_id: 'svc-1', created_at: '2026-03-25T10:00:00Z' },
  { id: 'log-5', wallet_id: 'wallet-2', type: 'credit', amount: 7.50, description: 'Corte Fade - $15.00', service_id: 'svc-3', created_at: '2026-03-25T11:00:00Z' }
];

// ==================== SERVICES ====================
export const services = [
  {
    id: 'svc-1',
    barbershop_id: 'shop-1',
    barber_id: 'barber-1',
    barber_name: 'Carlos Mendoza',
    customer_id: 'cust-1',
    customer_name: 'Pedro García',
    customer_phone: '+584191234567',
    service_type: 'Corte Fade',
    amount_total: 15.00,
    amount_owner: 9.00,
    amount_barber: 6.00,
    products_cost: 2.00,
    tip_amount: 5.00,
    payment_method: 'ZELLE',
    currency: 'USD',
    bcv_rate: BCV_RATE,
    amount_bs: 547.50,
    status: 'completed',
    created_at: '2026-03-25T10:00:00Z'
  },
  {
    id: 'svc-2',
    barbershop_id: 'shop-1',
    barber_id: 'barber-1',
    barber_name: 'Carlos Mendoza',
    customer_id: 'cust-2',
    customer_name: 'Antonio Ruiz',
    customer_phone: '+584201234567',
    service_type: 'Corte Clásico',
    amount_total: 15.00,
    amount_owner: 9.00,
    amount_barber: 6.00,
    products_cost: 0,
    tip_amount: 0,
    payment_method: 'CASH_USD',
    currency: 'USD',
    bcv_rate: BCV_RATE,
    amount_bs: 547.50,
    status: 'completed',
    created_at: '2026-03-25T12:00:00Z'
  },
  {
    id: 'svc-3',
    barbershop_id: 'shop-1',
    barber_id: 'barber-2',
    barber_name: 'Miguel Torres',
    customer_id: 'cust-3',
    customer_name: 'Fernando Díaz',
    customer_phone: '+584211234567',
    service_type: 'Corte Fade + Barba',
    amount_total: 20.00,
    amount_owner: 10.00,
    amount_barber: 10.00,
    products_cost: 0,
    tip_amount: 3.00,
    payment_method: 'PAYMOBILE',
    currency: 'USD',
    bcv_rate: BCV_RATE,
    amount_bs: 730.00,
    status: 'completed',
    created_at: '2026-03-25T11:00:00Z'
  }
];

// ==================== CASH BOXES ====================
export const cashBoxes = [
  {
    id: 'cash-1',
    barbershop_id: 'shop-1',
    date: '2026-03-25',
    total_usd: 150.00,
    total_bs: 2500000,
    total_zelle: 80.00,
    total_paymobile: 45.00,
    total_crypto: 20.00,
    total_expenses: 700000,
    status: 'OPEN',
    closed_by: null,
    closed_at: null,
    created_at: '2026-03-25T08:00:00Z'
  }
];

// ==================== EXPENSES ====================
export const expenses = [
  {
    id: 'exp-1',
    barbershop_id: 'shop-1',
    cash_box_id: 'cash-1',
    cashier_id: 'user-3',
    amount: 500000,
    currency: 'BS',
    category: 'rent',
    description: 'Alquiler semanal',
    created_at: '2026-03-25T10:00:00Z'
  }
];

// ==================== INVENTORY ====================
export const inventory = [
  { id: 'inv-1', barbershop_id: 'shop-1', name: 'Navajas doble filo', unit: 'pack', cost_per_unit: 2.00, min_stock: 10, current_stock: 25, updated_at: '2026-03-25T00:00:00Z' },
  { id: 'inv-2', barbershop_id: 'shop-1', name: 'Crema para afeitar', unit: 'tubo', cost_per_unit: 3.50, min_stock: 15, current_stock: 12, updated_at: '2026-03-25T00:00:00Z' },
  { id: 'inv-3', barbershop_id: 'shop-1', name: 'Gel fijador', unit: 'tubo', cost_per_unit: 4.00, min_stock: 10, current_stock: 18, updated_at: '2026-03-25T00:00:00Z' },
  { id: 'inv-4', barbershop_id: 'shop-1', name: 'Toallas desechables', unit: 'pack', cost_per_unit: 5.00, min_stock: 5, current_stock: 3, updated_at: '2026-03-25T00:00:00Z' }, // Bajo stock!
  { id: 'inv-5', barbershop_id: 'shop-2', name: 'Navajas doble filo', unit: 'pack', cost_per_unit: 2.00, min_stock: 10, current_stock: 20, updated_at: '2026-03-25T00:00:00Z' }
];

// ==================== INVENTORY LOGS ====================
export const inventoryLogs = [
  { id: 'inv-log-1', inventory_id: 'inv-1', barber_id: 'barber-1', quantity: 2, service_id: 'svc-1', created_at: '2026-03-25T10:00:00Z' }
];

// ==================== CUSTOMERS ====================
export const customers = [
  { id: 'cust-1', barbershop_id: 'shop-1', name: 'Pedro García', phone: '+584191234567', favorite_barber_id: 'barber-1', credit_balance: 0, is_active: true, created_at: '2026-01-15T00:00:00Z' },
  { id: 'cust-2', barbershop_id: 'shop-1', name: 'Antonio Ruiz', phone: '+584201234567', favorite_barber_id: 'barber-1', credit_balance: 0, is_active: true, created_at: '2026-02-01T00:00:00Z' },
  { id: 'cust-3', barbershop_id: 'shop-1', name: 'Fernando Díaz', phone: '+584211234567', favorite_barber_id: 'barber-2', credit_balance: 10.00, is_active: true, created_at: '2026-02-10T00:00:00Z' }, // Tiene deuda
  { id: 'cust-4', barbershop_id: 'shop-1', name: 'Roberto Mendoza', phone: '+584221234567', favorite_barber_id: null, credit_balance: 0, is_active: true, created_at: '2026-03-20T00:00:00Z' },
  { id: 'cust-5', barbershop_id: 'shop-1', name: 'Jorge Hernández', phone: '+584231234567', favorite_barber_id: 'barber-2', credit_balance: 0, is_active: true, created_at: '2026-03-22T00:00:00Z' }
];

// ==================== PAYOUTS ====================
export const payouts = [
  {
    id: 'payout-1',
    barbershop_id: 'shop-1',
    barber_id: 'barber-1',
    amount_usd: 180.00,
    amount_bs: 6570.00,
    exchange_rate: BCV_RATE,
    payment_method: 'CASH_USD',
    processed_by: 'user-1',
    created_at: '2026-03-18T18:00:00Z'
  }
];

// ==================== APPOINTMENTS ====================
export const appointments = [
  {
    id: 'apt-1',
    barbershop_id: 'shop-1',
    customer_id: 'cust-1',
    customer_name: 'Pedro García',
    barber_id: 'barber-1',
    barber_name: 'Carlos Mendoza',
    date: '2026-03-26',
    time: '15:00',
    service_type: 'Corte Fade',
    status: 'confirmed',
    confirmation_code: '4521',
    created_at: '2026-03-24T10:00:00Z'
  },
  {
    id: 'apt-2',
    barbershop_id: 'shop-1',
    customer_id: 'cust-4',
    customer_name: 'Roberto Mendoza',
    barber_id: 'barber-2',
    barber_name: 'Miguel Torres',
    date: '2026-03-26',
    time: '16:00',
    service_type: 'Corte Clásico',
    status: 'pending',
    confirmation_code: null,
    created_at: '2026-03-25T14:00:00Z'
  }
];

// ==================== HELPERS ====================

// Obtener wallet por barber_id
export const getWalletByBarberId = (barberId) => {
  return wallets.find(w => w.barber_id === barberId);
};

// Actualizar wallet
export const updateWallet = (barberId, amount, type = 'credit') => {
  const wallet = getWalletByBarberId(barberId);
  if (!wallet) return null;
  
  if (type === 'credit') {
    wallet.balance_usd += amount;
  } else if (type === 'debit') {
    wallet.balance_usd -= amount;
  }
  wallet.updated_at = new Date().toISOString();
  return wallet;
};

// Actualizar inventario
export const updateInventory = (inventoryId, quantity) => {
  const item = inventory.find(i => i.id === inventoryId);
  if (!item) return null;
  
  item.current_stock -= quantity;
  item.updated_at = new Date().toISOString();
  return item;
};

// Obtener barbershop actual (para mock)
export const getCurrentBarbershop = () => barbershops[0];
