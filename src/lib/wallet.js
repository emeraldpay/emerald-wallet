import Wallet from 'ethereumjs-wallet';
import ethUtil from 'ethereumjs-util';

class WalletWrapper {
    static fromV3(input, password) {
        return Wallet.fromV3(input, password);
    }

    static toV3(privateKey, password) {
        const wallet = Wallet.fromPrivateKey(ethUtil.toBuffer(privateKey));
        return wallet.toV3String(password);
    }

    static fromPrivateKey(privateKey) {
        return new WalletWrapper(Wallet.fromPrivateKey(ethUtil.toBuffer(privateKey)));
    }

    constructor(wallet) {
        this.wallet = wallet;
    }

    toV3String(password) {
        return this.wallet.toV3String(password);
    }

    getAddress() {
        return this.wallet.getAddress();
    }
}

export default WalletWrapper;
