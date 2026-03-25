import express from 'express';
import { barbershops, barbers, wallets, services, inventory, appointments } from '../data/database.js';

const router = express.Router();

// Get owner dashboard (consolidated)
router.get('/owner', (req, res) => {
  // Resumen consolidado de todas las barberías
  const barbershopsSummary = barbershops.map(shop => {
    const todayServices = services.filter(s => 
      s.barbershop_id === shop.id && 
      s.created_at.startsWith('2026-03-25')
    );
    
    return {
      id: shop.id,
      name: shop.name,
      today_sales: todayServices.reduce((sum, s) => sum + s.amount_total, 0),
      barbers_count: barbers.filter(b => b.barbershop_id === shop.id && b.is_active).length
    };
  });
  
  // Totales consolidados
  const todayServices = services.filter(s => s.created_at.startsWith('2026-03-25'));
  const weekServices = services.filter(s => s.created_at >= '2026-03-19');
  const monthServices = services.filter(s => s.created_at >= '2026-03-01');
  
  // Liquidaciones pendientes (suma de todos los wallets)
  const pendingPayouts = wallets.reduce((sum, w) => sum + w.balance_usd, 0);
  
  res.json({
    success: true,
    data: {
      barbershops: barbershopsSummary,
      consolidated: {
        today_sales_usd: todayServices.reduce((sum, s) => sum + s.amount_total, 0),
        week_sales_usd: weekServices.reduce((sum, s) => sum + s.amount_total, 0),
        month_sales_usd: monthServices.reduce((sum, s) => sum + s.amount_total, 0),
        pending_payouts: pendingPayouts
      }
    }
  });
});

export default router;
