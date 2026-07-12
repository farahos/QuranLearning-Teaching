const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(value) {
  return EMAIL_RE.test(String(value || "").trim());
}

export function isRequired(value) {
  if (typeof value === "string") return value.trim().length > 0;
  return value !== undefined && value !== null && value !== "";
}

export function minLength(value, length) {
  return String(value || "").length >= length;
}

export function isValidUrl(value) {
  if (!value) return true;
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

export function isValidPhone(value) {
  return /^[+]?[0-9\s-]{7,15}$/.test(String(value || "").trim());
}

/**
 * Runs a { field: [validatorFns] } map against values and returns { field: message }.
 * Each validator fn receives (value, values) and returns an error string or falsy.
 */
export function runValidation(values, rules) {
  const errors = {};
  Object.entries(rules).forEach(([field, validators]) => {
    for (const validator of validators) {
      const message = validator(values[field], values);
      if (message) {
        errors[field] = message;
        break;
      }
    }
  });
  return errors;
}

export const validators = {
  required:
    (message = "This field is required") =>
    (value) =>
      isRequired(value) ? null : message,
  email:
    (message = "Enter a valid email address") =>
    (value) =>
      !value || isValidEmail(value) ? null : message,
  min:
    (length, message) =>
    (value) =>
      !value || minLength(value, length) ? null : message || `Must be at least ${length} characters`,
  url:
    (message = "Enter a valid URL") =>
    (value) =>
      isValidUrl(value) ? null : message,
  matches:
    (field, message = "Values do not match") =>
    (value, values) =>
      value === values[field] ? null : message,
};
