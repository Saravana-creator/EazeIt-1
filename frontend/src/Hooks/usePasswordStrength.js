/**
 * src/Hooks/usePasswordStrength.js
 * ---------------------------------
 * Custom hook that evaluates password strength reactively.
 *
 * Props (param):
 *   password {string} — the password string to evaluate
 *
 * Returns:
 *   strength {object}:
 *     width      {string}  — CSS width % for the strength bar  (e.g. '75%')
 *     colorClass {string}  — Tailwind bg class for the bar colour
 *     text       {string}  — Human-readable label
 *     textClass  {string}  — Tailwind text colour class
 *     isValid    {boolean} — true only when password is strong enough
 *
 * Usage:
 *   const strength = usePasswordStrength(password);
 *
 * Used in: Signup.jsx, ForgotPassword.jsx
 */
import { useMemo } from 'react';

export function usePasswordStrength(password) {
  const strength = useMemo(() => {
    if (!password || password.length === 0) {
      return {
        width: '0%',
        colorClass: 'bg-rose-500',
        text: 'Strength: Enter password',
        textClass: 'text-slate-400',
        isValid: false,
      };
    }

    if (password.length < 6) {
      return {
        width: '25%',
        colorClass: 'bg-rose-500',
        text: 'Strength: Too Short (min 6 chars)',
        textClass: 'text-rose-500',
        isValid: false,
      };
    }

    const hasUpper   = /[A-Z]/.test(password);
    const hasNumber  = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    let points = 1;
    if (hasUpper)   points++;
    if (hasNumber)  points++;
    if (hasSpecial) points++;

    if (points <= 2) {
      return { width: '50%', colorClass: 'bg-orange-500', text: 'Strength: Weak (Add upper/number/special)', textClass: 'text-orange-500', isValid: false };
    }
    if (points === 3) {
      return { width: '75%', colorClass: 'bg-yellow-400', text: 'Strength: Medium (Add missing criteria)', textClass: 'text-yellow-400', isValid: false };
    }
    return { width: '100%', colorClass: 'bg-teal-400', text: 'Strength: Strong ✓', textClass: 'text-teal-400', isValid: true };
  }, [password]);

  return strength;
}
