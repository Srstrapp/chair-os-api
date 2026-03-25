import express from 'express';
import { users } from '../data/database.js';

const router = express.Router();

// Login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  
  const user = users.find(u => u.email === email && u.password === password);
  
  if (!user) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Credenciales inválidas'
      }
    });
  }
  
  // En producción sería JWT real
  const token = Buffer.from(`${user.id}:${Date.now()}`).toString('base64');
  
  res.json({
    success: true,
    data: {
      access_token: token,
      refresh_token: token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        barbershop_ids: user.role === 'OWNER' 
          ? ['shop-1', 'shop-2'] 
          : ['shop-1']
      }
    }
  });
});

// Refresh token
router.post('/refresh', (req, res) => {
  const { refresh_token } = req.body;
  
  if (!refresh_token) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Refresh token requerido'
      }
    });
  }
  
  // En producción validaría el token real
  const newToken = Buffer.from(`refreshed:${Date.now()}`).toString('base64');
  
  res.json({
    success: true,
    data: {
      access_token: newToken
    }
  });
});

// Get current user
router.get('/me', (req, res) => {
  // En producción obtendría el user del JWT
  const user = users[0]; // Mock: retorna el owner
  
  res.json({
    success: true,
    data: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      barbershop_ids: ['shop-1', 'shop-2']
    }
  });
});

export default router;
