import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import { config } from './config';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';

// Route imports
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import menuRoutes from './routes/menu.routes';
import orderRoutes from './routes/order.routes';
import inventoryRoutes from './routes/inventory.routes';
import analyticsRoutes from './routes/analytics.routes';
import { paymentRoutes } from './modules/payments';

const app = express();
const httpServer = createServer(app);

// Socket.IO Setup
const io = new SocketIOServer(httpServer, {
    cors: {
        origin: config.cors.origin,
        methods: ['GET', 'POST'],
        credentials: true,
    },
});

// Make io accessible in routes
app.set('io', io);

// ─── Middleware ────────────────────────────────────────────
app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(cors({
    origin: config.cors.origin,
    credentials: true,
}));
app.use(compression());
// Capture raw body for webhook signature verification
app.use(express.json({
    limit: '10mb',
    verify: (req: any, _res, buf) => {
        // Store raw body for webhook signature verification
        if (req.originalUrl?.includes('/webhook')) {
            req.rawBody = buf.toString('utf8');
        }
    },
}));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', {
    stream: { write: (message: string) => logger.info(message.trim()) },
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.maxRequests,
    message: { error: 'Too many requests, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', limiter);

// Stricter rate limit for auth endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20,
    message: { error: 'Too many auth attempts, please try again later' },
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// ─── API Routes ───────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/payments', paymentRoutes);

// Health check
app.get('/api/health', (_req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: config.env,
    });
});

// ─── Socket.IO Events ─────────────────────────────────────
io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id}`);

    // Join rooms based on role
    socket.on('join-room', (room: string) => {
        socket.join(room);
        logger.debug(`Socket ${socket.id} joined room: ${room}`);
    });

    socket.on('leave-room', (room: string) => {
        socket.leave(room);
    });

    // Kitchen acknowledgment
    socket.on('order-acknowledged', (data: { orderId: string }) => {
        io.to('pos').emit('order-acknowledged', data);
    });

    socket.on('disconnect', () => {
        logger.info(`Socket disconnected: ${socket.id}`);
    });
});

// ─── Error Handling ───────────────────────────────────────
app.use(errorHandler);

// 404 handler
app.use((_req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// ─── Start Server ─────────────────────────────────────────
httpServer.listen(config.port, '0.0.0.0', () => {
    logger.info(`
  ╔══════════════════════════════════════════════╗
  ║           POS-SATHI Server Started           ║
  ║──────────────────────────────────────────────║
  ║  Environment: ${config.env.padEnd(30)}║
  ║  Port:        ${config.port.toString().padEnd(30)}║
  ║  API:         http://localhost:${config.port}/api${' '.repeat(10)}║
  ║  WebSocket:   ws://localhost:${config.port}${' '.repeat(13)}║
  ╚══════════════════════════════════════════════╝
  `);
});

export { app, httpServer, io };
