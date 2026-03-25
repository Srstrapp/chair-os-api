# CHAIR-OS API - Backend

Sistema Operativo para Barberías - API REST

## Quick Start

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Ejecutar en producción
npm start
```

## Endpoints Principales

### Autenticación
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/refresh` - Refrescar token
- `GET /api/v1/auth/me` - Usuario actual

### Barberías
- `GET /api/v1/barbershops` - Listar barberías
- `GET /api/v1/barbershops/:id` - Detalle de barbería
- `PUT /api/v1/barbershops/:id` - Actualizar barbería

### Barberos
- `GET /api/v1/barbers` - Listar barberos
- `POST /api/v1/barbers` - Crear barbero
- `GET /api/v1/barbers/:id/wallet` - Wallet del barbero

### Servicios
- `GET /api/v1/services` - Listar servicios
- `POST /api/v1/services` - Registrar servicio
- `PUT /api/v1/services/:id/cancel` - Cancelar servicio

### Caja
- `GET /api/v1/cash-box` - Listar cajas
- `POST /api/v1/cash-box` - Abrir caja
- `PUT /api/v1/cash-box/:id` - Actualizar caja
- `PUT /api/v1/cash-box/:id/close` - Cerrar caja

### Inventario
- `GET /api/v1/inventory` - Listar productos
- `POST /api/v1/inventory` - Agregar producto
- `POST /api/v1/inventory/:id/use` - Usar producto

### Dashboard
- `GET /api/v1/dashboard/owner` - Dashboard consolidado

## Deploy en Railway

1. Crear repo en GitHub
2. Conectar a Railway
3. Railway detecta Node.js automáticamente
4. Deploy automático en cada push

## Datos Mock

El API viene con datos de ejemplo para probar:
- 2 barberías
- 4 barberos (diferentes tipos de comisión)
- Varios servicios registrados
- Inventario con productos
- Clientes de prueba
