export const Networks = [
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


export function findNetwork(gethUrl, chainId) {
    return Networks.find((n) => {
        return (n.chain.id === chainId) && (n.geth.url === gethUrl);
    });
}
