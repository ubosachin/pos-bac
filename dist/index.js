"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = exports.httpServer = exports.app = void 0;
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const morgan_1 = __importDefault(require("morgan"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const config_1 = require("./config");
const logger_1 = require("./utils/logger");
const errorHandler_1 = require("./middleware/errorHandler");
// Route imports
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const menu_routes_1 = __importDefault(require("./routes/menu.routes"));
const order_routes_1 = __importDefault(require("./routes/order.routes"));
const inventory_routes_1 = __importDefault(require("./routes/inventory.routes"));
const analytics_routes_1 = __importDefault(require("./routes/analytics.routes"));
const payments_1 = require("./modules/payments");
const app = (0, express_1.default)();
exports.app = app;
const httpServer = (0, http_1.createServer)(app);
exports.httpServer = httpServer;
// Socket.IO Setup
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: config_1.config.cors.origin,
        methods: ['GET', 'POST'],
        credentials: true,
    },
});
exports.io = io;
// Make io accessible in routes
app.set('io', io);
// ─── Middleware ────────────────────────────────────────────
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use((0, cors_1.default)({
    origin: config_1.config.cors.origin,
    credentials: true,
}));
app.use((0, compression_1.default)());
// Capture raw body for webhook signature verification
app.use(express_1.default.json({
    limit: '10mb',
    verify: (req, _res, buf) => {
        // Store raw body for webhook signature verification
        if (req.originalUrl?.includes('/webhook')) {
            req.rawBody = buf.toString('utf8');
        }
    },
}));
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, morgan_1.default)('combined', {
    stream: { write: (message) => logger_1.logger.info(message.trim()) },
}));
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: config_1.config.rateLimit.windowMs,
    max: config_1.config.rateLimit.maxRequests,
    message: { error: 'Too many requests, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', limiter);
// Stricter rate limit for auth endpoints
const authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20,
    message: { error: 'Too many auth attempts, please try again later' },
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
// ─── API Routes ───────────────────────────────────────────
app.use('/api/auth', auth_routes_1.default);
app.use('/api/users', user_routes_1.default);
app.use('/api/menu', menu_routes_1.default);
app.use('/api/orders', order_routes_1.default);
app.use('/api/inventory', inventory_routes_1.default);
app.use('/api/analytics', analytics_routes_1.default);
app.use('/api/payments', payments_1.paymentRoutes);
// Health check
app.get('/api/health', (_req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: config_1.config.env,
    });
});
// ─── Socket.IO Events ─────────────────────────────────────
io.on('connection', (socket) => {
    logger_1.logger.info(`Socket connected: ${socket.id}`);
    // Join rooms based on role
    socket.on('join-room', (room) => {
        socket.join(room);
        logger_1.logger.debug(`Socket ${socket.id} joined room: ${room}`);
    });
    socket.on('leave-room', (room) => {
        socket.leave(room);
    });
    // Kitchen acknowledgment
    socket.on('order-acknowledged', (data) => {
        io.to('pos').emit('order-acknowledged', data);
    });
    socket.on('disconnect', () => {
        logger_1.logger.info(`Socket disconnected: ${socket.id}`);
    });
});
// ─── Error Handling ───────────────────────────────────────
app.use(errorHandler_1.errorHandler);
// 404 handler
app.use((_req, res) => {
    res.status(404).json({ error: 'Route not found' });
});
// ─── Start Server ─────────────────────────────────────────
httpServer.listen(config_1.config.port, '0.0.0.0', () => {
    logger_1.logger.info(`
  ╔══════════════════════════════════════════════╗
  ║           POS-SATHI Server Started           ║
  ║──────────────────────────────────────────────║
  ║  Environment: ${config_1.config.env.padEnd(30)}║
  ║  Port:        ${config_1.config.port.toString().padEnd(30)}║
  ║  API:         http://localhost:${config_1.config.port}/api${' '.repeat(10)}║
  ║  WebSocket:   ws://localhost:${config_1.config.port}${' '.repeat(13)}║
  ╚══════════════════════════════════════════════╝
  `);
});
//# sourceMappingURL=index.js.map