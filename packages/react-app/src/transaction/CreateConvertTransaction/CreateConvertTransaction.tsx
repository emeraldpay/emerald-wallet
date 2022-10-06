import { BigAmount } from '@emeraldpay/bigamount';
import { WalletEntry, isEthereumEntry } from '@emeraldpay/emerald-vault-core';
import {
  AnyCoinCode,
  BlockchainCode,
  Blockchains,
  ConvertableTokenCode,
  amountFactory,
  blockchainIdToCode,
  formatAmount,
  tokenAmount,
  tokenUnits,
  workflow,
} from '@emeraldwallet/core';
import { registry } from '@emeraldwallet/erc20';
import {
  DefaultFee,
  FEE_KEYS,
  GasPrices,
  IState,
  SignData,
  accounts,
  application,
  screen,
  tokens,
  transaction,
} from '@emeraldwallet/store';
import { Back, Button, ButtonGroup, Page, PasswordInput } from '@emeraldwallet/ui';
import { Box, FormControlLabel, FormHelperText, Slider, Switch, createStyles, withStyles } from '@material-ui/core';
import { ToggleButton, ToggleButtonGroup } from '@material-ui/lab';
import { BigNumber } from 'bignumber.js';
import * as React from 'react';
import { useCallback, useState } from 'react';
import { connect } from 'react-redux';
import AmountField from '../CreateTx/AmountField/AmountField';
import FormFieldWrapper from '../CreateTx/FormFieldWrapper';
import FormLabel from '../CreateTx/FormLabel/FormLabel';
import FromField from '../CreateTx/FromField';

const styles = createStyles({
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
});

enum Stages {
  SETUP = 'setup',
  SIGN = 'sign',
}

interface OwnProps {
  entry: WalletEntry;
  token: ConvertableTokenCode;
}

interface StylesProps {
  classes: Record<keyof typeof styles, string>;
}

interface StateProps {
  addresses: string[];
  blockchain: BlockchainCode;
  defaultFee: DefaultFee;
  eip1559: boolean;
  getBalance(address?: string): BigAmount;
  getBalancesByAddress(address: string, token: ConvertableTokenCode): string[];
  getEntryByAddress(address: string): WalletEntry | undefined;
  getTokenBalanceByAddress(token: ConvertableTokenCode, address?: string): BigAmount;
}

interface DispatchProps {
  checkGlobalKey(password: string): Promise<boolean>;
  estimateGas(blockchain: BlockchainCode, tx: workflow.CreateErc20WrappedTx, tokenSymbol: string): Promise<number>;
  getFees(blockchain: BlockchainCode, defaultFee: DefaultFee): Promise<Record<typeof FEE_KEYS[number], GasPrices>>;
  goBack(): void;
  signTransaction(
    entryId: string,
    tx: workflow.CreateErc20WrappedTx,
    tokenSymbol: string,
    password: string,
  ): Promise<void>;
}

const CreateConvertTransaction: React.FC<OwnProps & StylesProps & StateProps & DispatchProps> = ({
  addresses,
  blockchain,
  classes,
  defaultFee,
  eip1559,
  entry: { address },
  token,
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
  const coinTicker = React.useMemo(() => Blockchains[blockchain].params.coinTicker, [blockchain]);
  const zeroAmount = React.useMemo(() => amountFactory(blockchain)(0), [blockchain]);

  const [convertable, setConvertable] = useState<AnyCoinCode>(coinTicker);
  const [initializing, setInitializing] = useState(true);

  const [convertTx, setConvertTx] = React.useState(() => {
    const tx = new workflow.CreateErc20WrappedTx(
      {
        blockchain,
        address: address?.value,
        totalBalance: getBalance(address?.value),
        totalTokenBalance: getTokenBalanceByAddress(token, address?.value),
      },
      eip1559,
    );

    return tx.dump();
  });

  const [stdMaxGasPrice, setStdMaxGasPrice] = React.useState(zeroAmount);
  const [highMaxGasPrice, setHighMaxGasPrice] = React.useState(zeroAmount);
  const [lowMaxGasPrice, setLowMaxGasPrice] = React.useState(zeroAmount);

  const [stdPriorityGasPrice, setStdPriorityGasPrice] = React.useState(zeroAmount);
  const [highPriorityGasPrice, setHighPriorityGasPrice] = React.useState(zeroAmount);
  const [lowPriorityGasPrice, setLowPriorityGasPrice] = React.useState(zeroAmount);

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
    (event, value: AnyCoinCode) => {
      const tx = workflow.CreateErc20WrappedTx.fromPlain(convertTx);

      const converting = value ?? convertable;

      tx.amount =
        converting === coinTicker
          ? amountFactory(blockchain)(tx.amount.number)
          : new BigAmount(tx.amount, tokenUnits(converting));
      tx.target = workflow.TxTarget.MANUAL;
      tx.rebalance();

      setConvertable(converting);
      setConvertTx(tx.dump());
    },
    [blockchain, coinTicker, convertTx, convertable],
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

      const gasPrice = new BigAmount(price, gasPriceUnits);

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
    [eip1559, gasPriceUnits, convertTx],
  );

  const onChangePriorityGasPrice = useCallback(
    (price: number) => {
      const tx = workflow.CreateErc20WrappedTx.fromPlain(convertTx);

      tx.priorityGasPrice = new BigAmount(price, gasPriceUnits);
      tx.rebalance();

      setConvertTx(tx.dump());
    },
    [gasPriceUnits, convertTx],
  );

  const onSignTransaction = useCallback(async () => {
    const tx = workflow.CreateErc20WrappedTx.fromPlain(convertTx);

    setPasswordError(undefined);

    if (tx.address == null) {
      return;
    }

    const entry = getEntryByAddress(tx.address);

    if (entry == null) {
      return;
    }

    const correctPassword = await checkGlobalKey(password);

    if (correctPassword) {
      await signTransaction(entry.id, tx, token, password);
    } else {
      setPasswordError('Incorrect password');
    }
  }, [convertTx, password, token, checkGlobalKey, getEntryByAddress, signTransaction]);

  React.useEffect(
    () => {
      (async (): Promise<void> => {
        const fees = await getFees(blockchain, defaultFee);

        const { avgLast, avgMiddle, avgTail5 } = fees;
        const feeProp = eip1559 ? 'max' : 'expect';

        const factory = amountFactory(blockchain);

        const newStdMaxGasPrice = factory(avgTail5[feeProp]);
        const newStdPriorityGasPrice = factory(avgTail5.priority);

        setStdMaxGasPrice(newStdMaxGasPrice);
        setHighMaxGasPrice(factory(avgMiddle[feeProp]));
        setLowMaxGasPrice(factory(avgLast[feeProp]));

        setStdPriorityGasPrice(newStdPriorityGasPrice);
        setHighPriorityGasPrice(factory(avgMiddle.priority));
        setLowPriorityGasPrice(factory(avgLast.priority));

        setGasPriceUnits(newStdMaxGasPrice.units);

        const gasPriceOptimalUnit = newStdMaxGasPrice.getOptimalUnit();
        const maxGasPriceNumber = newStdMaxGasPrice.getNumberByUnit(gasPriceOptimalUnit).toNumber();
        const priorityGasPriceNumber = newStdPriorityGasPrice.getNumberByUnit(gasPriceOptimalUnit).toNumber();

        setMaxGasPrice(maxGasPriceNumber);
        setPriorityGasPrice(priorityGasPriceNumber);

        const tx = workflow.CreateErc20WrappedTx.fromPlain(convertTx);

        if (eip1559) {
          tx.gasPrice = undefined;
          tx.maxGasPrice = new BigAmount(maxGasPriceNumber, gasPriceUnits);
          tx.priorityGasPrice = new BigAmount(priorityGasPriceNumber, gasPriceUnits);
        } else {
          tx.gasPrice = new BigAmount(maxGasPriceNumber, gasPriceUnits);
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

          tx.gas = await estimateGas(blockchain, tx, token);
          tx.rebalance();

          setConvertTx(tx.dump());
        })();
      }
    }
  }, [blockchain, convertable, convertTx, token, estimateGas]);

  const currentTx = workflow.CreateErc20WrappedTx.fromPlain(convertTx);

  const gasPriceOptimalUnit = stdMaxGasPrice.getOptimalUnit();

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
          <FormFieldWrapper>
            <FormLabel />
            <ToggleButtonGroup exclusive={true} value={convertable} onChange={onChangeConvertable}>
              <ToggleButton disabled={initializing} value={coinTicker}>
                Ether to {token}
              </ToggleButton>
              <ToggleButton disabled={initializing} value={token}>
                {token} to Ether
              </ToggleButton>
            </ToggleButtonGroup>
          </FormFieldWrapper>
          <FormFieldWrapper>
            <FromField
              accounts={addresses}
              selectedAccount={convertTx.address}
              onChangeAccount={onChangeAddress}
              getBalancesByAddress={(address) => getBalancesByAddress(address, token)}
            />
          </FormFieldWrapper>
          <FormFieldWrapper>
            <AmountField
              disabled={initializing}
              amount={currentTx.amount}
              units={currentTx.amount.units}
              onChangeAmount={onChangeAmount}
              onMaxClicked={onClickMaxAmount}
            />
          </FormFieldWrapper>
          <FormFieldWrapper>
            <FormLabel>{eip1559 ? 'Max gas price' : 'Gas price'}</FormLabel>
            <Box className={classes.inputField}>
              <Box className={classes.gasPriceTypeBox}>
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
                <Box className={classes.gasPriceSliderBox}>
                  <Slider
                    aria-labelledby="discrete-slider"
                    classes={{
                      markLabel: classes.gasPriceMarkLabel,
                      valueLabel: classes.gasPriceValueLabel,
                    }}
                    className={classes.gasPriceSlider}
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
              <Box className={classes.gasPriceHelpBox}>
                <FormHelperText className={classes.gasPriceHelp}>
                  {maxGasPrice.toFixed(2)} {gasPriceUnits.toString()}
                </FormHelperText>
              </Box>
            </Box>
          </FormFieldWrapper>
          {eip1559 && (
            <FormFieldWrapper>
              <FormLabel>Priority gas price</FormLabel>
              <Box className={classes.inputField}>
                <Box className={classes.gasPriceTypeBox}>
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
                  <Box className={classes.gasPriceSliderBox}>
                    <Slider
                      aria-labelledby="discrete-slider"
                      classes={{
                        markLabel: classes.gasPriceMarkLabel,
                        valueLabel: classes.gasPriceValueLabel,
                      }}
                      className={classes.gasPriceSlider}
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
                <Box className={classes.gasPriceHelpBox}>
                  <FormHelperText className={classes.gasPriceHelp}>
                    {priorityGasPrice.toFixed(2)} {gasPriceUnits.toString()}
                  </FormHelperText>
                </Box>
              </Box>
            </FormFieldWrapper>
          )}
          <FormFieldWrapper>
            <FormLabel />
            <ButtonGroup>
              <Button label="Cancel" onClick={goBack} />
              <Button
                disabled={initializing}
                label="Create Transaction"
                primary={true}
                onClick={(): void => setStage(Stages.SIGN)}
              />
            </ButtonGroup>
          </FormFieldWrapper>
        </>
      )}
      {stage === Stages.SIGN && (
        <>
          <FormFieldWrapper>
            <FormLabel />
            <div>
              Convert {formatAmount(currentTx.amount, 6)} with fee {formatAmount(currentTx.getFees(), 6)}
            </div>
          </FormFieldWrapper>
          <FormFieldWrapper>
            <FormLabel>Password</FormLabel>
            <PasswordInput error={passwordError} onChange={setPassword} />
          </FormFieldWrapper>
          <FormFieldWrapper>
            <FormLabel />
            <ButtonGroup style={{ width: '100%' }}>
              <Button label="Cancel" onClick={goBack} />
              <Button
                label="Sign Transaction"
                disabled={password.length === 0}
                primary={true}
                onClick={onSignTransaction}
              />
            </ButtonGroup>
          </FormFieldWrapper>
        </>
      )}
    </Page>
  );
};

export default connect<StateProps, DispatchProps, OwnProps, IState>(
  (state, ownProps) => {
    const { entry } = ownProps;

    const blockchain = blockchainIdToCode(entry.blockchain);
    const factory = amountFactory(blockchain);
    const zero = factory(0);

    return {
      blockchain,
      addresses:
        accounts.selectors
          .findWalletByEntryId(state, entry.id)
          ?.entries.reduce<Array<string>>(
            (carry, item) =>
              item.blockchain === entry.blockchain && item.address != null ? [...carry, item.address.value] : carry,
            [],
          ) ?? [],
      defaultFee: application.selectors.getDefaultFee(state, blockchain),
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

        const tokenInfo = registry.bySymbol(blockchain, token);
        const zeroAmount = new BigAmount(0, tokenUnits(token));

        const tokensBalance =
          tokens.selectors.selectBalance(state, tokenInfo.address, address, blockchain) ?? zeroAmount;

        return [balance, tokensBalance].map(formatAmount);
      },
      getEntryByAddress(address) {
        return accounts.selectors.findAccountByAddress(state, address, blockchain);
      },
      getTokenBalanceByAddress(token, address) {
        const zero = tokenAmount(0, token);

        if (address == null) {
          return zero;
        }

        const tokenInfo = registry.bySymbol(blockchain, token);
        const tokenBalance = tokens.selectors.selectBalance(state, tokenInfo.address, address, blockchain);

        return tokenBalance ?? zero;
      },
    };
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (dispatch: any, ownProps) => ({
    checkGlobalKey(password) {
      return dispatch(accounts.actions.verifyGlobalKey(password));
    },
    async estimateGas(blockchain, tx, tokenSymbol) {
      const token = registry.bySymbol(blockchain, tokenSymbol);

      const data = tx.amount.units.equals(tx.totalBalance.units)
        ? tokens.actions.createWrapTxData()
        : tokens.actions.createUnwrapTxData(tx.amount.number);

      return dispatch(
        transaction.actions.estimateGas(blockchain, {
          data,
          from: tx.address,
          gas: new BigNumber(50000),
          to: token.address,
          value: tx.amount.units.equals(tx.totalBalance.units) ? tx.amount : amountFactory(blockchain)(0),
        }),
      );
    },
    getFees(blockchain, defaultFee) {
      return dispatch(transaction.actions.getFee(blockchain, defaultFee));
    },
    goBack() {
      dispatch(screen.actions.goBack());
    },
    async signTransaction(entryId, tx, tokenSymbol, password) {
      if (tx.address == null) {
        return;
      }

      const blockchainCode = blockchainIdToCode(ownProps.entry.blockchain);
      const token = registry.bySymbol(blockchainCode, tokenSymbol);
      const zeroAmount = amountFactory(blockchainCode)(0);

      const data = tx.amount.units.equals(tx.totalBalance.units)
        ? tokens.actions.createWrapTxData()
        : tokens.actions.createUnwrapTxData(tx.amount.number);

      const signed: SignData | undefined = await dispatch(
        transaction.actions.signTransaction(
          entryId,
          blockchainCode,
          tx.address,
          password,
          token.address,
          tx.gas,
          tx.amount.units.equals(tx.totalBalance.units) ? tx.amount : zeroAmount,
          data,
          tx.gasPrice == null ? undefined : tx.gasPrice,
          tx.maxGasPrice == null ? undefined : tx.maxGasPrice,
          tx.priorityGasPrice == null ? undefined : tx.priorityGasPrice,
        ),
      );

      if (signed != null) {
        dispatch(
          screen.actions.gotoScreen(
            screen.Pages.BROADCAST_TX,
            {
              ...signed,
              fee: (tx.maxGasPrice ?? tx.gasPrice ?? zeroAmount).multiply(tx.gas),
              originalAmount: tx.amount,
              tokenAmount: tx.amount.units.equals(tx.totalBalance.units)
                ? new BigAmount(tx.amount, tokenUnits(tokenSymbol))
                : amountFactory(blockchainCode)(tx.amount.number),
            },
            null,
            true,
          ),
        );
      }
    },
  }),
)(withStyles(styles)(CreateConvertTransaction));
