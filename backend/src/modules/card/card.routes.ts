import { Router } from 'express';
import * as cardController from './card.controller';
import { authenticate } from '../../shared/middleware/auth.middleware';

const router = Router();

router.get('/', authenticate, cardController.getAll);
router.get('/:id', authenticate, cardController.getOne);
router.post('/', authenticate, cardController.create);
router.post('/:id/claim', authenticate, cardController.claim);
router.delete('/:id', authenticate, cardController.remove);

export default router;
