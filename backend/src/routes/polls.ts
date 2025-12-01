import express from 'express';
import { body, query, param } from 'express-validator';
import { PollController } from '../controllers/PollController';
import { requirePermission } from '../middleware/auth';

const router = express.Router();

// Validation middleware
const createPollValidation = [
  body('title')
    .trim()
    .isLength({ min: 10, max: 200 })
    .withMessage('Title must be between 10 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must be less than 1000 characters'),
  body('type')
    .isIn(['yes_no', 'multiple_choice', 'rating', 'emoji'])
    .withMessage('Invalid poll type'),
  body('category')
    .isIn(['national', 'local', 'social', 'economic', 'political'])
    .withMessage('Invalid category'),
  body('options')
    .isArray({ min: 2, max: 6 })
    .withMessage('Poll must have between 2 and 6 options'),
  body('options.*.text')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Option text must be between 1 and 100 characters'),
  body('endDate')
    .isISO8601()
    .withMessage('End date must be a valid date')
];

const updatePollValidation = [
  param('id').isMongoId().withMessage('Invalid poll ID'),
  body('title')
    .optional()
    .trim()
    .isLength({ min: 10, max: 200 })
    .withMessage('Title must be between 10 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must be less than 1000 characters'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean')
];

// Public routes
router.get('/', PollController.getPolls);
router.get('/active', PollController.getActivePolls);
router.get('/:id', PollController.getPollById);
router.get('/:id/results', PollController.getPollResults);

// Admin routes
router.post(
  '/',
  requirePermission('managePolls'),
  createPollValidation,
  PollController.createPoll
);

router.put(
  '/:id',
  requirePermission('managePolls'),
  updatePollValidation,
  PollController.updatePoll
);

router.delete(
  '/:id',
  requirePermission('managePolls'),
  param('id').isMongoId(),
  PollController.deletePoll
);

export default router;