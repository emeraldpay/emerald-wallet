import Wallet from 'ethereumjs-wallet';

class WalletWrapper {
    static fromV3(input, password) {
        return Wallet.fromV3(input, password);
    }
};

export default WalletWrapper;
