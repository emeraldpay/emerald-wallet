import log from 'electron-log';

export const Networks = [
    { id: 'local/mainnet', name: 'mainnet', chainId: 61, title: 'Mainnet', type: 'local'},
    { id: 'remote', name: 'mainnet', chainId: 61, title: 'Mainnet (Remote)', type: 'remote' },
    { id: 'local/morden', name: 'morden', chainId: 62, title: 'Morden Testnet', type: 'local' },
];

export function findNetworkDetails(name, chainId, type) {
    let nameClean = (name || "_unknown_").toString().toLowerCase();
    let found = Networks.find((n) => {
        if ((n.name === nameClean || n.chainId === chainId || n.chainId === chainId.toString()) && (n.type === type || n.type === 'none')) {
            return true;
        }
        if (n.type === chainId || n.type === 'none') {
            log.error(`Neither chain name nor chain_id match known networks. \n
                Chain name: was ${nameClean}, chainId: ${chainId}`);
            return false;
        }
        log.error('Could not match network type to a known type. Network type was:', type);
        return false;
    });
    if (!found) {
        log.error('Unknown network', name, chainId, type);
        return null;
    }
    return found;
}
