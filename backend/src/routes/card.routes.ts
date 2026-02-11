import { Router } from 'express';
import { create, getAll, getOne, remove, claim } from '../controllers/card.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { roleMiddleware } from '../middleware/role.middleware';

const router = Router();


router.post('/', authMiddleware, roleMiddleware(['admin']), create);
router.post('/:id/claim', authMiddleware, claim);
router.get('/', authMiddleware, getAll);
router.get('/:id', getOne);
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), remove);

export default router;
