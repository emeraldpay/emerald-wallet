import { BigAmount, Unit } from '@emeraldpay/bigamount';
import { WalletEntry, isEthereumEntry } from '@emeraldpay/emerald-vault-core';
import {
  BlockchainCode,
  Blockchains,
  EthereumTransaction,
  EthereumTransactionType,
  Token,
  TokenRegistry,
  amountFactory,
  blockchainIdToCode,
  formatAmount,
  workflow,
} from '@emeraldwallet/core';
import { FEE_KEYS, GasPrices, IState, SignData, accounts, screen, tokens, transaction } from '@emeraldwallet/store';
import { Back, Button, ButtonGroup, FormAccordion, FormLabel, FormRow, Page, PasswordInput } from '@emeraldwallet/ui';
import {
  Box,
  CircularProgress,
  FormControlLabel,
  FormHelperText,
  Slider,
  Switch,
  Typography,
  createStyles,
  makeStyles,
} from '@material-ui/core';
import { ToggleButton, ToggleButtonGroup } from '@material-ui/lab';
import * as React from 'react';
import { connect } from 'react-redux';
import WaitLedger from '../../ledger/WaitLedger';
import AmountField from '../CreateTx/AmountField/AmountField';
import FromField from '../CreateTx/FromField';

const useStyles = makeStyles(
  createStyles({
    inputField: {
      flexGrow: 5,
    },
    gasPriceTypeBox: {
      float: 'left',
      height: 40,
      width: 240,
    },
    gasPriceSliderBox: {
      float: 'left',
      width: 300,
    },
    gasPriceHelpBox: {
      clear: 'left',
      width: 500,
    },
    gasPriceSlider: {
      marginBottom: 10,
      paddingTop: 10,
      width: 300,
    },
    gasPriceHelp: {
      position: 'initial',
      paddingLeft: 10,
    },
    gasPriceMarkLabel: {
      fontSize: '0.7em',
      opacity: 0.8,
    },
    gasPriceValueLabel: {
      fontSize: '0.7em',
    },
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
  addresses: string[];
  blockchain: BlockchainCode;
  eip1559: boolean;
  isHardware: boolean;
  token: Token;
  getBalance(address?: string): BigAmount;
  getBalancesByAddress(address: string, token: string): string[];
  getEntryByAddress(address: string): WalletEntry | undefined;
  getTokenBalanceByAddress(address?: string): BigAmount;
}

interface DispatchProps {
  checkGlobalKey(password: string): Promise<boolean>;
  estimateGas(tx: EthereumTransaction): Promise<number>;
  getFees(blockchain: BlockchainCode): Promise<Record<(typeof FEE_KEYS)[number], GasPrices>>;
  goBack(): void;
  signTransaction(entryId: string, tx: workflow.CreateErc20WrappedTx, token: Token, password?: string): Promise<void>;
}

const minimalUnit = new Unit(9, '', undefined);

const CreateConvertTransaction: React.FC<OwnProps & StateProps & DispatchProps> = ({
  addresses,
  blockchain,
  contractAddress,
  eip1559,
  entry: { address },
  token,
  isHardware,
  checkGlobalKey,
  estimateGas,
  getBalance,
  getBalancesByAddress,
  getEntryByAddress,
  getFees,
  getTokenBalanceByAddress,
  goBack,
  signTransaction,
}) => {
  const styles = useStyles();

  const coinTicker = React.useMemo(() => Blockchains[blockchain].params.coinTicker, [blockchain]);
  const zeroAmount = React.useMemo(() => amountFactory(blockchain)(0), [blockchain]);

  const [convertable, setConvertable] = React.useState<string>(coinTicker);
  const [initializing, setInitializing] = React.useState(true);

  const [convertTx, setConvertTx] = React.useState(() => {
    const tx = new workflow.CreateErc20WrappedTx({
      blockchain,
      token,
      address: address?.value,
      totalBalance: getBalance(address?.value),
      totalTokenBalance: getTokenBalanceByAddress(address?.value),
      type: eip1559 ? EthereumTransactionType.EIP1559 : EthereumTransactionType.LEGACY,
    });

    return tx.dump();
  });

  const [stdMaxGasPrice, setStdMaxGasPrice] = React.useState(zeroAmount);
  const [highMaxGasPrice, setHighMaxGasPrice] = React.useState(zeroAmount);
  const [lowMaxGasPrice, setLowMaxGasPrice] = React.useState(zeroAmount);

  const [stdPriorityGasPrice, setStdPriorityGasPrice] = React.useState(zeroAmount);
  const [highPriorityGasPrice, setHighPriorityGasPrice] = React.useState(zeroAmount);
  const [lowPriorityGasPrice, setLowPriorityGasPrice] = React.useState(zeroAmount);

  const [gasPriceUnit, setGasPriceUnit] = React.useState(zeroAmount.getOptimalUnit(minimalUnit));
  const [gasPriceUnits, setGasPriceUnits] = React.useState(zeroAmount.units);

  const [maxGasPrice, setMaxGasPrice] = React.useState(0);
  const [useStdMaxGasPrice, setUseStdMaxGasPrice] = React.useState(true);

  const [priorityGasPrice, setPriorityGasPrice] = React.useState(0);
  const [useStdPriorityGasPrice, setUseStdPriorityGasPrice] = React.useState(true);

  const [useEip1559, setUseEip1559] = React.useState(eip1559);

  const [stage, setStage] = React.useState(Stages.SETUP);
  const [password, setPassword] = React.useState('');

  const [passwordError, setPasswordError] = React.useState<string>();

  const oldAmount = React.useRef(convertTx.amount);

  const onChangeConvertable = (event: React.MouseEvent<HTMLElement>, value: string): void => {
    const converting = value ?? convertable;

    const tx = workflow.CreateErc20WrappedTx.fromPlain(convertTx);

    const { number: amount } = tx.amount;

    tx.amount = converting === coinTicker ? amountFactory(blockchain)(amount) : token.getAmount(amount);
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

  const onClickMaxAmount = (): void => {
    const tx = workflow.CreateErc20WrappedTx.fromPlain(convertTx);

    tx.target = workflow.TxTarget.SEND_ALL;
    tx.rebalance();

    setConvertTx(tx.dump());
  };

  const onChangeMaxGasPrice = (price: number): void => {
    const tx = workflow.CreateErc20WrappedTx.fromPlain(convertTx);

    const gasPrice = BigAmount.createFor(price, gasPriceUnits, amountFactory(blockchain), gasPriceUnit);

    if (useEip1559) {
      tx.gasPrice = undefined;
      tx.maxGasPrice = gasPrice;
    } else {
      tx.gasPrice = gasPrice;
      tx.maxGasPrice = undefined;
    }

    tx.rebalance();

    setConvertTx(tx.dump());
  };

  const onChangePriorityGasPrice = (price: number): void => {
    const tx = workflow.CreateErc20WrappedTx.fromPlain(convertTx);

    tx.priorityGasPrice = BigAmount.createFor(price, gasPriceUnits, amountFactory(blockchain), gasPriceUnit);
    tx.rebalance();

    setConvertTx(tx.dump());
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
      const correctPassword = await checkGlobalKey(password);

      if (correctPassword) {
        await signTransaction(entry.id, tx, token, password);
      } else {
        setPasswordError('Incorrect password');
      }
    }
  };

  const onUseEip1559Change = React.useCallback(
    ({ target: { checked } }: React.ChangeEvent<HTMLInputElement>) => {
      const factory = amountFactory(blockchain);

      const gasPrice = BigAmount.createFor(maxGasPrice, gasPriceUnits, factory, gasPriceUnit);

      const tx = workflow.CreateErc20WrappedTx.fromPlain(convertTx);

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

      setConvertTx(tx.dump());
      setUseEip1559(checked);
    },
    [blockchain, convertTx, gasPriceUnit, gasPriceUnits, maxGasPrice, priorityGasPrice],
  );

  React.useEffect(
    () => {
      (async (): Promise<void> => {
        const fees = await getFees(blockchain);

        const { avgLast, avgMiddle, avgTail5 } = fees;

        const factory = amountFactory(blockchain);

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

        const tx = workflow.CreateErc20WrappedTx.fromPlain(convertTx);

        if (eip1559) {
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
      })();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  React.useEffect(() => {
    if (oldAmount.current == null || convertTx.amount?.equals(oldAmount.current) === false) {
      oldAmount.current = convertTx.amount;

      const total =
        convertTx.totalBalance != null && convertTx.amount?.units.equals(convertTx.totalBalance.units) === true
          ? convertTx.totalBalance
          : convertTx.totalTokenBalance;

      if (total?.number != null && convertTx.amount?.number.isLessThanOrEqualTo(total.number) === true) {
        (async (): Promise<void> => {
          const tx = workflow.CreateErc20WrappedTx.fromPlain(convertTx);

          tx.gas = await estimateGas(tx.build());
          tx.rebalance();

          setConvertTx(tx.dump());
        })();
      }
    }
  }, [blockchain, contractAddress, convertable, convertTx, estimateGas]);

  const currentTx = workflow.CreateErc20WrappedTx.fromPlain(convertTx);

  const gasPriceOptimalUnit = stdMaxGasPrice.getOptimalUnit(minimalUnit);

  const stdMaxGasPriceNumber = stdMaxGasPrice.getNumberByUnit(gasPriceOptimalUnit).toNumber();
  const highMaxGasPriceNumber = highMaxGasPrice.getNumberByUnit(gasPriceOptimalUnit).toNumber();
  const lowMaxGasPriceNumber = lowMaxGasPrice.getNumberByUnit(gasPriceOptimalUnit).toNumber();

  const stdPriorityGasPriceNumber = stdPriorityGasPrice.getNumberByUnit(gasPriceOptimalUnit).toNumber();
  const highPriorityGasPriceNumber = highPriorityGasPrice.getNumberByUnit(gasPriceOptimalUnit).toNumber();
  const lowPriorityGasPriceNumber = lowPriorityGasPrice.getNumberByUnit(gasPriceOptimalUnit).toNumber();

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
            <FromField
              accounts={addresses}
              disabled={initializing}
              selectedAccount={convertTx.address}
              onChangeAccount={onChangeAddress}
              getBalancesByAddress={(address) => getBalancesByAddress(address, contractAddress)}
            />
          </FormRow>
          <FormRow>
            <AmountField
              disabled={initializing}
              amount={currentTx.amount}
              units={currentTx.amount.units}
              onChangeAmount={onChangeAmount}
              onMaxClicked={onClickMaxAmount}
            />
          </FormRow>
          <FormAccordion
            title={
              <FormRow last>
                <FormLabel>Settings</FormLabel>
                {useEip1559 ? 'EIP-1559' : 'Basic Type'} / {maxGasPrice.toFixed(2)} {gasPriceOptimalUnit.toString()}
                {useEip1559 ? ' Max Gas Price' : ' Gas Price'}
                {useEip1559
                  ? ` / ${priorityGasPrice.toFixed(2)} ${gasPriceOptimalUnit.toString()} Priority Gas Price`
                  : null}
              </FormRow>
            }
          >
            <FormRow>
              <FormLabel>Use EIP-1559</FormLabel>
              <FormControlLabel
                control={
                  <Switch checked={useEip1559} color="primary" disabled={initializing} onChange={onUseEip1559Change} />
                }
                label={useEip1559 ? 'Enabled' : 'Disabled'}
              />
            </FormRow>
            <FormRow>
              <FormLabel top>{useEip1559 ? 'Max gas price' : 'Gas price'}</FormLabel>
              <Box className={styles.inputField}>
                <Box className={styles.gasPriceTypeBox}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={useStdMaxGasPrice}
                        color="primary"
                        disabled={initializing}
                        onChange={(event): void => {
                          const checked = event.target.checked;

                          if (checked) {
                            setMaxGasPrice(stdMaxGasPriceNumber);
                            onChangeMaxGasPrice(stdMaxGasPriceNumber);
                          }

                          setUseStdMaxGasPrice(checked);
                        }}
                      />
                    }
                    label={useStdMaxGasPrice ? 'Standard Price' : 'Custom Price'}
                  />
                </Box>
                {!useStdMaxGasPrice && (
                  <Box className={styles.gasPriceSliderBox}>
                    <Slider
                      aria-labelledby="discrete-slider"
                      classes={{
                        markLabel: styles.gasPriceMarkLabel,
                        valueLabel: styles.gasPriceValueLabel,
                      }}
                      className={styles.gasPriceSlider}
                      marks={[
                        { value: lowMaxGasPriceNumber, label: 'Slow' },
                        { value: highMaxGasPriceNumber, label: 'Urgent' },
                      ]}
                      max={highMaxGasPriceNumber}
                      min={lowMaxGasPriceNumber}
                      step={0.01}
                      value={maxGasPrice}
                      valueLabelDisplay="auto"
                      getAriaValueText={(): string => `${maxGasPrice.toFixed(2)} ${gasPriceUnits.toString()}`}
                      onChange={(event, value): void => {
                        setMaxGasPrice(value as number);
                        onChangeMaxGasPrice(value as number);
                      }}
                      valueLabelFormat={(value): string => value.toFixed(2)}
                    />
                  </Box>
                )}
                <Box className={styles.gasPriceHelpBox}>
                  <FormHelperText className={styles.gasPriceHelp}>
                    {maxGasPrice.toFixed(2)} {gasPriceUnits.toString()}
                  </FormHelperText>
                </Box>
              </Box>
            </FormRow>
            {useEip1559 && (
              <FormRow>
                <FormLabel top>Priority gas price</FormLabel>
                <Box className={styles.inputField}>
                  <Box className={styles.gasPriceTypeBox}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={useStdPriorityGasPrice}
                          color="primary"
                          disabled={initializing}
                          onChange={(event): void => {
                            const checked = event.target.checked;

                            if (checked) {
                              setPriorityGasPrice(stdPriorityGasPriceNumber);
                              onChangePriorityGasPrice(stdPriorityGasPriceNumber);
                            }

                            setUseStdPriorityGasPrice(checked);
                          }}
                        />
                      }
                      label={useStdPriorityGasPrice ? 'Standard Price' : 'Custom Price'}
                    />
                  </Box>
                  {!useStdPriorityGasPrice && (
                    <Box className={styles.gasPriceSliderBox}>
                      <Slider
                        aria-labelledby="discrete-slider"
                        classes={{
                          markLabel: styles.gasPriceMarkLabel,
                          valueLabel: styles.gasPriceValueLabel,
                        }}
                        className={styles.gasPriceSlider}
                        marks={[
                          { value: lowPriorityGasPriceNumber, label: 'Slow' },
                          { value: highPriorityGasPriceNumber, label: 'Urgent' },
                        ]}
                        max={highPriorityGasPriceNumber}
                        min={lowPriorityGasPriceNumber}
                        step={0.01}
                        value={priorityGasPrice}
                        valueLabelDisplay="auto"
                        getAriaValueText={(): string => `${priorityGasPrice.toFixed(2)} ${gasPriceUnits.toString()}`}
                        onChange={(event, value): void => {
                          setPriorityGasPrice(value as number);
                          onChangePriorityGasPrice(value as number);
                        }}
                        valueLabelFormat={(value): string => value.toFixed(2)}
                      />
                    </Box>
                  )}
                  <Box className={styles.gasPriceHelpBox}>
                    <FormHelperText className={styles.gasPriceHelp}>
                      {priorityGasPrice.toFixed(2)} {gasPriceUnits.toString()}
                    </FormHelperText>
                  </Box>
                </Box>
              </FormRow>
            )}
          </FormAccordion>
          <FormRow classes={{ container: styles.buttons }}>
            <FormLabel />
            <ButtonGroup classes={{ container: styles.buttons }}>
              {initializing && (
                <Button disabled icon={<CircularProgress size={16} />} label="Checking the network" variant="text" />
              )}
              <Button label="Cancel" onClick={goBack} />
              <Button
                primary
                disabled={initializing || currentTx.amount.isZero()}
                label="Create Transaction"
                onClick={(): void => setStage(Stages.SIGN)}
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
              <PasswordInput error={passwordError} onChange={setPassword} onPressEnter={onSignTransaction} />
            </FormRow>
          )}
          <FormRow last>
            <FormLabel />
            <ButtonGroup classes={{ container: styles.buttons }}>
              <Button label="Cancel" onClick={goBack} />
              {!isHardware && (
                <Button primary disabled={password.length === 0} label="Sign Transaction" onClick={onSignTransaction} />
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

    const factory = amountFactory(blockchain);
    const zero = factory(0);

    let isHardware = false;

    const wallet = accounts.selectors.findWalletByEntryId(state, entry.id);

    if (wallet != null) {
      const [account] = wallet.reserved ?? [];

      if (account != null) {
        isHardware = accounts.selectors.isHardwareSeed(state, { type: 'id', value: account.seedId });
      }
    }

    const uniqueAddresses =
      accounts.selectors
        .findWalletByEntryId(state, entry.id)
        ?.entries.filter((entry) => !entry.receiveDisabled)
        .reduce<Set<string>>(
          (carry, item) =>
            item.blockchain === entry.blockchain && item.address != null ? carry.add(item.address.value) : carry,
          new Set(),
        ) ?? new Set();

    return {
      blockchain,
      isHardware,
      token,
      addresses: [...uniqueAddresses],
      eip1559: Blockchains[blockchain].params.eip1559 ?? false,
      getBalance(address) {
        if (address == null) {
          return zero;
        }

        const entryByAddress = accounts.selectors.findAccountByAddress(state, address, blockchain);

        if (entryByAddress == null || !isEthereumEntry(entryByAddress)) {
          return zero;
        }

        return accounts.selectors.getBalance(state, entryByAddress.id, zero) ?? zero;
      },
      getBalancesByAddress(address) {
        const entryByAddress = accounts.selectors.findAccountByAddress(state, address, blockchain);

        if (entryByAddress == null || !isEthereumEntry(entryByAddress)) {
          return [];
        }

        const tokenZero = token.getAmount(0);

        const balance = accounts.selectors.getBalance(state, entryByAddress.id, zero) ?? zero;
        const tokensBalance = tokens.selectors.selectBalance(state, blockchain, address, token.address) ?? tokenZero;

        return [balance, tokensBalance].map(formatAmount);
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
    checkGlobalKey(password) {
      return dispatch(accounts.actions.verifyGlobalKey(password));
    },
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
              tokenAmount: tx.amount.units.equals(tx.totalBalance.units)
                ? token.getAmount(tx.amount.number)
                : amountFactory(blockchainCode)(tx.amount.number),
            },
            null,
            true,
          ),
        );
      }
    },
  }),
)(CreateConvertTransaction);
