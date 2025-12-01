import express from 'express';
import { body, param, query } from 'express-validator';
import { VoteController } from '../controllers/VoteController';

const router = express.Router();

// Validation middleware
const castVoteValidation = [
  body('userId')
    .notEmpty()
    .withMessage('User ID is required'),
  body('pollId')
    .isMongoId()
    .withMessage('Invalid poll ID'),
  body('selectedOption')
    .notEmpty()
    .withMessage('Selected option is required'),
  body('rating')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Rating must be between 1 and 10')
];

const updateVoteValidation = [
  param('voteId').isMongoId().withMessage('Invalid vote ID'),
  body('selectedOption')
    .optional()
    .notEmpty()
    .withMessage('Selected option cannot be empty'),
  body('rating')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Rating must be between 1 and 10')
];

// Routes
router.post('/', castVoteValidation, VoteController.castVote);

router.get('/user/:userId', VoteController.getUserVotes);

router.get('/poll/:pollId', VoteController.getPollVotes);

router.get('/poll/:pollId/analytics', VoteController.getVoteAnalytics);

router.put('/:voteId', updateVoteValidation, VoteController.updateVote);

router.delete('/:voteId', VoteController.deleteVote);

export default router;