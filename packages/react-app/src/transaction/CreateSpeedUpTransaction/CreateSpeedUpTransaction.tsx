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
import { Back, Button, ButtonGroup, FormLabel, FormRow, Page, PasswordInput } from '@emeraldwallet/ui';
import { Box, CircularProgress, FormHelperText, Slider, createStyles, makeStyles } from '@material-ui/core';
import BigNumber from 'bignumber.js';
import * as React from 'react';
import { useCallback, useState } from 'react';
import { connect } from 'react-redux';
import WaitLedger from '../../ledger/WaitLedger';

const useStyles = makeStyles(
  createStyles({
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
  transaction: EthereumTransaction;
}

interface StateProps {
  entryId?: string;
  defaultFee: DefaultFee;
  isHardware: boolean;
}

interface DispatchProps {
  checkGlobalKey(password: string): Promise<boolean>;
  getTopFee(blockchain: BlockchainCode, defaultFee: DefaultFee): Promise<GasPriceType>;
  goBack(): void;
  signTransaction(tx: EthereumTransaction, entryId?: string, password?: string): Promise<void>;
}

const minimalUnit = new Unit(9, '', undefined);

const CreateSpeedUpTransaction: React.FC<OwnProps & DispatchProps & StateProps> = ({
  entryId,
  defaultFee,
  isHardware,
  transaction,
  checkGlobalKey,
  getTopFee,
  goBack,
  signTransaction,
}) => {
  const styles = useStyles();

  const [initializing, setInitializing] = useState(true);
  const [stage, setStage] = useState(Stages.SETUP);

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

    const newGasPrice = BigAmount.createFor(gasPrice, factory(0).units, factory, txGasPriceUnit).number;

    let gasPrices: Record<'gasPrice', BigNumber> | Record<'maxGasPrice', BigNumber>;

    if (transaction.type === EthereumTransactionType.EIP1559) {
      gasPrices = { maxGasPrice: newGasPrice };
    } else {
      gasPrices = { gasPrice: newGasPrice };
    }

    if (isHardware) {
      await signTransaction(
        {
          ...transaction,
          ...gasPrices,
        },
        entryId,
      );
    } else {
      const correctPassword = await checkGlobalKey(password);

      if (correctPassword) {
        await signTransaction(
          {
            ...transaction,
            ...gasPrices,
          },
          entryId,
          password,
        );
      } else {
        setPasswordError('Incorrect password');
      }
    }
  }, [entryId, factory, gasPrice, isHardware, password, transaction, txGasPriceUnit, checkGlobalKey, signTransaction]);

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
      {stage === Stages.SETUP && (
        <>
          <FormRow>
            <FormLabel>Gas price</FormLabel>
            <Box className={styles.inputField}>
              <Box className={styles.gasPriceSliderBox}>
                <Slider
                  aria-labelledby="discrete-slider"
                  classes={{
                    markLabel: styles.gasPriceMarkLabel,
                    valueLabel: styles.gasPriceValueLabel,
                  }}
                  className={styles.gasPriceSlider}
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
              <Box className={styles.gasPriceHelpBox}>
                <FormHelperText className={styles.gasPriceHelp}>
                  {gasPrice.toFixed(2)} {txGasPriceUnit.toString()}
                </FormHelperText>
              </Box>
            </Box>
          </FormRow>
          {!isHardware && (
            <FormRow>
              <FormLabel>Password</FormLabel>
              <PasswordInput error={passwordError} onChange={setPassword} />
            </FormRow>
          )}
        </>
      )}
      {stage === Stages.SIGN && (
        <WaitLedger fullSize blockchain={transaction.blockchain} onConnected={() => onSignTransaction} />
      )}
      <FormRow last>
        <FormLabel />
        <ButtonGroup classes={{ container: styles.buttons }}>
          {initializing && (
            <Button disabled icon={<CircularProgress size={16} />} label="Checking the network" variant="text" />
          )}
          <Button label="Cancel" onClick={goBack} />
          {isHardware && stage === Stages.SETUP ? (
            <Button
              label="Create Transaction"
              disabled={initializing}
              primary={true}
              onClick={() => setStage(Stages.SIGN)}
            />
          ) : (
            <Button
              label="Sign Transaction"
              disabled={initializing || password.length === 0}
              primary={true}
              onClick={onSignTransaction}
            />
          )}
        </ButtonGroup>
      </FormRow>
    </Page>
  );
};

export default connect<StateProps, DispatchProps, OwnProps, IState>(
  (state, { transaction: { blockchain, from } }) => {
    const entry = accounts.selectors.findAccountByAddress(state, from, blockchain);

    let isHardware = false;

    if (entry != null) {
      const wallet = accounts.selectors.findWalletByEntryId(state, entry.id);

      if (wallet != null) {
        const [account] = wallet.reserved ?? [];

        if (account != null) {
          isHardware = accounts.selectors.isHardwareSeed(state, { type: 'id', value: account.seedId });
        }
      }
    }

    return {
      isHardware,
      entryId: entry?.id,
      defaultFee: application.selectors.getDefaultFee(state, blockchain),
    };
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (dispatch: any) => ({
    checkGlobalKey(password) {
      return dispatch(accounts.actions.verifyGlobalKey(password));
    },
    async getTopFee(blockchain, defaultFee) {
      let avgTop = await dispatch(transaction.actions.estimateFee(blockchain, 128, 'avgTop'));

      if (avgTop == null) {
        avgTop = await dispatch(transaction.actions.estimateFee(blockchain, 256, 'avgTop'));
      }

      if (avgTop == null) {
        const cachedFee = await dispatch(application.actions.cacheGet(`fee.${blockchain}`));

        if (cachedFee == null) {
          return defaultFee.max;
        }

        try {
          ({ avgTop } = JSON.parse(cachedFee));
        } catch (exception) {
          // Nothing
        }
      }

      return avgTop ?? defaultFee.max;
    },
    goBack() {
      dispatch(screen.actions.goBack());
    },
    async signTransaction(tx, password, entryId) {
      if (entryId == null || tx.to == null) {
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
          entryId,
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
)(CreateSpeedUpTransaction);
