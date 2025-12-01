import express from 'express';
import { body } from 'express-validator';
import { AuthController } from '../controllers/AuthController';

const router = express.Router();

// Validation middleware
const loginValidation = [
  body('username')
    .trim()
    .isLength({ min: 3 })
    .withMessage('Username must be at least 3 characters long'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
];

// Routes
router.post('/login', loginValidation, AuthController.login);
router.get('/profile', AuthController.getProfile);
router.post('/logout', AuthController.logout);
router.post('/refresh', AuthController.refreshToken);

export default router;