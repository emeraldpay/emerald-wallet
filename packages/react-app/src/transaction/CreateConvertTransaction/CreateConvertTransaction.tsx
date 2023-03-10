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
import { Back, Button, ButtonGroup, FormLabel, FormRow, Page, PasswordInput } from '@emeraldwallet/ui';
import {
  Box,
  CircularProgress,
  FormControlLabel,
  FormHelperText,
  Slider,
  Switch,
  createStyles,
  makeStyles,
} from '@material-ui/core';
import { ToggleButton, ToggleButtonGroup } from '@material-ui/lab';
import * as React from 'react';
import { useCallback, useState } from 'react';
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
      width: '240px',
      float: 'left',
      height: '40px',
    },
    gasPriceSliderBox: {
      width: '300px',
      float: 'left',
    },
    gasPriceHelpBox: {
      width: '500px',
      clear: 'left',
    },
    gasPriceSlider: {
      width: '300px',
      marginBottom: '10px',
      paddingTop: '10px',
    },
    gasPriceHelp: {
      position: 'initial',
      paddingLeft: '10px',
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
  entry: WalletEntry;
  token: string;
}

interface StateProps {
  addresses: string[];
  blockchain: BlockchainCode;
  eip1559: boolean;
  isHardware: boolean;
  tokenRegistry: TokenRegistry;
  getBalance(address?: string): BigAmount;
  getBalancesByAddress(address: string, token: string): string[];
  getEntryByAddress(address: string): WalletEntry | undefined;
  getTokenBalanceByAddress(token: string, address?: string): BigAmount;
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
  eip1559,
  entry: { address },
  isHardware,
  token,
  tokenRegistry,
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

  const [convertable, setConvertable] = useState<string>(coinTicker);
  const [initializing, setInitializing] = useState(true);

  const [convertTx, setConvertTx] = React.useState(() => {
    const tx = new workflow.CreateErc20WrappedTx({
      blockchain,
      address: address?.value,
      token: tokenRegistry.bySymbol(blockchain, token),
      totalBalance: getBalance(address?.value),
      totalTokenBalance: getTokenBalanceByAddress(token, address?.value),
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

  const [gasPriceUnit, setGasPriceUnit] = useState(zeroAmount.getOptimalUnit(minimalUnit));
  const [gasPriceUnits, setGasPriceUnits] = useState(zeroAmount.units);

  const [maxGasPrice, setMaxGasPrice] = React.useState(0);
  const [useStdMaxGasPrice, setUseStdMaxGasPrice] = React.useState(true);

  const [priorityGasPrice, setPriorityGasPrice] = React.useState(0);
  const [useStdPriorityGasPrice, setUseStdPriorityGasPrice] = React.useState(true);

  const [stage, setStage] = useState(Stages.SETUP);
  const [password, setPassword] = useState('');

  const [passwordError, setPasswordError] = useState<string>();

  const oldAmount = React.useRef(convertTx.amount);

  const onChangeConvertable = useCallback(
    (event, value: string) => {
      const tx = workflow.CreateErc20WrappedTx.fromPlain(convertTx);

      const converting = value ?? convertable;

      tx.amount =
        converting === coinTicker
          ? amountFactory(blockchain)(tx.amount.number)
          : tokenRegistry.bySymbol(blockchain, converting).getAmount(tx.amount.number);
      tx.target = workflow.TxTarget.MANUAL;
      tx.rebalance();

      setConvertable(converting);
      setConvertTx(tx.dump());
    },
    [blockchain, coinTicker, convertTx, convertable, tokenRegistry],
  );

  const onChangeAddress = useCallback(
    (address: string) => {
      const tx = workflow.CreateErc20WrappedTx.fromPlain(convertTx);

      tx.address = address;
      tx.totalBalance = getBalance(address);
      tx.totalTokenBalance = getTokenBalanceByAddress(token, address);
      tx.rebalance();

      setConvertTx(tx.dump());
    },
    [convertTx, token, getBalance, getTokenBalanceByAddress],
  );

  const onChangeAmount = useCallback(
    (amount: BigAmount) => {
      const tx = workflow.CreateErc20WrappedTx.fromPlain(convertTx);

      tx.amount = amount;
      tx.target = workflow.TxTarget.MANUAL;

      setConvertTx(tx.dump());
    },
    [convertTx],
  );

  const onClickMaxAmount = useCallback(() => {
    const tx = workflow.CreateErc20WrappedTx.fromPlain(convertTx);

    tx.target = workflow.TxTarget.SEND_ALL;
    tx.rebalance();

    setConvertTx(tx.dump());
  }, [convertTx]);

  const onChangeMaxGasPrice = useCallback(
    (price: number) => {
      const tx = workflow.CreateErc20WrappedTx.fromPlain(convertTx);

      const gasPrice = BigAmount.createFor(price, gasPriceUnits, amountFactory(blockchain), gasPriceUnit);

      if (eip1559) {
        tx.gasPrice = undefined;
        tx.maxGasPrice = gasPrice;
      } else {
        tx.gasPrice = gasPrice;
        tx.maxGasPrice = undefined;
      }

      tx.rebalance();

      setConvertTx(tx.dump());
    },
    [blockchain, convertTx, eip1559, gasPriceUnit, gasPriceUnits],
  );

  const onChangePriorityGasPrice = useCallback(
    (price: number) => {
      const tx = workflow.CreateErc20WrappedTx.fromPlain(convertTx);

      tx.priorityGasPrice = BigAmount.createFor(price, gasPriceUnits, amountFactory(blockchain), gasPriceUnit);
      tx.rebalance();

      setConvertTx(tx.dump());
    },
    [blockchain, convertTx, gasPriceUnit, gasPriceUnits],
  );

  const onSignTransaction = useCallback(async () => {
    setPasswordError(undefined);

    const tx = workflow.CreateErc20WrappedTx.fromPlain(convertTx);

    if (tx.address == null) {
      return;
    }

    const entry = getEntryByAddress(tx.address);

    if (entry == null) {
      return;
    }

    const blockchainCode = blockchainIdToCode(entry.blockchain);
    const tokenData = tokenRegistry.bySymbol(blockchainCode, token);

    if (isHardware) {
      await signTransaction(entry.id, tx, tokenData);
    } else {
      const correctPassword = await checkGlobalKey(password);

      if (correctPassword) {
        await signTransaction(entry.id, tx, tokenData, password);
      } else {
        setPasswordError('Incorrect password');
      }
    }
  }, [convertTx, getEntryByAddress, isHardware, tokenRegistry, token, signTransaction, checkGlobalKey, password]);

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
  }, [blockchain, convertable, convertTx, token, tokenRegistry, estimateGas]);

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
                Ether to {token}
              </ToggleButton>
              <ToggleButton disabled={initializing} value={token}>
                {token} to Ether
              </ToggleButton>
            </ToggleButtonGroup>
          </FormRow>
          <FormRow>
            <FromField
              accounts={addresses}
              disabled={initializing}
              selectedAccount={convertTx.address}
              onChangeAccount={onChangeAddress}
              getBalancesByAddress={(address) => getBalancesByAddress(address, token)}
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
          <FormRow>
            <FormLabel top>{eip1559 ? 'Max gas price' : 'Gas price'}</FormLabel>
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
                    defaultValue={stdMaxGasPriceNumber}
                    marks={[
                      { value: lowMaxGasPriceNumber, label: 'Slow' },
                      { value: highMaxGasPriceNumber, label: 'Urgent' },
                    ]}
                    max={highMaxGasPriceNumber}
                    min={lowMaxGasPriceNumber}
                    step={0.01}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(value): string => value.toFixed(2)}
                    getAriaValueText={(): string => `${maxGasPrice.toFixed(2)} ${gasPriceUnits.toString()}`}
                    onChange={(event, value): void => {
                      setMaxGasPrice(value as number);
                      onChangeMaxGasPrice(value as number);
                    }}
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
          {eip1559 && (
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
                      defaultValue={stdPriorityGasPriceNumber}
                      marks={[
                        { value: lowPriorityGasPriceNumber, label: 'Slow' },
                        { value: highPriorityGasPriceNumber, label: 'Urgent' },
                      ]}
                      max={highPriorityGasPriceNumber}
                      min={lowPriorityGasPriceNumber}
                      step={0.01}
                      valueLabelDisplay="auto"
                      valueLabelFormat={(value): string => value.toFixed(2)}
                      getAriaValueText={(): string => `${priorityGasPrice.toFixed(2)} ${gasPriceUnits.toString()}`}
                      onChange={(event, value): void => {
                        setPriorityGasPrice(value as number);
                        onChangePriorityGasPrice(value as number);
                      }}
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
          <div>
            Convert {formatAmount(currentTx.amount, 6)} with fee {formatAmount(currentTx.getFees(), 6)}
          </div>
          {isHardware ? (
            <WaitLedger fullSize blockchain={currentTx.blockchain} onConnected={() => onSignTransaction()} />
          ) : (
            <FormRow>
              <FormLabel>Password</FormLabel>
              <PasswordInput error={passwordError} onChange={setPassword} />
            </FormRow>
          )}
          <FormRow last>
            <FormLabel />
            <ButtonGroup classes={{ container: styles.buttons }}>
              <Button label="Cancel" onClick={goBack} />
              {!isHardware && (
                <Button
                  label="Sign Transaction"
                  disabled={password.length === 0}
                  primary={true}
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
  (state, { entry }) => {
    const blockchain = blockchainIdToCode(entry.blockchain);
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

    const tokenRegistry = new TokenRegistry(state.application.tokens);

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
      tokenRegistry,
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
      getBalancesByAddress(address, token) {
        const entryByAddress = accounts.selectors.findAccountByAddress(state, address, blockchain);

        if (entryByAddress == null || !isEthereumEntry(entryByAddress)) {
          return [];
        }

        const balance = accounts.selectors.getBalance(state, entryByAddress.id, zero) ?? zero;

        let tokenData: Token | null = null;

        try {
          tokenData = tokenRegistry.bySymbol(blockchain, token);
        } catch (exception) {
          return [formatAmount(balance)];
        }

        const zeroAmount = tokenData.getAmount(0);

        const tokensBalance =
          tokens.selectors.selectBalance(state, blockchain, address, tokenData.address) ?? zeroAmount;

        return [balance, tokensBalance].map(formatAmount);
      },
      getEntryByAddress(address) {
        return accounts.selectors.findAccountByAddress(state, address, blockchain);
      },
      getTokenBalanceByAddress(token, address) {
        const tokenData = tokenRegistry.bySymbol(blockchain, token);

        const zero = tokenData.getAmount(0);

        if (address == null) {
          return zero;
        }

        const tokenBalance = tokens.selectors.selectBalance(state, blockchain, address, tokenData.address);

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
