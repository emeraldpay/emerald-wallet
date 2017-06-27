import log from 'loglevel';

export const Networks = [
    { id: 'local/mainnet', name: 'mainnet', chainId: 61, title: 'Mainnet', type: 'local'},
    { id: 'remote', name: 'mainnet', chainId: 61, title: 'Mainnet (Remote)', type: 'remote' },
    { id: 'local/morden', name: 'morden', chainId: 62, title: 'Morden Testnet', type: 'local' },
];

const UNKNOWN = { name: 'unknown', id: -1, title: 'Unknown' };

export function findNetworkDetails(name, chainId, type) {
    let nameClean = (name || "_unknown_").toLowerCase();
    let found = Networks.find((n) => (n.name === nameClean || n.chainId === chainId) && n.type === type);
    if (!found) {
        log.error("Unknown network", name, chainId, type);
        return UNKNOWN;
    }
    return found;
}
