import { UnsignedTx, WalletsOp } from '@emeraldpay/emerald-vault-core';
import { convert, EthAddress } from '@emeraldplatform/core';
import { quantitiesToHex } from '@emeraldplatform/core/lib/convert';
import { Wei } from '@emeraldplatform/eth';
import { BlockchainCode, blockchainCodeToId, Blockchains, EthereumTx, IApi, IStoredTransaction, vault } from '@emeraldwallet/core';
import { Dispatch } from 'react';
import { catchError, gotoScreen } from '../screen/actions';
import * as history from '../txhistory';
import { Dispatched } from '../types';

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
function onTxSent (dispatch: Dispatch<any>, txHash: string, sourceTx: any, blockchain: BlockchainCode) {
    // dispatch(loadAccountBalance(sourceTx.from));
  const sentTx = { ...sourceTx, hash: txHash };

    // TODO: dependency on wallet/history module!
  dispatch(history.actions.trackTxs([sentTx], blockchain));
  dispatch(gotoScreen('transaction', sentTx));
}

function getNonce (api: IApi, blockchain: BlockchainCode, address: string): Promise<number> {
  return api.chain(blockchain).eth.getTransactionCount(address);
}

function withNonce (tx: IStoredTransaction): (nonce: number) => Promise<IStoredTransaction> {
  return (nonce) => new Promise((resolve) => resolve({ ...tx, nonce: convert.quantitiesToHex(nonce) }));
}

function verifySender (expected: string): (a: string, c: BlockchainCode) => Promise<string> {
  return (raw: string, chain: BlockchainCode) => new Promise((resolve, reject) => {
    // Find chain id
    const chainId = Blockchains[chain].params.chainId;
    const tx = EthereumTx.fromRaw(raw, chainId);
    if (tx.verifySignature()) {
      console.debug('Tx signature verified');
      if (!tx.getSenderAddress().equals(EthAddress.fromHexString(expected))) {
        console.error(`WRONG SENDER: 0x${tx.getSenderAddress().toString()} != ${expected}`);
        reject(new Error('Emerald Vault returned signature from wrong Sender'));
      } else {
        resolve(raw);
      }
    } else {
      console.error(`Invalid signature: ${raw}`);
      reject(new Error('Emerald Vault returned invalid signature for the transaction'));
    }
  });
}

function signTx (api: IApi, accountId: string, tx: IStoredTransaction, passphrase: string, blockchain: BlockchainCode): Promise<string | string[]> {
  console.debug(`Calling emerald api to sign tx from ${tx.from} to ${tx.to} in ${blockchain} blockchain`);
  const plainTx: vault.TxSignRequest = {
    from: tx.from,
    to: tx.to,
    gas: typeof tx.gas === 'string' ? parseInt(tx.gas) : tx.gas,
    gasPrice: typeof tx.gasPrice === 'string' ? tx.gasPrice : new Wei(tx.gasPrice).toHex(),
    value: typeof tx.value === 'string' ? tx.value : new Wei(tx.value).toHex(),
    data: tx.data,
    nonce: typeof tx.nonce === 'string' ? parseInt(tx.nonce) : tx.nonce
  };
  console.debug(`Trying to sign tx: ${plainTx}`);

  const unsignedTx: UnsignedTx = {
    from: plainTx.from,
    to: plainTx.to,
    gas: quantitiesToHex(plainTx.gas),
    gasPrice: plainTx.gasPrice,
    value: plainTx.value,
    data: plainTx.data,
    nonce: quantitiesToHex(plainTx.nonce)
  };
  const rawTx = api.vault.signTx(accountId, unsignedTx, passphrase);
  return Promise.resolve(rawTx);
}

export function signTransaction (
  accountId: string,
  blockchain: BlockchainCode, from: string, passphrase: string, to: string, gas: number, gasPrice: Wei,
  value: Wei, data: string
): Dispatched<any> {

  const originalTx: IStoredTransaction = {
    from,
    to,
    gas: convert.toHex(gas),
    gasPrice: gasPrice.toHex(),
    value: value.toHex(),
    data,
    nonce: '',
    blockchain
  };

  return (dispatch, getState, api) => {
    return getNonce(api, blockchain, from)
      .then(withNonce(originalTx))
      .then((tx: IStoredTransaction) => {
        return signTx(api, accountId, tx, passphrase, blockchain)
          .then(unwrap)
          .then((rawTx) => verifySender(from)(rawTx, blockchain))
          .then((signed) => ({ tx, signed }));
      })
      .catch(catchError(dispatch));
  };
}

export function broadcastTx (chain: BlockchainCode, tx: any, signedTx: any): any {
  return (dispatch: any, getState: any, api: IApi) => {
    return api.chain(chain).eth.sendRawTransaction(signedTx)
      .then((hash: string) => onTxSent(dispatch, hash, tx, chain))
      .catch(catchError(dispatch));
  };
}

export function estimateGas (chain: any, tx: {gas: any; to: string}) {
  const {
    to, gas
  } = tx;
  return (dispatch: any, getState: any, api: IApi) => {
    return api.chain(chain).eth.estimateGas({
      gas: gas.toNumber(),
      to
    });
  };
}
