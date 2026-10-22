/** Mirrors the backend's `set_user_pin` rule: 4 to 8 digits. */
export const validatePin = (pin: string): string | null =>
  /^\d{4,8}$/.test(pin) ? null : 'PIN must be 4 to 8 digits';
