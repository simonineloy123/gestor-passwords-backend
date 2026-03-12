import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';

export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Datos inválidos',
      errors: errors.array().map(err => ({
        field: err.type === 'field' ? err.path : 'unknown',
        message: err.msg,
      })),
    });
  }
  next();
};

export const validateRegister = [
  body('email')
    .trim()
    .notEmpty().withMessage('El email es requerido')
    .isEmail().withMessage('Email inválido')
    .normalizeEmail()
    .isLength({ max: 254 }).withMessage('Email demasiado largo'),

  body('password')
    .trim()
    .notEmpty().withMessage('La contraseña es requerida')
    .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres')
    .isLength({ max: 128 }).withMessage('La contraseña es demasiado larga')
    .matches(/[A-Z]/).withMessage('Debe contener al menos una mayúscula')
    .matches(/[a-z]/).withMessage('Debe contener al menos una minúscula')
    .matches(/[0-9]/).withMessage('Debe contener al menos un número'),

  handleValidationErrors,
];

export const validateLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('El email es requerido')
    .isEmail().withMessage('Email inválido')
    .normalizeEmail()
    .isLength({ max: 254 }).withMessage('Email demasiado largo'),

  body('password')
    .trim()
    .notEmpty().withMessage('La contraseña es requerida')
    .isLength({ min: 1 }).withMessage('La contraseña es requerida')
    .isLength({ max: 128 }).withMessage('La contraseña es demasiado larga'),

  handleValidationErrors,
];

export const validatePasswordRecord = [
  body('service')
    .notEmpty().withMessage('El servicio es requerido')
    .isLength({ max: 100 }).withMessage('El nombre del servicio es demasiado largo')
    .escape(),

  body('username')
    .notEmpty().withMessage('El usuario es requerido')
    .isLength({ max: 254 }).withMessage('El usuario es demasiado largo')
    .escape(),

  body('password')
    .notEmpty().withMessage('La contraseña es requerida')
    .isLength({ max: 256 }).withMessage('La contraseña es demasiado larga'),

  body('category')
    .trim()
    .notEmpty().withMessage('La categoría es requerida')
    .isIn([
      'Streaming', 'Redes Sociales', 'Educacion',
      'Gubernamental', 'Trabajo', 'Finanzas',
      'Compras', 'Gaming', 'Salud', 'Otros'
    ]).withMessage('Categoría inválida'),

  body('googleLogin')
    .optional()
    .isBoolean().withMessage('googleLogin debe ser un booleano'),

  handleValidationErrors,
];