import * as Joi from 'joi';

// Validated once at boot. If anything required is missing or malformed,
// the app refuses to start instead of running with broken/insecure defaults
// (e.g. a missing NODE_ENV silently disables the Secure/SameSite=None
// cookie flags the cross-origin frontend relies on).
export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(3000),

  DATABASE_URL: Joi.string().uri().required(),
  DIRECT_URL: Joi.string().uri().required(),

  JWT_SECRET: Joi.string().min(32).required(),
  JWT_REFRESH_SECRET: Joi.string().min(32).required(),

  FRONTEND_URL: Joi.string().uri().required(),

  CHARGILY_API_KEY: Joi.string().required(),
  CHARGILY_MODE: Joi.string().valid('test', 'live').default('test'),
  CHARGILY_SECRET: Joi.string().required(),
  CHARGILY_SUCCESS_URL: Joi.string().uri().required(),
  CHARGILY_FAILURE_URL: Joi.string().uri().required(),

  SENTRY_DSN: Joi.string().uri().optional().allow(''),

  RESEND_API_KEY: Joi.string().optional().allow(''),
  RESEND_FROM_EMAIL: Joi.string().optional().allow(''),
}).unknown(true);
