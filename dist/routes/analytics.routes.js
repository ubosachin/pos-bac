"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const analytics_service_1 = require("../services/analytics.service");
const auth_1 = require("../middleware/auth");
const errorHandler_1 = require("../middleware/errorHandler");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate, (0, auth_1.authorize)(client_1.Role.ADMIN));
// GET /api/analytics/dashboard
router.get('/dashboard', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const dateFrom = req.query.dateFrom ? new Date(req.query.dateFrom) : undefined;
    const dateTo = req.query.dateTo ? new Date(req.query.dateTo) : undefined;
    const stats = await analytics_service_1.AnalyticsService.getDashboardStats(dateFrom, dateTo);
    res.json({ success: true, data: stats });
}));
// GET /api/analytics/top-items
router.get('/top-items', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    const dateFrom = req.query.dateFrom ? new Date(req.query.dateFrom) : undefined;
    const dateTo = req.query.dateTo ? new Date(req.query.dateTo) : undefined;
    const items = await analytics_service_1.AnalyticsService.getTopSellingItems(limit, dateFrom, dateTo);
    res.json({ success: true, data: items });
}));
// GET /api/analytics/revenue-trend
router.get('/revenue-trend', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const days = parseInt(req.query.days) || 30;
    const trend = await analytics_service_1.AnalyticsService.getRevenueTrend(days);
    res.json({ success: true, data: trend });
}));
// GET /api/analytics/category-performance
router.get('/category-performance', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const dateFrom = req.query.dateFrom ? new Date(req.query.dateFrom) : undefined;
    const dateTo = req.query.dateTo ? new Date(req.query.dateTo) : undefined;
    const data = await analytics_service_1.AnalyticsService.getCategoryPerformance(dateFrom, dateTo);
    res.json({ success: true, data });
}));
// GET /api/analytics/peak-hours
router.get('/peak-hours', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const days = parseInt(req.query.days) || 7;
    const data = await analytics_service_1.AnalyticsService.getPeakHours(days);
    res.json({ success: true, data });
}));
// GET /api/analytics/cancelled-orders
router.get('/cancelled-orders', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const dateFrom = req.query.dateFrom ? new Date(req.query.dateFrom) : undefined;
    const dateTo = req.query.dateTo ? new Date(req.query.dateTo) : undefined;
    const data = await analytics_service_1.AnalyticsService.getCancelledOrdersReport(dateFrom, dateTo);
    res.json({ success: true, data });
}));
// GET /api/analytics/inventory
router.get('/inventory', (0, errorHandler_1.asyncHandler)(async (_req, res) => {
    const data = await analytics_service_1.AnalyticsService.getInventoryAnalytics();
    res.json({ success: true, data });
}));
exports.default = router;
//# sourceMappingURL=analytics.routes.js.map