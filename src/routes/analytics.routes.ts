import { Router } from 'express';
import { AnalyticsService } from '../services/analytics.service';
import { authenticate, authorize } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate, authorize(Role.ADMIN));

// GET /api/analytics/dashboard
router.get(
    '/dashboard',
    asyncHandler(async (req, res) => {
        const dateFrom = req.query.dateFrom ? new Date(req.query.dateFrom as string) : undefined;
        const dateTo = req.query.dateTo ? new Date(req.query.dateTo as string) : undefined;

        const stats = await AnalyticsService.getDashboardStats(dateFrom, dateTo);
        res.json({ success: true, data: stats });
    }),
);

// GET /api/analytics/top-items
router.get(
    '/top-items',
    asyncHandler(async (req, res) => {
        const limit = parseInt(req.query.limit as string) || 10;
        const dateFrom = req.query.dateFrom ? new Date(req.query.dateFrom as string) : undefined;
        const dateTo = req.query.dateTo ? new Date(req.query.dateTo as string) : undefined;

        const items = await AnalyticsService.getTopSellingItems(limit, dateFrom, dateTo);
        res.json({ success: true, data: items });
    }),
);

// GET /api/analytics/revenue-trend
router.get(
    '/revenue-trend',
    asyncHandler(async (req, res) => {
        const days = parseInt(req.query.days as string) || 30;
        const trend = await AnalyticsService.getRevenueTrend(days);
        res.json({ success: true, data: trend });
    }),
);

// GET /api/analytics/category-performance
router.get(
    '/category-performance',
    asyncHandler(async (req, res) => {
        const dateFrom = req.query.dateFrom ? new Date(req.query.dateFrom as string) : undefined;
        const dateTo = req.query.dateTo ? new Date(req.query.dateTo as string) : undefined;

        const data = await AnalyticsService.getCategoryPerformance(dateFrom, dateTo);
        res.json({ success: true, data });
    }),
);

// GET /api/analytics/peak-hours
router.get(
    '/peak-hours',
    asyncHandler(async (req, res) => {
        const days = parseInt(req.query.days as string) || 7;
        const data = await AnalyticsService.getPeakHours(days);
        res.json({ success: true, data });
    }),
);

// GET /api/analytics/cancelled-orders
router.get(
    '/cancelled-orders',
    asyncHandler(async (req, res) => {
        const dateFrom = req.query.dateFrom ? new Date(req.query.dateFrom as string) : undefined;
        const dateTo = req.query.dateTo ? new Date(req.query.dateTo as string) : undefined;

        const data = await AnalyticsService.getCancelledOrdersReport(dateFrom, dateTo);
        res.json({ success: true, data });
    }),
);

// GET /api/analytics/inventory
router.get(
    '/inventory',
    asyncHandler(async (_req, res) => {
        const data = await AnalyticsService.getInventoryAnalytics();
        res.json({ success: true, data });
    }),
);

export default router;
