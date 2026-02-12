import { Response } from 'express';
import * as cardService from './card.service';
import { success, error } from '../../shared/utils/response.util';
import { AuthRequest } from '../../shared/middleware/auth.middleware';

export const create = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { name, image, points, type, duration } = req.body;

        if (!name || !image || points === undefined || !type || !duration) {
            error(res, 'Name, image, points, type, and duration are required', 400);
            return;
        }

        const card = await cardService.createCard({ name, image, points, type, duration });
        success(res, card, 'Card created successfully', 201);
    } catch (err: any) {
        console.error('Create card error:', err);
        error(res, 'Failed to create card', 500);
    }
};

export const claim = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const userId = req.user?.userId;

        if (!userId) {
            error(res, 'Authentication required', 401);
            return;
        }

        const updatedCard = await cardService.claimCard(id, userId);
        success(res, updatedCard, 'Card claimed successfully');
    } catch (err: any) {
        if (
            err.message.includes('not found') ||
            err.message.includes('already taken') ||
            err.message.includes('Cooldown') ||
            err.message.includes('Rate limit') ||
            err.message.includes('active cards') ||
            err.message.includes('claimed by someone else')
        ) {
            error(res, err.message, 400);
        } else {
            console.error('Claim card error:', err);
            error(res, 'Failed to claim card', 500);
        }
    }
};

export const getAll = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const cards = await cardService.getAllCards();
        success(res, cards, 'Cards retrieved successfully', 200);
    } catch (err: any) {
        console.error('Get cards error:', err);
        error(res, 'Failed to retrieve cards', 500);
    }
};

export const getOne = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const card = await cardService.getCardById(id);
        success(res, card, 'Card retrieved successfully', 200);
    } catch (err: any) {
        if (err.message.includes('not found')) {
            error(res, err.message, 404);
        } else {
            error(res, 'Failed to retrieve card', 500);
        }
    }
};

export const remove = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const card = await cardService.deleteCard(id);
        success(res, card, 'Card deleted successfully', 200);
    } catch (err: any) {
        if (err.message.includes('not found')) {
            error(res, err.message, 404);
        } else {
            error(res, 'Failed to delete card', 500);
        }
    }
};
