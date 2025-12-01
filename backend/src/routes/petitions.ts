import express from 'express';
import { body, param, query } from 'express-validator';
import { PetitionController } from '../controllers/PetitionController';

const router = express.Router();

// Validation middleware
const createPetitionValidation = [
  body('userId')
    .notEmpty()
    .withMessage('User ID is required'),
  body('title')
    .trim()
    .isLength({ min: 10, max: 200 })
    .withMessage('Title must be between 10 and 200 characters'),
  body('description')
    .trim()
    .isLength({ min: 50, max: 2000 })
    .withMessage('Description must be between 50 and 2000 characters'),
  body('category')
    .isIn(['local', 'state', 'national'])
    .withMessage('Invalid category'),
  body('targetAuthority')
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Target authority must be between 5 and 100 characters'),
  body('state')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('State must be between 2 and 50 characters'),
  body('city')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('City must be between 2 and 50 characters'),
  body('signaturesRequired')
    .optional()
    .isInt({ min: 100, max: 1000000 })
    .withMessage('Signatures required must be between 100 and 1000000'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array')
];

const signPetitionValidation = [
  param('petitionId').isMongoId().withMessage('Invalid petition ID'),
  body('userId')
    .notEmpty()
    .withMessage('User ID is required'),
  body('message')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Message must be less than 500 characters')
];

// Public routes
router.get('/', PetitionController.getPetitions);
router.get('/urgent', PetitionController.getUrgentPetitions);
router.get('/search', PetitionController.searchPetitions);
router.get('/:id', PetitionController.getPetitionById);

// User routes (no auth required)
router.post('/', createPetitionValidation, PetitionController.createPetition);
router.post('/:petitionId/sign', signPetitionValidation, PetitionController.signPetition);

export default router;