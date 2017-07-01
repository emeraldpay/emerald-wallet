import log from 'electron-log';

export const Networks = [
    { id: 'local/mainnet', name: 'mainnet', chainId: 61, title: 'Mainnet', type: 'local'},
    { id: 'remote', name: 'mainnet', chainId: 61, title: 'Mainnet (Remote)', type: 'remote' },
    { id: 'local/morden', name: 'morden', chainId: 62, title: 'Morden Testnet', type: 'local' },
];

export function findNetworkDetails(name, chainId, type) {
    const nameClean = (name || '_unknown_').toString().toLowerCase();
    const found = Networks.find((n) => {
        if ((n.name === nameClean || n.chainId === chainId || n.chainId === chainId.toString()) && (n.type === type)) {
            return true;
        }
        return false;
    });
    if (!found) {
        log.debug('Unknown network:', name, chainId, type);
        return false;
    }
    log.debug('Found network:', name, chainId, type);
    return found;
}
