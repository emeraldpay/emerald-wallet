import { BigAmount, Unit } from '@emeraldpay/bigamount';
import { BlockchainCode, EthereumTransaction, EthereumTransactionType, amountFactory } from '@emeraldwallet/core';
import {
  DefaultFee,
  GasPriceType,
  IState,
  SignData,
  accounts,
  application,
  screen,
  transaction,
} from '@emeraldwallet/store';
import { Back, Button, ButtonGroup, Page, PasswordInput } from '@emeraldwallet/ui';
import { Box, FormHelperText, Slider, createStyles, withStyles } from '@material-ui/core';
import BigNumber from 'bignumber.js';
import * as React from 'react';
import { useCallback, useState } from 'react';
import { connect } from 'react-redux';
import FormField from '../../form/FormField';
import FormLabel from '../../form/FormLabel';

const styles = createStyles({
  inputField: {
    flexGrow: 5,
  },
  gasPriceSliderBox: {
    float: 'left',
    marginLeft: 20,
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
    paddingTop: 10,
    position: 'initial',
  },
  gasPriceMarkLabel: {
    fontSize: '0.7em',
    opacity: 0.8,
  },
  gasPriceValueLabel: {
    fontSize: '0.55em',
  },
});

interface OwnProps {
  transaction: EthereumTransaction;
}

interface StateProps {
  accountId?: string;
  defaultFee: DefaultFee;
}

interface DispatchProps {
  checkGlobalKey(password: string): Promise<boolean>;
  getTopFee(blockchain: BlockchainCode, defaultFee: DefaultFee): Promise<GasPriceType>;
  goBack(): void;
  signTransaction(tx: EthereumTransaction, accountId?: string, password?: string): Promise<void>;
}

interface StylesProps {
  classes: Record<keyof typeof styles, string>;
}

const minimalUnit = new Unit(9, '', undefined);

const CreateSpeedUpTransaction: React.FC<OwnProps & DispatchProps & StateProps & StylesProps> = ({
  accountId,
  classes,
  defaultFee,
  transaction,
  checkGlobalKey,
  getTopFee,
  goBack,
  signTransaction,
}) => {
  const [initializing, setInitializing] = useState(true);

  const factory = React.useMemo(() => amountFactory(transaction.blockchain), [transaction.blockchain]);

  const txGasPrice = factory(transaction.maxGasPrice ?? transaction.gasPrice ?? defaultFee.std);
  const txGasPriceUnit = txGasPrice.getOptimalUnit(minimalUnit);

  const minGasPriceNumber = txGasPrice.plus(txGasPrice.multiply(0.1)).getNumberByUnit(txGasPriceUnit).toNumber();

  const [gasPrice, setGasPrice] = React.useState(minGasPriceNumber);
  const [maxGasPrice, setMaxGasPrice] = React.useState<BigAmount>(txGasPrice.plus(txGasPrice.multiply(0.5)));

  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string>();

  const onSignTransaction = useCallback(async () => {
    setPasswordError(undefined);

    const correctPassword = await checkGlobalKey(password);

    if (correctPassword) {
      const newGasPrice = BigAmount.createFor(gasPrice, factory(0).units, factory, txGasPriceUnit).number;

      let gasPrices: Record<'gasPrice', BigNumber> | Record<'maxGasPrice', BigNumber>;

      if (transaction.type === EthereumTransactionType.EIP1559) {
        gasPrices = { maxGasPrice: newGasPrice };
      } else {
        gasPrices = { gasPrice: newGasPrice };
      }

      await signTransaction(
        {
          ...transaction,
          ...gasPrices,
        },
        accountId,
        password,
      );
    } else {
      setPasswordError('Incorrect password');
    }
  }, [accountId, factory, gasPrice, password, transaction, txGasPriceUnit, checkGlobalKey, signTransaction]);

  React.useEffect(
    () => {
      (async (): Promise<void> => {
        const { blockchain } = transaction;

        const topFee = await getTopFee(blockchain, defaultFee);

        const topGasPrice = amountFactory(blockchain)(topFee);
        const maxGasPrice = topGasPrice.getNumberByUnit(txGasPriceUnit).toNumber();

        if (maxGasPrice > 0 && minGasPriceNumber > maxGasPrice && gasPrice <= maxGasPrice) {
          setMaxGasPrice(topGasPrice);
        }

        setInitializing(false);
      })();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const maxGasPriceNumber = maxGasPrice.getNumberByUnit(txGasPriceUnit).toNumber();

  return (
    <Page title="Speed Up Transaction" leftIcon={<Back onClick={goBack} />}>
      <FormField>
        <FormLabel>Gas price</FormLabel>
        <Box className={classes.inputField}>
          <Box className={classes.gasPriceSliderBox}>
            <Slider
              aria-labelledby="discrete-slider"
              classes={{
                markLabel: classes.gasPriceMarkLabel,
                valueLabel: classes.gasPriceValueLabel,
              }}
              className={classes.gasPriceSlider}
              defaultValue={minGasPriceNumber}
              disabled={initializing}
              marks={[
                { value: minGasPriceNumber, label: 'Normal' },
                { value: maxGasPriceNumber, label: 'Urgent' },
              ]}
              max={maxGasPriceNumber}
              min={minGasPriceNumber}
              step={0.01}
              valueLabelDisplay="auto"
              valueLabelFormat={(value): string => value.toFixed(2)}
              getAriaValueText={(): string => `${gasPrice.toFixed(2)} ${txGasPriceUnit.toString()}`}
              onChange={(event, value): void => setGasPrice(value as number)}
            />
          </Box>
          <Box className={classes.gasPriceHelpBox}>
            <FormHelperText className={classes.gasPriceHelp}>
              {gasPrice.toFixed(2)} {txGasPriceUnit.toString()}
            </FormHelperText>
          </Box>
        </Box>
      </FormField>
      <FormField>
        <FormLabel>Password</FormLabel>
        <PasswordInput error={passwordError} onChange={setPassword} />
      </FormField>
      <FormField>
        <FormLabel />
        <ButtonGroup style={{ width: '100%' }}>
          <Button label="Cancel" onClick={goBack} />
          <Button
            label="Sign Transaction"
            disabled={initializing || password.length === 0}
            primary={true}
            onClick={onSignTransaction}
          />
        </ButtonGroup>
      </FormField>
    </Page>
  );
};

export default connect<StateProps, DispatchProps, OwnProps, IState>(
  (state, ownProps) => {
    const { blockchain, from } = ownProps.transaction;

    const account = accounts.selectors.findAccountByAddress(state, from, blockchain);

    return {
      accountId: account?.id,
      defaultFee: application.selectors.getDefaultFee(state, blockchain),
    };
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (dispatch: any) => ({
    checkGlobalKey(password) {
      return dispatch(accounts.actions.verifyGlobalKey(password));
    },
    async getTopFee(blockchain, defaultFee) {
      let max: string | null = null;

      try {
        let avgTop = await dispatch(transaction.actions.estimateFee(blockchain, 128, 'avgTop'));

        if (avgTop == null || new BigNumber(avgTop).eq(0)) {
          avgTop = await dispatch(transaction.actions.estimateFee(blockchain, 256, 'avgTop'));
        }

        ({ max = avgTop } = avgTop);
      } catch (exception) {
        // Nothing
      }

      return max ?? defaultFee.max;
    },
    goBack() {
      dispatch(screen.actions.goBack());
    },
    async signTransaction(tx, password, accountId) {
      if (accountId == null || tx.to == null) {
        return;
      }

      const factory = amountFactory(tx.blockchain);

      let gasPrice: BigAmount | undefined;
      let maxGasPrice: BigAmount | undefined;
      let priorityGasPrice: BigAmount | undefined;

      if (tx.type === EthereumTransactionType.EIP1559) {
        maxGasPrice = factory(tx.maxGasPrice ?? 0);
        priorityGasPrice = factory(tx.priorityGasPrice ?? 0);
      } else {
        gasPrice = factory(tx.gasPrice ?? 0);
      }

      const gas = parseInt(tx.gas.toString(), 10);
      const value = factory(tx.value);

      const signed: SignData | undefined = await dispatch(
        transaction.actions.signTransaction(
          accountId,
          {
            ...tx,
            gasPrice: gasPrice?.number,
            maxGasPrice: maxGasPrice?.number,
            priorityGasPrice: priorityGasPrice?.number,
          },
          password,
        ),
      );

      if (signed != null) {
        dispatch(
          screen.actions.gotoScreen(
            screen.Pages.BROADCAST_TX,
            {
              ...signed,
              fee: (maxGasPrice ?? gasPrice ?? factory(0)).multiply(gas),
              originalAmount: value,
            },
            null,
            true,
          ),
        );
      }
    },
  }),
)(withStyles(styles)(CreateSpeedUpTransaction));
