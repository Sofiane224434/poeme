import { Router } from 'express';
import authMiddleware from '../middlewares/auth.middleware.js';
import adminMiddleware from '../middlewares/admin.middleware.js';
import { listUsers, updateUserPublishing } from '../controllers/admin.controller.js';

const router = Router();

router.use(authMiddleware, adminMiddleware);
router.get('/users', listUsers);
router.patch('/users/:id', updateUserPublishing);

export default router;
