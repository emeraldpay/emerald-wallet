import { BigAmount, CreateAmount } from '@emeraldpay/bigamount';
import { WeiAny } from '@emeraldpay/bigamount-crypto';
import { WalletEntry, isEthereumEntry } from '@emeraldpay/emerald-vault-core';
import {
  BlockchainCode,
  Blockchains,
  CoinTicker,
  EthereumTransaction,
  EthereumTransactionType,
  Token,
  TokenAmount,
  TokenRegistry,
  amountFactory,
  blockchainIdToCode,
  formatAmount,
  workflow,
} from '@emeraldwallet/core';
import { ValidationResult } from '@emeraldwallet/core/lib/workflow';
import { FEE_KEYS, GasPrices, IState, SignData, accounts, screen, tokens, transaction } from '@emeraldwallet/store';
import { AccountSelect, Back, Button, ButtonGroup, FormLabel, FormRow, Page, PasswordInput } from '@emeraldwallet/ui';
import { CircularProgress, Typography, createStyles, makeStyles } from '@material-ui/core';
import { ToggleButton, ToggleButtonGroup } from '@material-ui/lab';
import * as React from 'react';
import { connect } from 'react-redux';
import { AmountField } from '../../common/AmountField';
import EthTxSettings from '../../common/EthTxSettings/EthTxSettings';
import WaitLedger from '../../ledger/WaitLedger';

const useStyles = makeStyles(
  createStyles({
    buttons: {
      display: 'flex',
      justifyContent: 'end',
      width: '100%',
    },
  }),
);

enum Stages {
  SETUP = 'setup',
  SIGN = 'sign',
}

interface OwnProps {
  contractAddress: string;
  entry: WalletEntry;
}

interface StateProps {
  addresses: Record<string, string>;
  blockchain: BlockchainCode;
  coinTicker: CoinTicker;
  isHardware: boolean;
  supportEip1559: boolean;
  token: Token;
  getBalance(address?: string): BigAmount;
  getBalancesByAddress(address: string): string[];
  getEntryByAddress(address: string): WalletEntry | undefined;
  getTokenBalanceByAddress(address?: string): TokenAmount;
}

interface DispatchProps {
  estimateGas(tx: EthereumTransaction): Promise<number>;
  getFees(blockchain: BlockchainCode): Promise<Record<(typeof FEE_KEYS)[number], GasPrices>>;
  goBack(): void;
  signTransaction(entryId: string, tx: workflow.CreateErc20WrappedTx, token: Token, password?: string): Promise<void>;
  verifyGlobalKey(password: string): Promise<boolean>;
}

const CreateConvertTransaction: React.FC<OwnProps & StateProps & DispatchProps> = ({
  addresses,
  blockchain,
  coinTicker,
  entry: { address },
  isHardware,
  supportEip1559,
  token,
  estimateGas,
  getBalance,
  getBalancesByAddress,
  getEntryByAddress,
  getFees,
  getTokenBalanceByAddress,
  goBack,
  signTransaction,
  verifyGlobalKey,
}) => {
  const styles = useStyles();

  const mounted = React.useRef(true);

  const [initializing, setInitializing] = React.useState(true);
  const [preparing, setPreparing] = React.useState(false);
  const [verifying, setVerifying] = React.useState(false);

  const [convertable, setConvertable] = React.useState<string>(coinTicker);

  const [convertTx, setConvertTx] = React.useState(() => {
    const tx = new workflow.CreateErc20WrappedTx({
      blockchain,
      token,
      address: address?.value,
      totalBalance: getBalance(address?.value),
      totalTokenBalance: getTokenBalanceByAddress(address?.value),
      type: supportEip1559 ? EthereumTransactionType.EIP1559 : EthereumTransactionType.LEGACY,
    });

    return tx.dump();
  });

  const [useEip1559, setUseEip1559] = React.useState(supportEip1559);

  const factory = amountFactory(blockchain) as CreateAmount<WeiAny>;
  const zeroAmount = factory(0);

  const [maxGasPrice, setMaxGasPrice] = React.useState(zeroAmount);
  const [priorityGasPrice, setPriorityGasPrice] = React.useState(zeroAmount);

  const [stdMaxGasPrice, setStdMaxGasPrice] = React.useState(zeroAmount);
  const [highMaxGasPrice, setHighMaxGasPrice] = React.useState(zeroAmount);
  const [lowMaxGasPrice, setLowMaxGasPrice] = React.useState(zeroAmount);

  const [stdPriorityGasPrice, setStdPriorityGasPrice] = React.useState(zeroAmount);
  const [highPriorityGasPrice, setHighPriorityGasPrice] = React.useState(zeroAmount);
  const [lowPriorityGasPrice, setLowPriorityGasPrice] = React.useState(zeroAmount);

  const [stage, setStage] = React.useState(Stages.SETUP);

  const [password, setPassword] = React.useState<string>();
  const [passwordError, setPasswordError] = React.useState<string>();

  const onChangeConvertable = (event: React.MouseEvent<HTMLElement>, value: string): void => {
    const converting = value ?? convertable;

    const tx = workflow.CreateErc20WrappedTx.fromPlain(convertTx);

    const { number: amount } = tx.amount;

    tx.amount = converting === coinTicker ? factory(amount) : token.getAmount(amount);
    tx.target = workflow.TxTarget.MANUAL;
    tx.rebalance();

    setConvertable(converting);
    setConvertTx(tx.dump());
  };

  const onChangeAddress = (address: string): void => {
    const tx = workflow.CreateErc20WrappedTx.fromPlain(convertTx);

    tx.address = address;
    tx.totalBalance = getBalance(address);
    tx.totalTokenBalance = getTokenBalanceByAddress(address);
    tx.rebalance();

    setConvertTx(tx.dump());
  };

  const onChangeAmount = (amount: BigAmount): void => {
    const tx = workflow.CreateErc20WrappedTx.fromPlain(convertTx);

    tx.amount = amount;
    tx.target = workflow.TxTarget.MANUAL;

    setConvertTx(tx.dump());
  };

  const onClickMaxAmount = (callback: (value: BigAmount) => void): void => {
    const tx = workflow.CreateErc20WrappedTx.fromPlain(convertTx);

    tx.target = workflow.TxTarget.SEND_ALL;
    tx.rebalance();

    callback(tx.amount);

    setConvertTx(tx.dump());
  };

  const onUseEip1559Change = (checked: boolean): void => {
    setUseEip1559(checked);

    const tx = workflow.CreateErc20WrappedTx.fromPlain(convertTx);

    if (checked) {
      tx.gasPrice = undefined;
      tx.maxGasPrice = maxGasPrice;
      tx.priorityGasPrice = maxGasPrice;
    } else {
      tx.gasPrice = maxGasPrice;
      tx.maxGasPrice = undefined;
      tx.priorityGasPrice = undefined;
    }

    tx.type = checked ? EthereumTransactionType.EIP1559 : EthereumTransactionType.LEGACY;

    setConvertTx(tx.dump());
  };

  const onMaxGasPriceChange = (price: WeiAny): void => {
    setMaxGasPrice(price);

    const tx = workflow.CreateErc20WrappedTx.fromPlain(convertTx);

    if (useEip1559) {
      tx.gasPrice = undefined;
      tx.maxGasPrice = price;
    } else {
      tx.gasPrice = price;
      tx.maxGasPrice = undefined;
    }

    tx.rebalance();

    setConvertTx(tx.dump());
  };

  const onPriorityGasPriceChange = (price: WeiAny): void => {
    setPriorityGasPrice(price);

    const tx = workflow.CreateErc20WrappedTx.fromPlain(convertTx);

    tx.priorityGasPrice = price;
    tx.rebalance();

    setConvertTx(tx.dump());
  };

  const onCreateTransaction = async (): Promise<void> => {
    setPreparing(true);

    const tx = workflow.CreateErc20WrappedTx.fromPlain(convertTx);

    tx.gas = await estimateGas(tx.build());
    tx.rebalance();

    setConvertTx(tx.dump());
    setStage(Stages.SIGN);

    setPreparing(false);
  };

  const onSignTransaction = async (): Promise<void> => {
    setPasswordError(undefined);

    const tx = workflow.CreateErc20WrappedTx.fromPlain(convertTx);

    if (tx.address == null) {
      return;
    }

    const entry = getEntryByAddress(tx.address);

    if (entry == null) {
      return;
    }

    if (isHardware) {
      await signTransaction(entry.id, tx, token);
    } else {
      if (password == null) {
        return;
      }

      setVerifying(true);

      const correctPassword = await verifyGlobalKey(password);

      if (correctPassword) {
        await signTransaction(entry.id, tx, token, password);
      } else {
        setPasswordError('Incorrect password');
      }

      if (mounted.current) {
        setVerifying(false);
      }
    }
  };

  const onPasswordEnter = async (): Promise<void> => {
    if (!verifying && (password?.length ?? 0) > 0) {
      await onSignTransaction();
    }
  };

  React.useEffect(
    () => {
      getFees(blockchain).then(({ avgLast, avgMiddle, avgTail5 }) => {
        if (mounted.current) {
          const newStdMaxGasPrice = factory(avgTail5.max) as WeiAny;
          const newStdPriorityGasPrice = factory(avgTail5.priority) as WeiAny;

          setStdMaxGasPrice(newStdMaxGasPrice);
          setHighMaxGasPrice(factory(avgMiddle.max) as WeiAny);
          setLowMaxGasPrice(factory(avgLast.max) as WeiAny);

          setStdPriorityGasPrice(newStdPriorityGasPrice);
          setHighPriorityGasPrice(factory(avgMiddle.priority) as WeiAny);
          setLowPriorityGasPrice(factory(avgLast.priority) as WeiAny);

          setMaxGasPrice(newStdMaxGasPrice);
          setPriorityGasPrice(newStdPriorityGasPrice);

          const tx = workflow.CreateErc20WrappedTx.fromPlain(convertTx);

          if (supportEip1559) {
            tx.gasPrice = undefined;
            tx.maxGasPrice = newStdMaxGasPrice;
            tx.priorityGasPrice = newStdPriorityGasPrice;
          } else {
            tx.gasPrice = newStdMaxGasPrice;
            tx.maxGasPrice = undefined;
            tx.priorityGasPrice = undefined;
          }

          tx.rebalance();

          setConvertTx(tx.dump());
          setInitializing(false);
        }
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  React.useEffect(() => {
    return () => {
      mounted.current = false;
    };
  }, []);

  const currentTx = workflow.CreateErc20WrappedTx.fromPlain(convertTx);

  return (
    <Page title="Create Convert Transaction" leftIcon={<Back onClick={goBack} />}>
      {stage === Stages.SETUP && (
        <>
          <FormRow>
            <FormLabel />
            <ToggleButtonGroup exclusive={true} value={convertable} onChange={onChangeConvertable}>
              <ToggleButton disabled={initializing} value={coinTicker}>
                Ether to {token.symbol}
              </ToggleButton>
              <ToggleButton disabled={initializing} value={token.symbol}>
                {token.symbol} to Ether
              </ToggleButton>
            </ToggleButtonGroup>
          </FormRow>
          <FormRow>
            <FormLabel>From</FormLabel>
            <AccountSelect
              accounts={addresses}
              disabled={initializing}
              selectedAccount={convertTx.address}
              getBalancesByAddress={(address) => getBalancesByAddress(address)}
              onChange={onChangeAddress}
            />
          </FormRow>
          <FormRow>
            <FormLabel>Amount</FormLabel>
            <AmountField
              disabled={initializing}
              amount={currentTx.amount}
              units={currentTx.amount.units}
              onChangeAmount={onChangeAmount}
              onMaxClick={onClickMaxAmount}
            />
          </FormRow>
          <EthTxSettings
            factory={factory}
            initializing={initializing}
            supportEip1559={supportEip1559}
            useEip1559={useEip1559}
            maxGasPrice={maxGasPrice}
            stdMaxGasPrice={stdMaxGasPrice}
            lowMaxGasPrice={lowMaxGasPrice}
            highMaxGasPrice={highMaxGasPrice}
            priorityGasPrice={priorityGasPrice}
            stdPriorityGasPrice={stdPriorityGasPrice}
            lowPriorityGasPrice={lowPriorityGasPrice}
            highPriorityGasPrice={highPriorityGasPrice}
            onUse1559Change={onUseEip1559Change}
            onMaxGasPriceChange={onMaxGasPriceChange}
            onPriorityGasPriceChange={onPriorityGasPriceChange}
          />
          <FormRow classes={{ container: styles.buttons }}>
            <FormLabel />
            <ButtonGroup classes={{ container: styles.buttons }}>
              {initializing && (
                <Button disabled icon={<CircularProgress size={16} />} label="Checking the network" variant="text" />
              )}
              <Button label="Cancel" onClick={goBack} />
              <Button
                primary
                disabled={initializing || preparing || currentTx.validate() !== ValidationResult.OK}
                label="Create Transaction"
                onClick={onCreateTransaction}
              />
            </ButtonGroup>
          </FormRow>
        </>
      )}
      {stage === Stages.SIGN && (
        <>
          <FormRow>
            <FormLabel />
            <Typography>
              Convert {formatAmount(currentTx.amount, 6)} with fee {formatAmount(currentTx.getFees(), 6)}
            </Typography>
          </FormRow>
          {isHardware ? (
            <WaitLedger fullSize blockchain={currentTx.blockchain} onConnected={() => onSignTransaction()} />
          ) : (
            <FormRow>
              <FormLabel>Password</FormLabel>
              <PasswordInput
                error={passwordError}
                minLength={1}
                placeholder="Enter existing password"
                showLengthNotice={false}
                onChange={setPassword}
                onPressEnter={onPasswordEnter}
              />
            </FormRow>
          )}
          <FormRow last>
            <FormLabel />
            <ButtonGroup classes={{ container: styles.buttons }}>
              <Button label="Cancel" onClick={goBack} />
              {!isHardware && (
                <Button
                  primary
                  disabled={verifying || (password?.length ?? 0) === 0}
                  label="Sign Transaction"
                  onClick={onSignTransaction}
                />
              )}
            </ButtonGroup>
          </FormRow>
        </>
      )}
    </Page>
  );
};

export default connect<StateProps, DispatchProps, OwnProps, IState>(
  (state, { contractAddress, entry }) => {
    const tokenRegistry = new TokenRegistry(state.application.tokens);

    const blockchain = blockchainIdToCode(entry.blockchain);
    const token = tokenRegistry.byAddress(blockchain, contractAddress);
    const zeroAmount = amountFactory(blockchain)(0);

    const { coinTicker, eip1559: supportEip1559 = false } = Blockchains[blockchain].params;

    let isHardware = false;

    const wallet = accounts.selectors.findWalletByEntryId(state, entry.id);

    if (wallet != null) {
      const [account] = wallet.reserved ?? [];

      if (account != null) {
        isHardware = accounts.selectors.isHardwareSeed(state, { type: 'id', value: account.seedId });
      }
    }

    const entries = wallet?.entries.filter((entry) => !entry.receiveDisabled) ?? [];

    const addresses = Object.fromEntries(
      entries.reduce<Map<string, string>>(
        (carry, { address, blockchain }) =>
          address != null && blockchain === entry.blockchain ? carry.set(address.value, address.value) : carry,
        new Map(),
      ),
    );

    return {
      addresses,
      blockchain,
      coinTicker,
      isHardware,
      supportEip1559,
      token,
      getBalance(address) {
        if (address == null) {
          return zeroAmount;
        }

        const entryByAddress = accounts.selectors.findAccountByAddress(state, address, blockchain);

        if (entryByAddress == null || !isEthereumEntry(entryByAddress)) {
          return zeroAmount;
        }

        return accounts.selectors.getBalance(state, entryByAddress.id, zeroAmount) ?? zeroAmount;
      },
      getBalancesByAddress(address) {
        const entryByAddress = accounts.selectors.findAccountByAddress(state, address, blockchain);

        if (entryByAddress == null || !isEthereumEntry(entryByAddress)) {
          return [];
        }

        const tokenZero = token.getAmount(0);

        const balance = accounts.selectors.getBalance(state, entryByAddress.id, zeroAmount) ?? zeroAmount;
        const tokenBalance = tokens.selectors.selectBalance(state, blockchain, address, token.address) ?? tokenZero;

        return [balance, tokenBalance].map((amount) => formatAmount(amount));
      },
      getEntryByAddress(address) {
        return accounts.selectors.findAccountByAddress(state, address, blockchain);
      },
      getTokenBalanceByAddress(address) {
        const zero = token.getAmount(0);

        if (address == null) {
          return zero;
        }

        const tokenBalance = tokens.selectors.selectBalance(state, blockchain, address, token.address);

        return tokenBalance ?? zero;
      },
    };
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (dispatch: any, { entry }) => ({
    estimateGas(tx) {
      return dispatch(transaction.actions.estimateGas(blockchainIdToCode(entry.blockchain), tx));
    },
    getFees(blockchain) {
      return dispatch(transaction.actions.getFee(blockchain));
    },
    goBack() {
      dispatch(screen.actions.goBack());
    },
    async signTransaction(entryId, tx, token, password) {
      if (tx.address == null) {
        return;
      }

      const signed: SignData | undefined = await dispatch(
        transaction.actions.signTransaction(entryId, tx.build(), password),
      );

      if (signed != null) {
        const blockchainCode = blockchainIdToCode(entry.blockchain);
        const zeroAmount = amountFactory(blockchainCode)(0);

        dispatch(
          screen.actions.gotoScreen(
            screen.Pages.BROADCAST_TX,
            {
              ...signed,
              fee: (tx.maxGasPrice ?? tx.gasPrice ?? zeroAmount).multiply(tx.gas),
              originalAmount: tx.amount,
              tokenAmount: token.getAmount(tx.amount.number),
            },
            null,
            true,
          ),
        );
      }
    },
    verifyGlobalKey(password) {
      return dispatch(accounts.actions.verifyGlobalKey(password));
    },
  }),
)(CreateConvertTransaction);
