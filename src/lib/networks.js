import log from 'electron-log';

export const Networks = [
    { id: 'local/mainnet', name: 'mainnet', chainId: 61, title: 'Mainnet', type: 'local'},
    { id: 'remote', name: 'mainnet', chainId: 61, title: 'Mainnet (Remote)', type: 'remote' },
    { id: 'local/morden', name: 'morden', chainId: 62, title: 'Morden Testnet', type: 'local' },
];

export const Networks2 = [
    {
        geth: {
            type: 'local',
            url: 'http://127.0.0.1:8545',
        },
        chain: {
            id: 61,
            name: 'mainnet',
        },
        title: 'Mainnet',
        id: 'local/mainnet',
    },
    {
        geth: {
            type: 'remote',
            url: 'https://mewapi.epool.io',
        },
        chain: {
            id: 61,
            name: 'mainnet',
        },
        title: 'Mainnet (epool.io)',
        id: 'epool/mainnet',
    },
    {
        geth: {
            type: 'remote',
            url: 'https://api.gastracker.io/web3',
        },
        chain: {
            id: 61,
            name: 'mainnet',
        },
        title: 'Mainnet (gastracker.io)',
        id: 'gastracker/mainnet',
    },
    {
        geth: {
            type: 'local',
            url: 'http://127.0.0.1:8545',
        },
        chain: {
            id: 62,
            name: 'morden',
        },
        title: 'Morden Testnet',
        id: 'local/morden',
    },
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

export function findNetwork(gethUrl, chainId) {
    return Networks2.find((n) => {
        return (n.chain.id === chainId) && (n.geth.url === gethUrl);
    });
}
