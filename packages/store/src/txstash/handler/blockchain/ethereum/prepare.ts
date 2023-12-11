import { WeiAny } from '@emeraldpay/bigamount-crypto';
import { EthereumEntry } from '@emeraldpay/emerald-vault-core';
import { MAX_DISPLAY_ALLOWANCE, TokenRegistry, amountFactory, blockchainIdToCode, workflow } from '@emeraldwallet/core';
import { TokenBalanceBelong, accounts, tokens } from '../../../..';
import { getTokens } from '../../../../application/selectors';
import { setAsset, setPreparing, setTransaction } from '../../../actions';
import { EntryHandler } from '../../types';
import { fetchFee } from './fee';

export const prepareErc20ApproveTx: EntryHandler<EthereumEntry> = (data, storeProvider) => () => {
  fetchFee(data, storeProvider)();

  const { entry, initialAllowance } = data;

  const state = storeProvider.getState();

  const blockchain = blockchainIdToCode(entry.blockchain);
  const tokenRegistry = new TokenRegistry(getTokens(state));

  const [token] = tokenRegistry.byBlockchain(blockchain);

  storeProvider.dispatch(setAsset(token.address));

  const createTx = new workflow.CreateErc20ApproveTx(tokenRegistry, token.address, blockchain);

  if (initialAllowance == null) {
    createTx.approveBy = entry.address?.value;
  } else {
    const { allowance, ownerAddress, spenderAddress } = initialAllowance;

    if (ownerAddress !== entry.address?.value) {
      throw new Error(`Incorrect allowance provided for entry ${entry.id}`);
    }

    createTx.allowFor = spenderAddress;
    createTx.approveBy = ownerAddress;

    if (allowance.number.isGreaterThanOrEqualTo(MAX_DISPLAY_ALLOWANCE)) {
      createTx.target = workflow.ApproveTarget.INFINITE;
    } else {
      createTx.amount = allowance;
    }
  }

  createTx.totalBalance = accounts.selectors.getBalance(state, entry.id, amountFactory(blockchain)(0)) as WeiAny;

  const { value: address } = entry.address ?? {};

  if (address != null) {
    createTx.totalTokenBalance =
      tokens.selectors.selectBalance(state, blockchain, address, token.address, {
        belonging: TokenBalanceBelong.OWN,
      }) ?? token.getAmount(0);
  }

  storeProvider.dispatch(setTransaction(createTx.dump()));
  storeProvider.dispatch(setPreparing(false));
};

export const prepareEthereumTx: EntryHandler<EthereumEntry> = (data, storeProvider) => () => {
  fetchFee(data, storeProvider)();

  storeProvider.dispatch(setPreparing(false));
};
