import { EstimationMode } from '@emeraldpay/api';
import { BigAmount } from '@emeraldpay/bigamount';
import { Wei } from "@emeraldpay/bigamount-crypto";
import { UnsignedTx } from '@emeraldpay/emerald-vault-core';
import { EntryId, UnsignedBitcoinTx } from "@emeraldpay/emerald-vault-core/lib/types";
import { IEmeraldVault } from "@emeraldpay/emerald-vault-core/lib/vault";
import { convert, EthAddress } from '@emeraldplatform/core';
import { quantitiesToHex } from '@emeraldplatform/core/lib/convert';
import {
  BitcoinStoredTransaction,
  BlockchainCode,
  Blockchains,
  EthereumStoredTransaction,
  EthereumTx,
  isBitcoin,
  isEthereum,
  Logger,
} from '@emeraldwallet/core';
import BigNumber from 'bignumber.js';
import { Dispatch } from 'redux';
import * as screen from '../screen';
import { catchError, gotoScreen, showError } from '../screen/actions';
import * as history from '../txhistory';
import { Dispatched, IExtraArgument } from '../types';

const log = Logger.forCategory('store.transaction');

function unwrap (value: string[] | string | null): Promise<string> {
  return new Promise((resolve, reject) => {
    if (typeof value === 'string') {
      resolve(value);
    }
    if (value && value.length === 1) {
      resolve(value[0]);
    } else {
      reject(new Error(`Invalid list size ${value}`));
    }
  });
}

/**
 * Called after Tx sent
 */
function onEthereumTxSent(dispatch: Dispatch<any>, txHash: string, sourceTx: EthereumStoredTransaction, blockchain: BlockchainCode) {
  // dispatch(loadAccountBalance(sourceTx.from));
  const sentTx = {...sourceTx, hash: txHash};

  // TODO: dependency on wallet/history module!
  dispatch(history.actions.trackTxs([sentTx], blockchain));
  dispatch(gotoScreen(screen.Pages.TX_DETAILS, sentTx));
}

function onBitcoinTxSent(dispatch: Dispatch<any>, txHash: string, sourceTx: UnsignedBitcoinTx, blockchain: BlockchainCode) {
  const sentTx: BitcoinStoredTransaction = {
    blockchain,
    since: new Date(),
    hash: txHash,
    entries: sourceTx.inputs
      .map((it) => it.entryId)
      .filter((it) => typeof it != "undefined")
      .map((it) => it!)
      .reduce((all, it) => all.indexOf(it) >= 0 ? all : all.concat(it), [] as string[]),
    inputs: sourceTx.inputs.map((it) => {
      return {
        txid: it.txid,
        vout: it.vout,
        amount: it.amount,
        entryId: it.entryId,
        address: it.address,
        hdPath: it.hdPath
      }
    }),
    outputs: sourceTx.outputs,
    fee: sourceTx.fee
  }

  // TODO: dependency on wallet/history module!
  dispatch(history.actions.trackTxs([sentTx], blockchain));
  dispatch(gotoScreen(screen.Pages.TX_DETAILS, sentTx));
}

function withNonce(tx: EthereumStoredTransaction): (nonce: number) => Promise<EthereumStoredTransaction> {
  return (nonce) => new Promise((resolve) => resolve({...tx, nonce: convert.quantitiesToHex(nonce)}));
}

function verifySender(expected: string): (a: string, c: BlockchainCode) => Promise<string> {
  return (raw: string, chain: BlockchainCode) => new Promise((resolve, reject) => {
    // Find chain id
    const chainId = Blockchains[chain].params.chainId;
    const tx = EthereumTx.fromRaw(raw, chainId);
    if (tx.verifySignature()) {
      log.debug('Tx signature verified');
      if (!tx.getSenderAddress().equals(EthAddress.fromHexString(expected))) {
        log.error(`WRONG SENDER: 0x${tx.getSenderAddress().toString()} != ${expected}`);
        reject(new Error('Emerald Vault returned signature from wrong Sender'));
      } else {
        resolve(raw);
      }
    } else {
      log.error(`Invalid signature: ${raw}`);
      reject(new Error('Emerald Vault returned invalid signature for the transaction'));
    }
  });
}

function signTx(
  vault: IEmeraldVault, accountId: string, tx: EthereumStoredTransaction, passphrase: string, blockchain: BlockchainCode
): Promise<string | string[]> {
  log.debug(`Calling emerald api to sign tx from ${tx.from} to ${tx.to} in ${blockchain} blockchain`);
  const unsignedTx: UnsignedTx = {
    from: tx.from,
    to: tx.to,
    gas: quantitiesToHex(
      typeof tx.gas === 'string' ? parseInt(tx.gas) : tx.gas
    ),
    gasPrice: typeof tx.gasPrice === 'string' ? tx.gasPrice : new Wei(tx.gasPrice).toHex(),
    value: typeof tx.value === 'string' ? tx.value : new Wei(tx.value).toHex(),
    data: tx.data,
    nonce: quantitiesToHex(
      typeof tx.nonce === 'string' ? parseInt(tx.nonce) : tx.nonce
    )
  };
  return vault.signTx(accountId, unsignedTx, passphrase);
}

export function signTransaction (
  accountId: string,
  blockchain: BlockchainCode, from: string, passphrase: string, to: string, gas: number, gasPrice: Wei,
  value: Wei, data: string
): Dispatched<any> {

  const originalTx: EthereumStoredTransaction = {
    from,
    to,
    gas: convert.toHex(gas),
    gasPrice: gasPrice.toHex(),
    value: value.toHex(),
    data,
    nonce: '',
    blockchain
  };

  return (dispatch: any, getState, extra) => {
    return extra.backendApi.getNonce(blockchain, from)
      .then(withNonce(originalTx))
      .then((tx) => {
        return signTx(extra.api.vault, accountId, tx, passphrase, blockchain)
          .then(unwrap)
          .then((rawTx) => verifySender(from)(rawTx, blockchain))
          .then((signed) => ({tx, signed}));
      })
      .catch(catchError(dispatch));
  };
}

export function signBitcoinTransaction(
  entryId: EntryId,
  tx: UnsignedBitcoinTx,
  password: string,
  handler: (raw?: string, err?: string) => void
): Dispatched<any> {
  return (dispatch: any, getState, extra) => {
    extra.api.vault.signTx(entryId, tx, password)
      .then((raw) => handler(raw))
      .catch((err) => {
        handler(undefined, "Internal error. " + err?.message);
        dispatch(showError(err))
      })
  }
}

export function broadcastTx(chain: BlockchainCode, tx: EthereumStoredTransaction | UnsignedBitcoinTx, signedTx: string): Dispatched<any> {
  return async (dispatch: any, getState: any, extra: IExtraArgument) => {
    try {
      const hash = await extra.backendApi.broadcastSignedTx(chain, signedTx);
      if (isBitcoin(chain)) {
        return onBitcoinTxSent(dispatch, hash, tx as BitcoinStoredTransaction, chain);
      } else if (isEthereum(chain)) {
        return onEthereumTxSent(dispatch, hash, tx as EthereumStoredTransaction, chain);
      }
    } catch (e) {
      dispatch(showError(e));
    }
  };
}

type Tx = {
  gas: BigNumber;
  to: string;
  data?: string;
  from?: string;
  value?: BigAmount;
};

export function estimateGas(chain: BlockchainCode, tx: Tx) {
  const { data, from, gas, to, value } = tx;

  return (dispatch: any, getState: any, extra: IExtraArgument) => {
    return extra.backendApi.estimateTxCost(chain, {
      data,
      from,
      to,
      gas: gas.toNumber(),
      value: `0x${value?.number.toString(16) ?? 0}`,
    });
  };
}

export function estimateFee(
  blockchain: BlockchainCode,
  blocks: number,
  mode: EstimationMode
) {
  return (dispatch: any, getState: any, extra: IExtraArgument) => {
    return extra.backendApi.estimateFee(blockchain, blocks, mode);
  };
}
