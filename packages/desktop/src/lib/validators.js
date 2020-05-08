export function required(value) {
  return value ? undefined : 'Required';
}

export function number(value) {
  return /^[+-]?\d+(\.\d+)?$/.test(value) ? undefined : 'Not a number';
}

export function positive(value) {
  return value[0] !== '-' ? undefined : 'Should be positive number';
}

export function address(value) {
  return /^0x[a-fA-F0-9]{40}$/.test(value) ? undefined : 'Not an address';
}

export function minLength(min) {
  return (value) => {
    return (value && (value.length >= min)) ? undefined : `Please enter at least ${min} characters`;
  };
}

export function isJson(value) {
  const errMsg = 'Invalid JSON';
  try {
    return JSON.parse(value) ? undefined : errMsg;
  } catch (e) {
    return errMsg;
  }
}
