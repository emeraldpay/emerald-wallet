export function required(value) {
    return value ? undefined : 'Required'
}

export function number(value) {
    return /^[+\-]?\d+(\.\d+)?$/.test(value) ? undefined : "Not a number"
}

export function positive(value) {
    return value[0] != '-' ? undefined : "Should be positive number"
}

export function address(value) {
    return /^0x[a-fA-F0-9]{40}$/.test(value) ? undefined : "Not an address"
}

export function password(value) {
    return ((value) && (value.length >= 8)) ? undefined : "Please enter at least 8 characters"
}

export function passwordMatch(value, allValues) {
    return value === allValues.password ? undefined : "Passwords must match"
}