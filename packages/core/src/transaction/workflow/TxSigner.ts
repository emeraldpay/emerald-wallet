import {
  AddressRole,
  CurrentAddress,
  EntryId,
  SignedTx,
  UnsignedBasicEthereumTx,
  UnsignedBitcoinTx,
  UnsignedEIP1559EthereumTx,
  UnsignedEthereumTx,
  UnsignedTx,
  WalletEntry,
  isBitcoinEntry,
  isBitcoinTx,
  isEthereumTx,
} from '@emeraldpay/emerald-vault-core';
import { Transaction as BitcoinTx } from 'bitcoinjs-lib';
import { BlockchainCode, Blockchains } from '../../blockchains';
import { EthereumTx } from '../../blockchains/ethereum';
import { EthereumAddress } from '../../blockchains/ethereum/EthereumAddress';
import { EthereumTransaction, EthereumTransactionType } from '../ethereum';
import { AnyCreateTx, isAnyBitcoinCreateTx } from './create-tx/types';

interface SignerOrigin {
  createTx: AnyCreateTx;
  entry: WalletEntry;
  password?: string;
}

interface DataProvider {
  getNonce(blockchain: BlockchainCode, from: string): Promise<number>;
  getXPubPosition(xpub: string): Promise<number>;
  listEntryAddresses(entryId: EntryId, role: AddressRole, start: number, limit: number): Promise<CurrentAddress[]>;
}

interface Handler {
  setXPubCurrentIndex(xpub: string, position: number): Promise<void>;
  signTx(unsiged: UnsignedTx, entryId: EntryId, password?: string): Promise<SignedTx>;
}

export class TxSigner implements SignerOrigin {
  readonly createTx: AnyCreateTx;
  readonly entry: WalletEntry;
  readonly password?: string;

  private readonly dataProvider: DataProvider;
  private readonly handler: Handler;

  constructor({ createTx, entry, password }: SignerOrigin, dataProvider: DataProvider, handler: Handler) {
    this.createTx = createTx;
    this.entry = entry;
    this.password = password;

    this.dataProvider = dataProvider;
    this.handler = handler;
  }

  static convertEthereumTx(transaction: EthereumTransaction): UnsignedEthereumTx {
    const { from, gas, gasPrice, maxGasPrice, priorityGasPrice, data, nonce, to, type, value } = transaction;

    let gasPrices:
      | Pick<UnsignedBasicEthereumTx, 'gasPrice'>
      | Pick<UnsignedEIP1559EthereumTx, 'maxGasPrice' | 'priorityGasPrice'>;

    if (type === EthereumTransactionType.EIP1559) {
      gasPrices = {
        maxGasPrice: maxGasPrice?.number.toString() ?? '0',
        priorityGasPrice: priorityGasPrice?.number.toString() ?? '0',
      };
    } else {
      gasPrices = {
        gasPrice: gasPrice?.number.toString() ?? '0',
      };
    }

    return {
      ...gasPrices,
      data,
      from,
      gas,
      to,
      nonce: nonce ?? 0,
      value: value.number.toString(),
    };
  }

  async sign(): Promise<SignedTx> {
    const { createTx, entry, password } = this;
    const { getNonce } = this.dataProvider;
    const { signTx } = this.handler;

    let unsigned: UnsignedTx;

    if (isAnyBitcoinCreateTx(createTx)) {
      unsigned = createTx.build();
    } else {
      unsigned = TxSigner.convertEthereumTx(createTx.build());
    }

    if (isEthereumTx(unsigned)) {
      unsigned.nonce = await getNonce(createTx.blockchain, unsigned.from);
    }

    const signedTx = await signTx(unsigned, entry.id, password);

    this.verifySigned(signedTx.raw);

    if (isBitcoinTx(unsigned)) {
      this.updateXPubIndex(unsigned);
    }

    return signedTx;
  }

  private verifySigned(raw: string): void {
    const { createTx } = this;

    if (isAnyBitcoinCreateTx(createTx)) {
      const transaction = BitcoinTx.fromHex(raw);

      const correctInputs = transaction.ins.every(({ hash }) => {
        const txId = hash.reverse().toString('hex');

        return createTx.utxo.some(({ txid }) => txid === txId);
      });

      if (!correctInputs) {
        throw new Error('Emerald Vault returned signature from wrong Sender');
      }
    } else {
      const { chainId } = Blockchains[createTx.blockchain].params;

      let transaction;

      try {
        transaction = EthereumTx.fromRaw(raw, chainId);
      } catch (exception) {
        throw new Error('Emerald Vault returned invalid signature for the transaction');
      }

      if (transaction.verifySignature()) {
        const { from } = createTx;

        if (from != null && !transaction.getSenderAddress().equals(new EthereumAddress(from))) {
          throw new Error('Emerald Vault returned signature from wrong Sender');
        }
      } else {
        throw new Error('Emerald Vault returned invalid signature for the transaction');
      }
    }
  }

  private async updateXPubIndex(unsigned: UnsignedBitcoinTx): Promise<void> {
    const { entry } = this;
    const { getXPubPosition, listEntryAddresses } = this.dataProvider;
    const { setXPubCurrentIndex } = this.handler;

    if (isBitcoinEntry(entry)) {
      const changeXPub = entry.xpub.find(({ role }) => role === 'change');

      if (changeXPub != null) {
        const index = await getXPubPosition(changeXPub.xpub);
        const [{ address: changeAddress }] = await listEntryAddresses(entry.id, 'change', index, 1);

        const output = unsigned.outputs.find(({ address }) => address === changeAddress);

        if (output != null) {
          await setXPubCurrentIndex(changeXPub.xpub, index);
        }
      }
    }
  }
}
