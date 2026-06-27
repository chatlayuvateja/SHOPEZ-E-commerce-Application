const validate = (rules) => {
  return (req, res, next) => {
    const errors = [];

    rules.forEach((rule) => {
      const { field, checks } = rule;
      const value = getNestedValue(req.body, field);
      
      checks.forEach((check) => {
        const error = check(value, field);
        if (error) {
          errors.push({ field, message: error, value });
        }
      });
    });

    if (errors.length > 0) {
      return res.status(422).json({
        status: 'fail',
        errors,
      });
    }

    next();
  };
};

const getNestedValue = (obj, path) => {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined;
  }, obj);
};

// Validation check factories
const notEmpty = (message) => (value, field) => {
  if (value === undefined || value === null || value === '') {
    return message || `${field} is required`;
  }
  return null;
};

const isEmail = (message) => (value, field) => {
  if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return message || 'Please provide a valid email address';
  }
  return null;
};

const minLength = (min, message) => (value, field) => {
  if (value && value.length < min) {
    return message || `${field} must be at least ${min} characters`;
  }
  return null;
};

const maxLength = (max, message) => (value, field) => {
  if (value && value.length > max) {
    return message || `${field} must be under ${max} characters`;
  }
  return null;
};

const isFloat = (options = {}, message) => (value, field) => {
  const num = parseFloat(value);
  if (isNaN(num)) {
    return message || `${field} must be a number`;
  }
  if (options.min !== undefined && num < options.min) {
    return message || `${field} must be at least ${options.min}`;
  }
  if (options.max !== undefined && num > options.max) {
    return message || `${field} must be at most ${options.max}`;
  }
  return null;
};

const isInt = (options = {}, message) => (value, field) => {
  const num = parseInt(value);
  if (isNaN(num) || !Number.isInteger(num)) {
    return message || `${field} must be an integer`;
  }
  if (options.min !== undefined && num < options.min) {
    return message || `${field} must be at least ${options.min}`;
  }
  if (options.max !== undefined && num > options.max) {
    return message || `${field} must be at most ${options.max}`;
  }
  return null;
};

const isIn = (values, message) => (value, field) => {
  if (value && !values.includes(value)) {
    return message || `${value} is not a valid value for ${field}`;
  }
  return null;
};

const isArray = (options = {}, message) => (value, field) => {
  if (!Array.isArray(value)) {
    return message || `${field} must be an array`;
  }
  if (options.min !== undefined && value.length < options.min) {
    return message || `${field} must have at least ${options.min} items`;
  }
  return null;
};

const matches = (pattern, message) => (value, field) => {
  if (value && !pattern.test(value)) {
    return message || `${field} format is invalid`;
  }
  return null;
};

module.exports = {
  validate,
  notEmpty,
  isEmail,
  minLength,
  maxLength,
  isFloat,
  isInt,
  isIn,
  isArray,
  matches,
};
