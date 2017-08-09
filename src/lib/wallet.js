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
}

export default WalletWrapper;
