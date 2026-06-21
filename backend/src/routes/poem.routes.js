import { Router } from 'express';
import authMiddleware from '../middlewares/auth.middleware.js';
import {
    listPublishedPoems,
    createPoem,
    listPoemComments,
    createComment,
    toggleLike,
    deletePoem
} from '../controllers/poem.controller.js';

const router = Router();

router.get('/', listPublishedPoems);
router.post('/', authMiddleware, createPoem);
router.get('/:id/comments', listPoemComments);
router.post('/:id/comments', authMiddleware, createComment);
router.post('/:id/likes/toggle', authMiddleware, toggleLike);
router.delete('/:id', authMiddleware, deletePoem);

export default router;
