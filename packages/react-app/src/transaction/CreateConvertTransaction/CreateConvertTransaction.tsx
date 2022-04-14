import { BigAmount } from '@emeraldpay/bigamount';
import { Wei } from '@emeraldpay/bigamount-crypto';
import { WalletEntry } from '@emeraldpay/emerald-vault-core';
import {
  amountFactory,
  AnyCoinCode,
  BlockchainCode,
  blockchainIdToCode,
  tokenAmount,
  workflow,
} from '@emeraldwallet/core';
import { tokenUnits } from '@emeraldwallet/core/lib/blockchains/tokens';
import { CreateErc20WrappedTx, TxTarget } from '@emeraldwallet/core/lib/workflow';
import { registry } from '@emeraldwallet/erc20';
import { accounts, IState, screen, tokens, transaction } from '@emeraldwallet/store';
import { Back, Button, ButtonGroup, Page, PasswordInput } from '@emeraldwallet/ui';
import { Box, createStyles, FormControlLabel, FormHelperText, Slider, Switch, withStyles } from '@material-ui/core';
import { ToggleButton, ToggleButtonGroup } from '@material-ui/lab';
import BigNumber from 'bignumber.js';
import * as React from 'react';
import { useCallback, useState } from 'react';
import { connect } from 'react-redux';
import AmountField from '../CreateTx/AmountField/AmountField';
import FormFieldWrapper from '../CreateTx/FormFieldWrapper';
import FormLabel from '../CreateTx/FormLabel/FormLabel';

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
});

interface OwnProps {
  entry: WalletEntry;
}

interface StylesProps {
  classes: Record<keyof typeof styles, string>;
}

interface StateProps {
  blockchain: BlockchainCode;
  getBalance(): Wei;
  getTokenBalanceByAddress(token: AnyCoinCode, address?: string): BigAmount;
}

interface DispatchProps {
  checkGlobalKey(password: string): Promise<boolean>;
  estimateGas(blockchain: BlockchainCode, tx: CreateErc20WrappedTx): Promise<number>;
  getFees(blockchain: BlockchainCode): Promise<Record<string, number>>;
  goBack(): void;
  signTransaction(tx: CreateErc20WrappedTx, password: string): Promise<void>;
}

enum Stages {
  SETUP = 'setup',
  SIGN = 'sign',
}

const CreateConvertTransaction: React.FC<OwnProps & StylesProps & StateProps & DispatchProps> = ({
  blockchain,
  classes,
  entry: { address },
  checkGlobalKey,
  estimateGas,
  getBalance,
  getFees,
  getTokenBalanceByAddress,
  goBack,
  signTransaction,
}) => {
  const [convertable, setConvertable] = useState('eth');
  const [initializing, setInitializing] = useState(true);

  const [convertTx, setConvertTx] = React.useState(() => {
    const tx = new workflow.CreateErc20WrappedTx({
      address: address?.value,
      totalBalance: getBalance(),
      totalTokenBalance: getTokenBalanceByAddress('WETH', address?.value),
    });

    return tx.dump();
  });

  const zeroWei = new Wei(0);

  const [stdGasPrice, setStdGasPrice] = React.useState(zeroWei);
  const [maxGasPrice, setMaxGasPrice] = React.useState(zeroWei);
  const [minGasPrice, setMinGasPrice] = React.useState(zeroWei);

  const [gasPrice, setGasPrice] = React.useState(0);
  const [gasPriceUnit, setGasPriceUnit] = useState(Wei.ZERO.units.base);
  const [useStdGasPrice, setUseStdGasPrice] = React.useState(true);

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

  const onChangeGasPrice = useCallback(
    (price: number) => {
      const tx = CreateErc20WrappedTx.fromPlain(convertTx);

      tx.gasPrice = new Wei(price, gasPriceUnit);
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

      await signTransaction(tx, password);
    } else {
      setPasswordError('Incorrect password');
    }
  }, [convertTx, password]);

  React.useEffect(() => {
    (async (): Promise<void> => {
      const fees = await getFees(blockchain);

      const { avgMiddle } = fees;

      let { avgLast, avgTail5 } = fees;

      /**
       * For small networks with less than 5 txes in a block the Tail5 value may be larger that the Middle value.
       * Make sure the order is consistent.
       */
      if (avgTail5 > avgMiddle) {
        avgTail5 = avgMiddle;
      }

      if (avgLast > avgTail5) {
        avgLast = avgTail5;
      }

      const gasPrice = new Wei(avgTail5);

      setStdGasPrice(gasPrice);
      setMaxGasPrice(new Wei(avgMiddle));
      setMinGasPrice(new Wei(avgLast));

      const gasPriceOptimalUnit = gasPrice.getOptimalUnit();
      const gasPriceNumber = gasPrice.getNumberByUnit(gasPriceOptimalUnit).toNumber();

      setGasPrice(gasPriceNumber);
      setGasPriceUnit(gasPriceOptimalUnit);

      const tx = CreateErc20WrappedTx.fromPlain(convertTx);

      tx.gasPrice = new Wei(gasPriceNumber, gasPriceOptimalUnit);
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

          const gas = await estimateGas(blockchain, tx);

          tx.gas = new BigNumber(gas);
          tx.rebalance();

          setConvertTx(tx.dump());
        })();
      }
    }
  }, [convertable, convertTx.amount]);

  const currentTx = CreateErc20WrappedTx.fromPlain(convertTx);

  const stdGasPriceNumber = stdGasPrice.getNumberByUnit(gasPriceUnit).toNumber();
  const maxGasPriceNumber = maxGasPrice.getNumberByUnit(gasPriceUnit).toNumber();
  const minGasPriceNumber = minGasPrice.getNumberByUnit(gasPriceUnit).toNumber();

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
            <AmountField
              disabled={initializing}
              initialAmount={currentTx.amount}
              units={currentTx.amount.units}
              onChangeAmount={onChangeAmount}
              onMaxClicked={onClickMaxAmount}
            />
          </FormFieldWrapper>
          <FormFieldWrapper>
            <FormLabel>Gas price</FormLabel>
            <Box className={classes.inputField}>
              <Box className={classes.gasPriceTypeBox}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={useStdGasPrice}
                      color="primary"
                      disabled={initializing}
                      onChange={(event): void => {
                        const checked = event.target.checked;

                        if (checked) {
                          setGasPrice(stdGasPriceNumber);
                          onChangeGasPrice(stdGasPriceNumber);
                        }

                        setUseStdGasPrice(checked);
                      }}
                    />
                  }
                  label={useStdGasPrice ? 'Standard Gas Price' : 'Custom Gas Price'}
                />
              </Box>
              {!useStdGasPrice && (
                <Box className={classes.gasPriceSliderBox}>
                  <Slider
                    aria-labelledby="discrete-slider"
                    classes={{ markLabel: classes.gasPriceMarkLabel }}
                    className={classes.gasPriceSlider}
                    defaultValue={stdGasPriceNumber}
                    marks={[
                      { value: minGasPriceNumber, label: 'Slow' },
                      { value: maxGasPriceNumber, label: 'Urgent' },
                    ]}
                    max={maxGasPriceNumber}
                    min={minGasPriceNumber}
                    step={0.01}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(value): string => value.toFixed(2)}
                    getAriaValueText={(): string => `${gasPrice.toFixed(2)} ${gasPriceUnit.toString()}`}
                    onChange={(event, value): void => {
                      setGasPrice(value as number);
                      onChangeGasPrice(value as number);
                    }}
                  />
                </Box>
              )}
              <Box className={classes.gasPriceHelpBox}>
                <FormHelperText className={classes.gasPriceHelp}>
                  {gasPrice.toFixed(2)} {gasPriceUnit.toString()}
                </FormHelperText>
              </Box>
            </Box>
          </FormFieldWrapper>
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
            <PasswordInput error={passwordError} minLength={1} onChange={setPassword} />
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
      getBalance() {
        return new Wei(accounts.selectors.getBalance(state, entry.id, zero)?.number ?? 0);
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
    async estimateGas(blockchain, tx) {
      const token = registry.bySymbol(blockchain, 'WETH');

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
    async getFees(blockchain) {
      const [avgLast, avgMiddle, avgTail5] = await Promise.all([
        dispatch(transaction.actions.estimateFee(blockchain, 128, 'avgLast')),
        dispatch(transaction.actions.estimateFee(blockchain, 128, 'avgMiddle')),
        dispatch(transaction.actions.estimateFee(blockchain, 128, 'avgTail5')),
      ]);

      return {
        avgLast,
        avgMiddle,
        avgTail5,
      };
    },
    goBack() {
      dispatch(screen.actions.goBack());
    },
    async signTransaction(tx, password) {
      if (tx.address == null) {
        return;
      }

      const { blockchain, id: accountId } = ownProps.entry;
      const chain = blockchainIdToCode(blockchain);
      const token = registry.bySymbol(chain, 'WETH');

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
          tx.gasPrice,
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
