// src/constants/features.ts

// Password reset emails currently only deliver to the app's own Resend
// account address (no verified sending domain yet), so real users can't
// receive a reset link. Flip this back to true once RESEND_FROM_EMAIL
// points at a verified domain.
export const PASSWORD_RESET_ENABLED = false;
