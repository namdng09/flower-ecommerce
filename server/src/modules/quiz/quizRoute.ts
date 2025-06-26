import express, { Router } from 'express';
import quizController from './quizController';
import asyncHandler from '~/utils/asyncHandler';

const router: Router = express.Router();

/*
 * GET
 */
router.get('/', asyncHandler(quizController.list));

/*
 * GET
 */
router.get('/:id', asyncHandler(quizController.show));

/*
 * POST
 */
router.post('/', asyncHandler(quizController.create));

/*
 * PUT
 */
router.put('/:id', asyncHandler(quizController.update));

/*
 * DELETE
 */
router.delete('/:id', asyncHandler(quizController.remove));

export default router as Router;
