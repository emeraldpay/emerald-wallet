import { BigAmount, Unit } from '@emeraldpay/bigamount';
import { EntryId, EthereumEntry, WalletEntry, isEthereumEntry } from '@emeraldpay/emerald-vault-core';
import {
  BlockchainCode,
  Blockchains,
  CurrencyAmount,
  EthereumTransactionType,
  MAX_DISPLAY_ALLOWANCE,
  TokenAmount,
  TokenRegistry,
  amountFactory,
  blockchainIdToCode,
  workflow,
} from '@emeraldwallet/core';
import { ApproveTarget, ValidationResult } from '@emeraldwallet/core/lib/workflow';
import { Allowance, FEE_KEYS, GasPrices, IState, accounts, allowance, tokens, transaction } from '@emeraldwallet/store';
import { Button, ButtonGroup, FormLabel, FormRow } from '@emeraldwallet/ui';
import { CircularProgress, IconButton, Tooltip, createStyles, makeStyles } from '@material-ui/core';
import { AllInclusive as InfiniteIcon } from '@material-ui/icons';
import { Alert } from '@material-ui/lab';
import * as React from 'react';
import { connect } from 'react-redux';
import { AmountField } from '../../common/AmountField';
import EthTxSettings from '../../common/EthTxSettings/EthTxSettings';
import { Asset, SelectAsset } from '../../common/SelectAsset';
import { SelectEntry } from '../../common/SelectEntry';
import { ToField } from '../../common/ToField';

const useStyles = makeStyles((theme) =>
  createStyles({
    amountField: {
      alignItems: 'center',
      display: 'flex',
      minHeight: 52,
    },
    amountFieldButton: {
      marginRight: theme.spacing(),
    },
    buttons: {
      display: 'flex',
      justifyContent: 'end',
      width: '100%',
    },
  }),
);

interface TokenAsset extends Asset {
  balance: TokenAmount;
}

export type EntryBalances = Record<EntryId, BigAmount>;

interface OwnProps {
  balances: EntryBalances;
  entries: EthereumEntry[];
  initialAllowance?: Allowance;
  tokenRegistry: TokenRegistry;
  goBack(): void;
  onCreateTx(entry: EthereumEntry, tx: workflow.Erc20ApproveTxDetails): void;
}

interface StateProps {
  getAllowances(entry: EthereumEntry): Allowance[];
  getTokenBalance(entry: EthereumEntry, contractAddress: string): TokenAmount;
  getTokenFiatBalance(amount: TokenAmount): CurrencyAmount | undefined;
}

interface DispatchProps {
  getFees(blockchain: BlockchainCode): Promise<Record<(typeof FEE_KEYS)[number], GasPrices>>;
}

const minimalUnit = new Unit(9, '', undefined);

const SetupApproveTransaction: React.FC<OwnProps & StateProps & DispatchProps> = ({
  balances,
  entries,
  initialAllowance,
  tokenRegistry,
  getFees,
  getAllowances,
  getTokenBalance,
  getTokenFiatBalance,
  goBack,
  onCreateTx,
}) => {
  const styles = useStyles();

  const mounted = React.useRef(true);

  const [initializing, setInitializing] = React.useState(true);

  const [currentEntry, setCurrentEntry] = React.useState(() => {
    const [entry] = entries;

    if (initialAllowance == null) {
      return entry;
    }

    const { ownerAddress } = initialAllowance;

    return entries.find(({ address }) => (address == null ? false : address.value === ownerAddress)) ?? entry;
  });

  const prevEntryId = React.useRef(currentEntry.id);

  const [currentBlockchain, setCurrentBlockchain] = React.useState(blockchainIdToCode(currentEntry.blockchain));
  const [currentTokens, setCurrentTokens] = React.useState(tokenRegistry.byBlockchain(currentBlockchain));

  let [token] = currentTokens;

  const assets = currentTokens.reduce<TokenAsset[]>((carry, { address, symbol }) => {
    const balance = getTokenBalance(currentEntry, address);

    if (balance.isPositive()) {
      return [...carry, { address, balance, symbol }];
    }

    return carry;
  }, []);

  let tokenBalance = getTokenBalance(currentEntry, token.address);

  if (tokenBalance.isZero()) {
    const { address, balance } = assets[0] ?? {};

    if (address != null) {
      token = tokenRegistry.byAddress(currentBlockchain, address);
      tokenBalance = balance;
    }
  }

  const [currentToken, setCurrentToken] = React.useState(token);

  const [maxGasPrice, setMaxGasPrice] = React.useState(0);
  const [priorityGasPrice, setPriorityGasPrice] = React.useState(0);

  const zeroAmount = React.useMemo(() => amountFactory(currentBlockchain)(0), [currentBlockchain]);

  const [gasPriceUnit, setGasPriceUnit] = React.useState(zeroAmount.getOptimalUnit(minimalUnit));
  const [gasPriceUnits, setGasPriceUnits] = React.useState(zeroAmount.units);

  const [stdMaxGasPrice, setStdMaxGasPrice] = React.useState(zeroAmount);
  const [highMaxGasPrice, setHighMaxGasPrice] = React.useState(zeroAmount);
  const [lowMaxGasPrice, setLowMaxGasPrice] = React.useState(zeroAmount);

  const prevStdMaxGasPrice = React.useRef(zeroAmount);

  const [stdPriorityGasPrice, setStdPriorityGasPrice] = React.useState(zeroAmount);
  const [highPriorityGasPrice, setHighPriorityGasPrice] = React.useState(zeroAmount);
  const [lowPriorityGasPrice, setLowPriorityGasPrice] = React.useState(zeroAmount);

  const supportEip1559 = Blockchains[currentBlockchain].params.eip1559 ?? false;

  const [useEip1559, setUseEip1559] = React.useState(supportEip1559);

  const [approveTx, setApproveTx] = React.useState(() => {
    const { value: address } = currentEntry.address ?? {};

    const { allowance, spenderAddress } = initialAllowance ?? {};

    let amount: TokenAmount | undefined;
    let target: ApproveTarget | undefined;

    if (allowance?.number.isGreaterThanOrEqualTo(MAX_DISPLAY_ALLOWANCE)) {
      target = ApproveTarget.INFINITE;
    } else {
      amount = allowance;
    }

    const tx = new workflow.CreateErc20ApproveTx({
      amount,
      target,
      approveBy: address,
      allowFor: spenderAddress,
      blockchain: currentBlockchain,
      token: currentToken,
      totalBalance: balances[currentEntry.id],
      totalTokenBalance: getTokenBalance(currentEntry, currentToken.address),
      type: useEip1559 ? EthereumTransactionType.EIP1559 : EthereumTransactionType.LEGACY,
    });

    return tx.dump();
  });

  const [allowInfinite, setAllowInfinite] = React.useState(
    workflow.CreateErc20ApproveTx.fromPlain(approveTx).target === ApproveTarget.INFINITE,
  );

  const fetchFees = (): Promise<void> =>
    getFees(currentBlockchain).then(({ avgLast, avgMiddle, avgTail5 }) => {
      if (mounted) {
        const factory = amountFactory(currentBlockchain);

        const newStdMaxGasPrice = factory(avgTail5.max);
        const newStdPriorityGasPrice = factory(avgTail5.priority);

        setStdMaxGasPrice(newStdMaxGasPrice);
        setHighMaxGasPrice(factory(avgMiddle.max));
        setLowMaxGasPrice(factory(avgLast.max));

        setStdPriorityGasPrice(newStdPriorityGasPrice);
        setHighPriorityGasPrice(factory(avgMiddle.priority));
        setLowPriorityGasPrice(factory(avgLast.priority));

        const gasPriceOptimalUnit = newStdMaxGasPrice.getOptimalUnit(minimalUnit);

        setGasPriceUnit(gasPriceOptimalUnit);
        setGasPriceUnits(newStdMaxGasPrice.units);

        setMaxGasPrice(newStdMaxGasPrice.getNumberByUnit(gasPriceOptimalUnit).toNumber());
        setPriorityGasPrice(newStdPriorityGasPrice.getNumberByUnit(gasPriceOptimalUnit).toNumber());
      }
    });

  const onEntrySelect = (entry: WalletEntry): void => {
    if (isEthereumEntry(entry)) {
      setInitializing(true);

      const blockchain = blockchainIdToCode(entry.blockchain);
      const tokens = tokenRegistry.byBlockchain(blockchain);

      const [token] = tokens;

      setCurrentBlockchain(blockchain);
      setCurrentEntry(entry);
      setCurrentToken(token);
      setCurrentTokens(tokens);

      const tx = workflow.CreateErc20ApproveTx.fromPlain(approveTx);

      tx.approveBy = entry.address?.value;
      tx.type = useEip1559 ? EthereumTransactionType.EIP1559 : EthereumTransactionType.LEGACY;

      tx.setToken(token, balances[entry.id], getTokenBalance(entry, token.address), useEip1559);

      setApproveTx(tx.dump());

      fetchFees().then(() => setInitializing(false));
    }
  };

  const onTokenChange = (contractAddress: string): void => {
    const blockchain = blockchainIdToCode(currentEntry.blockchain);

    if (tokenRegistry.hasAddress(blockchain, contractAddress)) {
      const token = tokenRegistry.byAddress(blockchain, contractAddress);

      setCurrentToken(token);

      const tx = workflow.CreateErc20ApproveTx.fromPlain(approveTx);

      tx.setToken(token, balances[currentEntry.id], getTokenBalance(currentEntry, token.address), useEip1559);

      setApproveTx(tx.dump());
    }
  };

  const onToChange = (to: string | undefined): void => {
    const { allowance } =
      getAllowances(currentEntry).find(
        ({ blockchain, spenderAddress, token }) =>
          blockchain === currentBlockchain && spenderAddress === to && token.address === currentToken.address,
      ) ?? {};

    const tx = workflow.CreateErc20ApproveTx.fromPlain(approveTx);

    tx.allowFor = to;

    if (allowance != null && tx.amount.isZero()) {
      if (allowance.number.isGreaterThanOrEqualTo(MAX_DISPLAY_ALLOWANCE)) {
        tx.target = ApproveTarget.INFINITE;

        setAllowInfinite(true);
      } else {
        tx.amount = allowance;
      }
    }

    setApproveTx(tx.dump());
  };

  const onInfiniteClick = (): void => {
    const allowed = !allowInfinite;

    setAllowInfinite(allowed);

    const tx = workflow.CreateErc20ApproveTx.fromPlain(approveTx);

    tx.target = allowed ? ApproveTarget.INFINITE : ApproveTarget.MAX_AVAILABLE;

    setApproveTx(tx.dump());
  };

  const onAmountChange = (amount: BigAmount): void => {
    const tx = workflow.CreateErc20ApproveTx.fromPlain(approveTx);

    tx.amount = new TokenAmount(amount, tx.amount.units, tx.token);

    setApproveTx(tx.dump());
  };

  const onMaxAmount = (callback: (value: BigAmount) => void): void => {
    const tx = workflow.CreateErc20ApproveTx.fromPlain(approveTx);

    tx.target = ApproveTarget.MAX_AVAILABLE;

    callback(tx.amount);

    setApproveTx(tx.dump());
  };

  const onUseEip1559Change = (checked: boolean): void => {
    setUseEip1559(checked);

    const factory = amountFactory(currentBlockchain);

    const gasPrice = BigAmount.createFor(maxGasPrice, gasPriceUnits, factory, gasPriceUnit);

    const tx = workflow.CreateErc20ApproveTx.fromPlain(approveTx);

    if (checked) {
      tx.gasPrice = undefined;
      tx.maxGasPrice = gasPrice;
      tx.priorityGasPrice = BigAmount.createFor(priorityGasPrice, gasPriceUnits, factory, gasPriceUnit);
    } else {
      tx.gasPrice = gasPrice;
      tx.maxGasPrice = undefined;
      tx.priorityGasPrice = undefined;
    }

    tx.type = checked ? EthereumTransactionType.EIP1559 : EthereumTransactionType.LEGACY;

    setApproveTx(tx.dump());
  };

  const onMaxGasPriceChange = (price: number): void => {
    setMaxGasPrice(price);

    const tx = workflow.CreateErc20ApproveTx.fromPlain(approveTx);

    const gasPrice = BigAmount.createFor(price, gasPriceUnits, amountFactory(currentBlockchain), gasPriceUnit);

    if (useEip1559) {
      tx.gasPrice = undefined;
      tx.maxGasPrice = gasPrice;
    } else {
      tx.gasPrice = gasPrice;
      tx.maxGasPrice = undefined;
    }

    setApproveTx(tx.dump());
  };

  const onPriorityGasPriceChange = (price: number): void => {
    setPriorityGasPrice(price);

    const tx = workflow.CreateErc20ApproveTx.fromPlain(approveTx);

    tx.priorityGasPrice = BigAmount.createFor(price, gasPriceUnits, amountFactory(currentBlockchain), gasPriceUnit);

    setApproveTx(tx.dump());
  };

  React.useEffect(
    () => {
      fetchFees().then(() => setInitializing(false));

      return () => {
        mounted.current = false;
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  React.useEffect(() => {
    if (currentEntry.id === prevEntryId.current) {
      if (!stdMaxGasPrice.equals(prevStdMaxGasPrice.current)) {
        prevStdMaxGasPrice.current = stdMaxGasPrice;

        const tx = workflow.CreateErc20ApproveTx.fromPlain(approveTx);

        if (useEip1559) {
          tx.gasPrice = undefined;
          tx.maxGasPrice = stdMaxGasPrice;
          tx.priorityGasPrice = stdPriorityGasPrice;
        } else {
          tx.gasPrice = stdMaxGasPrice;
          tx.maxGasPrice = undefined;
          tx.priorityGasPrice = undefined;
        }

        setApproveTx(tx);
      }
    } else {
      prevEntryId.current = currentEntry.id;
    }
  }, [approveTx, currentEntry, stdMaxGasPrice, stdPriorityGasPrice, useEip1559]);

  const tx = workflow.CreateErc20ApproveTx.fromPlain(approveTx);

  return (
    <>
      <FormRow>
        <FormLabel>From</FormLabel>
        <SelectEntry entries={entries} disabled={initializing} selected={currentEntry} onSelect={onEntrySelect} />
      </FormRow>
      <FormRow>
        <FormLabel>Token</FormLabel>
        <SelectAsset
          asset={currentToken.address}
          assets={assets}
          balance={tokenBalance}
          fiatBalance={getTokenFiatBalance(tokenBalance)}
          onChangeAsset={onTokenChange}
        />
      </FormRow>
      <FormRow>
        <FormLabel>Spender</FormLabel>
        <ToField blockchain={approveTx.blockchain} to={approveTx.allowFor} onChange={onToChange} />
      </FormRow>
      <FormRow>
        <FormLabel>Amount</FormLabel>
        <div className={styles.amountField}>
          <Tooltip title="Unrestricted access">
            <IconButton
              className={styles.amountFieldButton}
              color={allowInfinite ? 'primary' : 'secondary'}
              onClick={onInfiniteClick}
            >
              <InfiniteIcon />
            </IconButton>
          </Tooltip>
          {!allowInfinite && (
            <AmountField
              amount={approveTx.amount}
              fieldWidth={380}
              maxAmount={approveTx.totalTokenBalance}
              units={approveTx.totalTokenBalance.units}
              onChangeAmount={onAmountChange}
              onMaxClick={onMaxAmount}
            />
          )}
        </div>
      </FormRow>
      {tx.amount.isZero() && (
        <FormRow>
          <FormLabel />
          <Alert severity="info">
            By setting the value to &quot;0&quot;, you prohibit any token transfers by target address.
          </Alert>
        </FormRow>
      )}
      {allowInfinite && (
        <FormRow>
          <FormLabel />
          <Alert severity="warning">Unrestricted access. Grant only to trusted addresses.</Alert>
        </FormRow>
      )}
      <EthTxSettings
        initializing={initializing}
        supportEip1559={supportEip1559}
        useEip1559={useEip1559}
        gasPriceUnit={gasPriceUnit}
        maxGasPrice={maxGasPrice}
        stdMaxGasPrice={stdMaxGasPrice.getNumberByUnit(gasPriceUnit).toNumber()}
        lowMaxGasPrice={lowMaxGasPrice.getNumberByUnit(gasPriceUnit).toNumber()}
        highMaxGasPrice={highMaxGasPrice.getNumberByUnit(gasPriceUnit).toNumber()}
        priorityGasPrice={priorityGasPrice}
        stdPriorityGasPrice={stdPriorityGasPrice.getNumberByUnit(gasPriceUnit).toNumber()}
        lowPriorityGasPrice={lowPriorityGasPrice.getNumberByUnit(gasPriceUnit).toNumber()}
        highPriorityGasPrice={highPriorityGasPrice.getNumberByUnit(gasPriceUnit).toNumber()}
        onUse1559Change={onUseEip1559Change}
        onMaxGasPriceChange={onMaxGasPriceChange}
        onPriorityGasPriceChange={onPriorityGasPriceChange}
      />
      <FormRow last>
        <FormLabel />
        <ButtonGroup classes={{ container: styles.buttons }}>
          {initializing && (
            <Button disabled icon={<CircularProgress size={16} />} label="Checking the network" variant="text" />
          )}
          <Button label="Cancel" onClick={goBack} />
          <Button
            primary
            disabled={initializing || tx.validate() !== ValidationResult.OK}
            label="Create Transaction"
            onClick={() => onCreateTx(currentEntry, approveTx)}
          />
        </ButtonGroup>
      </FormRow>
    </>
  );
};

export default connect<StateProps, DispatchProps, OwnProps, IState>(
  (state, { tokenRegistry }) => ({
    getAllowances(entry) {
      return allowance.selectors.getEntryAllowances(state, entry);
    },
    getTokenBalance(entry, contractAddress) {
      const blockchain = blockchainIdToCode(entry.blockchain);
      const token = tokenRegistry.byAddress(blockchain, contractAddress);
      const zero = token.getAmount(0);

      if (entry.address == null) {
        return zero;
      }

      return tokens.selectors.selectBalance(state, blockchain, entry.address.value, token.address) ?? zero;
    },
    getTokenFiatBalance(amount) {
      const [{ fiatBalance }] = accounts.selectors.withFiatConversion(state, [amount]);

      return fiatBalance;
    },
  }),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (dispatch: any) => ({
    getFees(blockchain) {
      return dispatch(transaction.actions.getFee(blockchain));
    },
  }),
)(SetupApproveTransaction);