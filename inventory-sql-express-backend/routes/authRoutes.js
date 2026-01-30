const express = require('express');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect, roleRestrict } = require('../middleware/authMiddleware');

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const validate = (validators) => [
  ...validators,
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const first = errors.array()[0];
      return res.status(400).json({ msg: first?.msg || 'Invalid request payload', errors: errors.array() });
    }
    next();
  },
];

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Please try again later.' },
});

const registerValidator = validate([
  // Accept either `name` or `nom`
  body('name').optional().trim().notEmpty().withMessage('Name is required'),
  body('nom').optional().trim().notEmpty().withMessage('Nom est requis'),
  body().custom((_, { req }) => {
    if (req.body.name || req.body.nom) return true;
    throw new Error('Name/nom is required');
  }),
  // Email is required
  body('email').notEmpty().withMessage('Email is required').isEmail().withMessage('Valid email is required').normalizeEmail(),
  // Accept either `password` or `motDePasse`
  body('password').optional().isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
  body('motDePasse').optional().isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
  body().custom((_, { req }) => {
    if (req.body.password || req.body.motDePasse) return true;
    throw new Error('Password is required');
  }),
]);

const loginValidator = validate([
  body('email').notEmpty().withMessage('Email is required').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body().custom((_, { req }) => {
    const pwd = req.body.password ?? req.body.motDePasse;
    if (pwd === undefined || pwd === null || `${pwd}`.trim() === '') {
      throw new Error('Password is required');
    }
    return true;
  }),
]);

router.post('/register', registerValidator, asyncHandler(authController.registerUser));

router.post('/login', loginLimiter, loginValidator, asyncHandler(authController.loginUser));

router.use('/employees', protect, roleRestrict('admin'));

router.get('/employees', asyncHandler(authController.getAllEmployees));
router.post('/employees', asyncHandler(authController.createEmployee));
router.put('/employees/:id', asyncHandler(authController.updateEmployee));
router.delete('/employees/:id', asyncHandler(authController.deleteEmployee));

module.exports = router;
