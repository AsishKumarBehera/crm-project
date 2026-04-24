/** Pure validation helpers — no Angular dependency, easy to unit test */

export function validateEmail(email: string): string {
  if (!email.trim()) return 'Email is required';
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regex.test(email.trim())) return 'Invalid email format';
  return '';
}

export function validatePhone(phone: string): string {
  if (!phone.trim()) return 'Phone is required';
  if (!/^[0-9]{10}$/.test(phone.trim())) return 'Phone number must be exactly 10 digits';
  return '';
}

export function validateName(name: string): string {
  if (!name.trim()) return 'Name is required';
  return '';
}

/** Strips all non-numeric characters — use on (input) event */
export function onlyNumbers(value: string): string {
  return value.replace(/[^0-9]/g, '');
}