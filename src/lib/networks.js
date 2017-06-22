import Immutable from 'immutable';

export const Networks = [
    { name: 'mainnet', id: 61, title: 'Mainnet'},
    { name: 'morden', id: 62, title: 'Morden Testnet' },
];

const UNKNOWN = { name: 'unknown', id: -1, title: 'Unknown' };

export function getByName(name) {
    name = name.toLowerCase();
    if (name === 'mainnet') {
        return Networks[0]
    }
    if (name === 'testnet' || name === 'morden') {
        return Networks[1]
    }
    return UNKNOWN;
}

export function getById(id) {
    if (id === 61) {
        return Networks[0]
    }
    if (id === 62 ) {
        return Networks[1]
    }
    return UNKNOWN;
}
