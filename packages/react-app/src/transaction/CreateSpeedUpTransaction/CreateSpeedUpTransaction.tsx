import { Wei } from '@emeraldpay/bigamount-crypto';
import { BlockchainCode, EthereumTransaction } from '@emeraldwallet/core';
import { IState, SignData, accounts, screen , transaction } from '@emeraldwallet/store';
import { Back, Button, ButtonGroup, Page, PasswordInput } from '@emeraldwallet/ui';
import { Box, FormHelperText, Slider, createStyles, withStyles } from '@material-ui/core';
import BigNumber from 'bignumber.js';
import * as React from 'react';
import { useCallback, useState } from 'react';
import { connect } from 'react-redux';
import FormFieldWrapper from '../CreateTx/FormFieldWrapper';
import FormLabel from '../CreateTx/FormLabel/FormLabel';

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
    fontSize: '0.7em',
  },
});

interface DispatchProps {
  checkGlobalKey(password: string): Promise<boolean>;
  getTopFee(blockchain: BlockchainCode, eip1559: boolean): Promise<number>;
  goBack(): void;
  signTransaction(tx: EthereumTransaction, password: string, accountId?: string): Promise<void>;
}

interface OwnProps {
  transaction: EthereumTransaction;
}

interface StateProps {
  accountId?: string;
}

interface StylesProps {
  classes: Record<keyof typeof styles, string>;
}

const CreateSpeedUpTransaction: React.FC<DispatchProps & OwnProps & StateProps & StylesProps> = ({
  accountId,
  classes,
  transaction,
  checkGlobalKey,
  getTopFee,
  goBack,
  signTransaction,
}) => {
  const txGasPrice = new Wei(transaction.maxGasPrice ?? transaction.gasPrice ?? 0);
  const txGasPriceUnit = txGasPrice.getOptimalUnit();

  const minGasPriceNumber = txGasPrice.plus(txGasPrice.multiply(0.1)).getNumberByUnit(txGasPriceUnit).toNumber();

  const [gasPrice, setGasPrice] = React.useState(minGasPriceNumber);
  const [maxGasPrice, setMaxGasPrice] = React.useState(txGasPrice.plus(txGasPrice.multiply(0.5)));

  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string>();

  const onSignTransaction = useCallback(async () => {
    setPasswordError(undefined);

    const correctPassword = await checkGlobalKey(password);

    if (correctPassword) {
      const newGasPrice = new Wei(gasPrice, txGasPriceUnit).number;

      let gasPrices: Record<'gasPrice', BigNumber> | Record<'maxGasPrice', BigNumber>;

      if (transaction.gasPrice == null) {
        gasPrices = { maxGasPrice: newGasPrice };
      } else {
        gasPrices = { gasPrice: newGasPrice };
      }

      await signTransaction(
        {
          ...transaction,
          ...gasPrices,
        },
        password,
        accountId,
      );
    } else {
      setPasswordError('Incorrect password');
    }
  }, [accountId, gasPrice, password, transaction]);

  React.useEffect(() => {
    (async (): Promise<void> => {
      const topFee = await getTopFee(transaction.blockchain, transaction.gasPrice == null);

      const topGasPrice = new Wei(topFee);

      if (topGasPrice.number.gt(0) && gasPrice <= topGasPrice.getNumberByUnit(txGasPriceUnit).toNumber()) {
        setMaxGasPrice(topGasPrice);
      }
    })();
  }, []);

  const maxGasPriceNumber = maxGasPrice.getNumberByUnit(txGasPriceUnit).toNumber();

  return (
    <Page title="Speed Up Transaction" leftIcon={<Back onClick={goBack} />}>
      <FormFieldWrapper>
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
    </Page>
  );
};

export default connect<{}, DispatchProps, OwnProps, IState>(
  (state, ownProps) => {
    const { blockchain, from } = ownProps.transaction;

    const account = accounts.selectors.findAccountByAddress(state, from, blockchain);

    return { accountId: account?.id };
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (dispatch: any) => ({
    checkGlobalKey(password) {
      return dispatch(accounts.actions.verifyGlobalKey(password));
    },
    async getTopFee(blockchain, eip1559) {
      let avgTop: null | number = null;

      try {
        if (eip1559) {
          let { max: maxGasPrice } = await dispatch(transaction.actions.estimateFee(blockchain, 128, 'avgTop'));

          if (maxGasPrice == null || new BigNumber(maxGasPrice).eq(0)) {
            maxGasPrice = await dispatch(transaction.actions.estimateFee(blockchain, 256, 'avgTop'));
          }

          avgTop = maxGasPrice;
        } else {
          avgTop = await dispatch(transaction.actions.estimateFee(blockchain, 128, 'avgTop'));

          if (avgTop == null || new BigNumber(avgTop).eq(0)) {
            avgTop = await dispatch(transaction.actions.estimateFee(blockchain, 256, 'avgTop'));
          }
        }
      } catch (exception) {
        // Nothing
      }

      return avgTop ?? 0;
    },
    goBack() {
      dispatch(screen.actions.goBack());
    },
    async signTransaction(tx, password, accountId) {
      if (accountId == null || tx.to == null) {
        return;
      }

      let gasPrice: Wei | undefined;
      let maxGasPrice: Wei | undefined;
      let priorityGasPrice: Wei | undefined;

      if (tx.gasPrice == null) {
        maxGasPrice = new Wei(tx.maxGasPrice ?? 0);
        priorityGasPrice = new Wei(tx.priorityGasPrice ?? 0);
      } else {
        gasPrice = new Wei(tx.gasPrice ?? 0);
      }

      const gas = parseInt(tx.gas.toString(), 10);
      const value = new Wei(tx.value);

      const signed: SignData | undefined = await dispatch(
        transaction.actions.signTransaction(
          accountId,
          tx.blockchain,
          tx.from,
          password,
          tx.to,
          gas,
          value,
          tx.data,
          gasPrice,
          maxGasPrice,
          priorityGasPrice,
          tx.nonce,
        ),
      );

      if (signed != null) {
        dispatch(
          screen.actions.gotoScreen(
            screen.Pages.BROADCAST_TX,
            {
              ...signed,
              fee: (maxGasPrice ?? gasPrice ?? Wei.ZERO).multiply(gas),
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
