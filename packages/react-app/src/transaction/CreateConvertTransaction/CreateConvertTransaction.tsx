import { BigAmount } from '@emeraldpay/bigamount';
import { Wei } from '@emeraldpay/bigamount-crypto';
import { WalletEntry, isEthereumEntry } from '@emeraldpay/emerald-vault-core';
import {
  AnyCoinCode,
  BlockchainCode,
  Blockchains,
  amountFactory,
  blockchainIdToCode,
  formatAmount,
  tokenAmount,
  workflow,
} from '@emeraldwallet/core';
import { tokenUnits } from '@emeraldwallet/core/lib/blockchains/tokens';
import { CreateErc20WrappedTx, TxTarget } from '@emeraldwallet/core/lib/workflow';
import { registry } from '@emeraldwallet/erc20';
import {
  FEE_KEYS,
  GasPrices,
  IState,
  accounts,
  screen,
  tokens,
  transaction,
  DefaultFee,
  application,
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

const TOKENS_LIST = ['WETH'] as const;

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
}

interface StylesProps {
  classes: Record<keyof typeof styles, string>;
}

interface StateProps {
  addresses: string[];
  blockchain: BlockchainCode;
  defaultFee: DefaultFee;
  eip1559: boolean;
  getBalance(address?: string): Wei;
  getBalancesByAddress(address: string): string[];
  getTokenBalanceByAddress(token: AnyCoinCode, address?: string): BigAmount;
}

interface DispatchProps {
  checkGlobalKey(password: string): Promise<boolean>;
  estimateGas(blockchain: BlockchainCode, tx: CreateErc20WrappedTx, tokenSymbol: string): Promise<number>;
  getFees(blockchain: BlockchainCode, defaultFee: DefaultFee): Promise<Record<typeof FEE_KEYS[number], GasPrices>>;
  goBack(): void;
  signTransaction(tx: CreateErc20WrappedTx, tokenSymbol: string, password: string): Promise<void>;
}

const CreateConvertTransaction: React.FC<OwnProps & StylesProps & StateProps & DispatchProps> = ({
  addresses,
  blockchain,
  classes,
  defaultFee,
  eip1559,
  entry: { address },
  checkGlobalKey,
  estimateGas,
  getBalance,
  getBalancesByAddress,
  getFees,
  getTokenBalanceByAddress,
  goBack,
  signTransaction,
}) => {
  const [convertable, setConvertable] = useState('eth');
  const [initializing, setInitializing] = useState(true);

  const [tokenSymbol] = TOKENS_LIST;

  const [convertTx, setConvertTx] = React.useState(() => {
    const tx = new workflow.CreateErc20WrappedTx(
      {
        address: address?.value,
        totalBalance: getBalance(address?.value),
        totalTokenBalance: getTokenBalanceByAddress(tokenSymbol, address?.value),
      },
      eip1559,
    );

    return tx.dump();
  });

  const zeroWei = new Wei(0);

  const [stdMaxGasPrice, setStdMaxGasPrice] = React.useState(zeroWei);
  const [highMaxGasPrice, setHighMaxGasPrice] = React.useState(zeroWei);
  const [lowMaxGasPrice, setLowMaxGasPrice] = React.useState(zeroWei);

  const [stdPriorityGasPrice, setStdPriorityGasPrice] = React.useState(zeroWei);
  const [highPriorityGasPrice, setHighPriorityGasPrice] = React.useState(zeroWei);
  const [lowPriorityGasPrice, setLowPriorityGasPrice] = React.useState(zeroWei);

  const [gasPriceUnit, setGasPriceUnit] = useState(Wei.ZERO.units.base);

  const [maxGasPrice, setMaxGasPrice] = React.useState(0);
  const [useStdMaxGasPrice, setUseStdMaxGasPrice] = React.useState(true);

  const [priorityGasPrice, setPriorityGasPrice] = React.useState(0);
  const [useStdPriorityGasPrice, setUseStdPriorityGasPrice] = React.useState(true);

  const [stage, setStage] = useState(Stages.SETUP);
  const [password, setPassword] = useState('');

  const [passwordError, setPasswordError] = useState<string>();

  const oldAmount = React.useRef(convertTx.amount);

  const onChangeConvertable = useCallback(
    (event, value) => {
      const converting = value ?? convertable;

      const tx = CreateErc20WrappedTx.fromPlain(convertTx);

      switch (converting) {
        case 'eth':
          if (!Wei.is(tx.amount)) {
            tx.amount = new Wei(tx.amount.number);
          }

          break;
        case 'weth':
          if (Wei.is(tx.amount)) {
            tx.amount = new BigAmount(tx.amount, tokenUnits(converting));
          }

          break;
      }

      tx.target = TxTarget.MANUAL;
      tx.rebalance();

      setConvertable(converting);
      setConvertTx(tx.dump());
    },
    [convertTx],
  );

  const onChangeAddress = useCallback(
    (address: string) => {
      const tx = CreateErc20WrappedTx.fromPlain(convertTx);

      tx.address = address;
      tx.totalBalance = getBalance(address);
      tx.totalTokenBalance = getTokenBalanceByAddress(tokenSymbol, address);
      tx.rebalance();

      setConvertTx(tx.dump());
    },
    [convertTx],
  );

  const onChangeAmount = useCallback(
    (amount: BigAmount) => {
      const tx = CreateErc20WrappedTx.fromPlain(convertTx);

      tx.amount = Wei.is(tx.amount) ? new Wei(amount.number) : amount;
      tx.target = TxTarget.MANUAL;

      setConvertTx(tx.dump());
    },
    [convertTx],
  );

  const onClickMaxAmount = useCallback(() => {
    const tx = CreateErc20WrappedTx.fromPlain(convertTx);

    tx.target = TxTarget.SEND_ALL;
    tx.rebalance();

    setConvertTx(tx.dump());
  }, [convertTx]);

  const onChangeMaxGasPrice = useCallback(
    (price: number) => {
      const tx = CreateErc20WrappedTx.fromPlain(convertTx);

      const gasPrice = new Wei(price, gasPriceUnit);

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
    [eip1559, gasPriceUnit, convertTx],
  );

  const onChangePriorityGasPrice = useCallback(
    (price: number) => {
      const tx = CreateErc20WrappedTx.fromPlain(convertTx);

      tx.priorityGasPrice = new Wei(price, gasPriceUnit);
      tx.rebalance();

      setConvertTx(tx.dump());
    },
    [gasPriceUnit, convertTx],
  );

  const onSignTransaction = useCallback(async () => {
    setPasswordError(undefined);

    const correctPassword = await checkGlobalKey(password);

    if (correctPassword) {
      const tx = CreateErc20WrappedTx.fromPlain(convertTx);

      await signTransaction(tx, tokenSymbol, password);
    } else {
      setPasswordError('Incorrect password');
    }
  }, [convertTx, password]);

  React.useEffect(() => {
    (async (): Promise<void> => {
      const fees = await getFees(blockchain, defaultFee);

      const { avgLast, avgMiddle, avgTail5 } = fees;
      const feeProp = eip1559 ? 'max' : 'expect';

      const newStdMaxGasPrice = new Wei(avgTail5[feeProp]);
      const newStdPriorityGasPrice = new Wei(avgTail5.priority);

      setStdMaxGasPrice(newStdMaxGasPrice);
      setHighMaxGasPrice(new Wei(avgMiddle[feeProp]));
      setLowMaxGasPrice(new Wei(avgLast[feeProp]));

      setStdPriorityGasPrice(newStdPriorityGasPrice);
      setHighPriorityGasPrice(new Wei(avgMiddle.priority));
      setLowPriorityGasPrice(new Wei(avgLast.priority));

      const gasPriceOptimalUnit = newStdMaxGasPrice.getOptimalUnit();
      const maxGasPriceNumber = newStdMaxGasPrice.getNumberByUnit(gasPriceOptimalUnit).toNumber();
      const priorityGasPriceNumber = newStdPriorityGasPrice.getNumberByUnit(gasPriceOptimalUnit).toNumber();

      setGasPriceUnit(gasPriceOptimalUnit);

      setMaxGasPrice(maxGasPriceNumber);
      setPriorityGasPrice(priorityGasPriceNumber);

      const tx = CreateErc20WrappedTx.fromPlain(convertTx);

      if (eip1559) {
        tx.gasPrice = undefined;
        tx.maxGasPrice = new Wei(maxGasPriceNumber, gasPriceOptimalUnit);
        tx.priorityGasPrice = new Wei(priorityGasPriceNumber, gasPriceOptimalUnit);
      } else {
        tx.gasPrice = new Wei(maxGasPriceNumber, gasPriceOptimalUnit);
        tx.maxGasPrice = undefined;
        tx.priorityGasPrice = undefined;
      }

      tx.rebalance();

      setConvertTx(tx.dump());
      setInitializing(false);
    })();
  }, []);

  React.useEffect(() => {
    if (oldAmount.current == null || convertTx.amount?.equals(oldAmount.current) === false) {
      oldAmount.current = convertTx.amount;

      const total = Wei.is(convertTx.amount) ? convertTx.totalBalance : convertTx.totalTokenBalance;

      if (total?.number != null && convertTx.amount?.number.isLessThanOrEqualTo(total.number) === true) {
        (async (): Promise<void> => {
          const tx = CreateErc20WrappedTx.fromPlain(convertTx);

          const gas = await estimateGas(blockchain, tx, tokenSymbol);

          tx.gas = new BigNumber(gas);
          tx.rebalance();

          setConvertTx(tx.dump());
        })();
      }
    }
  }, [convertable, convertTx.amount]);

  const currentTx = CreateErc20WrappedTx.fromPlain(convertTx);

  const stdMaxGasPriceNumber = stdMaxGasPrice.getNumberByUnit(gasPriceUnit).toNumber();
  const highMaxGasPriceNumber = highMaxGasPrice.getNumberByUnit(gasPriceUnit).toNumber();
  const lowMaxGasPriceNumber = lowMaxGasPrice.getNumberByUnit(gasPriceUnit).toNumber();

  const stdPriorityGasPriceNumber = stdPriorityGasPrice.getNumberByUnit(gasPriceUnit).toNumber();
  const highPriorityGasPriceNumber = highPriorityGasPrice.getNumberByUnit(gasPriceUnit).toNumber();
  const lowPriorityGasPriceNumber = lowPriorityGasPrice.getNumberByUnit(gasPriceUnit).toNumber();

  return (
    <Page title="Create Convert Transaction" leftIcon={<Back onClick={goBack} />}>
      {stage === Stages.SETUP && (
        <>
          <FormFieldWrapper>
            <FormLabel />
            <ToggleButtonGroup exclusive={true} value={convertable} onChange={onChangeConvertable}>
              <ToggleButton disabled={initializing} value="eth">
                Ether to WETH
              </ToggleButton>
              <ToggleButton disabled={initializing} value="weth">
                WETH to Ether
              </ToggleButton>
            </ToggleButtonGroup>
          </FormFieldWrapper>
          <FormFieldWrapper>
            <FromField
              accounts={addresses}
              selectedAccount={convertTx.address}
              onChangeAccount={onChangeAddress}
              getBalancesByAddress={getBalancesByAddress}
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
                    getAriaValueText={(): string => `${maxGasPrice.toFixed(2)} ${gasPriceUnit.toString()}`}
                    onChange={(event, value): void => {
                      setMaxGasPrice(value as number);
                      onChangeMaxGasPrice(value as number);
                    }}
                  />
                </Box>
              )}
              <Box className={classes.gasPriceHelpBox}>
                <FormHelperText className={classes.gasPriceHelp}>
                  {maxGasPrice.toFixed(2)} {gasPriceUnit.toString()}
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
                      getAriaValueText={(): string => `${priorityGasPrice.toFixed(2)} ${gasPriceUnit.toString()}`}
                      onChange={(event, value): void => {
                        setPriorityGasPrice(value as number);
                        onChangePriorityGasPrice(value as number);
                      }}
                    />
                  </Box>
                )}
                <Box className={classes.gasPriceHelpBox}>
                  <FormHelperText className={classes.gasPriceHelp}>
                    {priorityGasPrice.toFixed(2)} {gasPriceUnit.toString()}
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
              Convert {currentTx.amount.toString()} with fee {currentTx.getFees().toString()}
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
    const zero = amountFactory(blockchain)(0);

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
        const zeroBalance = new Wei(zero);

        if (address == null) {
          return zeroBalance;
        }

        const entryByAddress = accounts.selectors.findAccountByAddress(state, address, blockchain);

        if (entryByAddress == null || !isEthereumEntry(entryByAddress)) {
          return zeroBalance;
        }

        return new Wei(accounts.selectors.getBalance(state, entryByAddress.id, zero)?.number ?? 0);
      },
      getBalancesByAddress(address) {
        const entryByAddress = accounts.selectors.findAccountByAddress(state, address, blockchain);

        if (entryByAddress == null || !isEthereumEntry(entryByAddress)) {
          return [];
        }

        const balance = accounts.selectors.getBalance(state, entryByAddress.id, zero) ?? zero;

        const tokensBalances = TOKENS_LIST.map((token) => {
          const tokenInfo = registry.bySymbol(blockchain, token);
          const zeroAmount = new BigAmount(0, tokenUnits(token));

          return tokens.selectors.selectBalance(state, tokenInfo.address, address, blockchain) ?? zeroAmount;
        });

        return [balance, ...tokensBalances].map(formatAmount);
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

      const data = Wei.is(tx.amount)
        ? tokens.actions.createWrapTxData()
        : tokens.actions.createUnwrapTxData(tx.amount.number);

      return dispatch(
        transaction.actions.estimateGas(blockchain, {
          data,
          from: tx.address,
          gas: new BigNumber(50000),
          to: token.address,
          value: Wei.is(tx.amount) ? tx.amount : Wei.ZERO,
        }),
      );
    },
    getFees(blockchain, defaultFee) {
      return dispatch(transaction.actions.getFee(blockchain, defaultFee));
    },
    goBack() {
      dispatch(screen.actions.goBack());
    },
    async signTransaction(tx, tokenSymbol, password) {
      if (tx.address == null) {
        return;
      }

      const { blockchain, id: accountId } = ownProps.entry;
      const chain = blockchainIdToCode(blockchain);
      const token = registry.bySymbol(chain, tokenSymbol);

      const data = Wei.is(tx.amount)
        ? tokens.actions.createWrapTxData()
        : tokens.actions.createUnwrapTxData(tx.amount.number);

      const signed = await dispatch(
        transaction.actions.signTransaction(
          accountId,
          chain,
          tx.address,
          password,
          token.address,
          tx.gas.toNumber(),
          Wei.is(tx.amount) ? tx.amount : Wei.ZERO,
          data,
        ),
      );

      if (signed) {
        dispatch(screen.actions.gotoScreen(screen.Pages.BROADCAST_TX, signed));
      }
    },
  }),
)(withStyles(styles)(CreateConvertTransaction));
