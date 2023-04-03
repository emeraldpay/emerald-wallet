import { BigAmount } from '@emeraldpay/bigamount';
import { Wei } from '@emeraldpay/bigamount-crypto';
import {
  BlockchainCode,
  DEFAULT_GAS_LIMIT,
  EthereumTransaction,
  EthereumTransactionType,
  amountFactory,
} from '@emeraldwallet/core';
import { GasPrices, IState, SignData, accounts, screen, transaction } from '@emeraldwallet/store';
import {
  Back,
  Button,
  ButtonGroup,
  FormAccordion,
  FormLabel,
  FormRow,
  Page,
  PasswordInput,
  Address,
} from '@emeraldwallet/ui';
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

interface DispatchProps {
  checkGlobalKey(password: string): Promise<boolean>;
  getTopFee(blockchain: BlockchainCode): Promise<GasPrices>;
  goBack(): void;
  signTransaction(tx: EthereumTransaction, entryId?: string, password?: string): Promise<void>;
}

interface OwnProps {
  transaction: EthereumTransaction;
}

interface StateProps {
  entryId?: string;
  isHardware: boolean;
}

const CreateCancelTransaction: React.FC<DispatchProps & OwnProps & StateProps> = ({
  entryId,
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

  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string>();

  const [useEip1559, setUseEip1559] = React.useState(transaction.type === EthereumTransactionType.EIP1559);

  const factory = React.useMemo(() => amountFactory(transaction.blockchain), [transaction.blockchain]);

  const txGasPrice = factory(transaction.maxGasPrice ?? transaction.gasPrice ?? 0);
  const txGasPriceUnit = txGasPrice.getOptimalUnit();

  const txPriorityGasPrice = factory(transaction.priorityGasPrice ?? 0);

  const lowGasPrice = txGasPrice.plus(txGasPrice.multiply(0.1)).getNumberByUnit(txGasPriceUnit).toNumber();
  const lowPriorityGasPrice = txPriorityGasPrice.getNumberByUnit(txGasPriceUnit).toNumber();

  const [gasPrice, setGasPrice] = React.useState(lowGasPrice);
  const [priorityGasPrice, setPriorityGasPrice] = React.useState(lowPriorityGasPrice);

  const [highGasPrice, setHighGasPrice] = React.useState(
    txGasPrice.plus(txGasPrice.multiply(0.5)).getNumberByUnit(txGasPriceUnit).toNumber(),
  );
  const [highPriorityGasPrice, setHighPriorityGasPrice] = React.useState(
    txPriorityGasPrice.plus(txPriorityGasPrice.multiply(0.5)).getNumberByUnit(txGasPriceUnit).toNumber(),
  );

  const onSignTransaction = useCallback(async () => {
    setPasswordError(undefined);

    const zeroAmount = factory(0);

    const newGasPrice = BigAmount.createFor(gasPrice, zeroAmount.units, factory, txGasPriceUnit).number;
    const newPriorityGasPrice = BigAmount.createFor(priorityGasPrice, zeroAmount.units, factory, txGasPriceUnit).number;

    let gasPrices: Pick<EthereumTransaction, 'gasPrice' | 'maxGasPrice' | 'priorityGasPrice'>;

    if (useEip1559) {
      gasPrices = {
        maxGasPrice: newGasPrice,
        priorityGasPrice: newPriorityGasPrice,
      };
    } else {
      gasPrices = { gasPrice: newGasPrice };
    }

    if (isHardware) {
      await signTransaction({ ...transaction, ...gasPrices }, entryId);
    } else {
      const correctPassword = await checkGlobalKey(password);

      if (correctPassword) {
        await signTransaction({ ...transaction, ...gasPrices }, entryId, password);
      } else {
        setPasswordError('Incorrect password');
      }
    }
  }, [
    entryId,
    factory,
    gasPrice,
    isHardware,
    password,
    priorityGasPrice,
    transaction,
    txGasPriceUnit,
    useEip1559,
    checkGlobalKey,
    signTransaction,
  ]);

  React.useEffect(
    () => {
      (async () => {
        const { blockchain } = transaction;

        const topFee = await getTopFee(blockchain);

        const factory = amountFactory(blockchain);

        const topGasPrice = factory(topFee.max).getNumberByUnit(txGasPriceUnit).toNumber();
        const topPriorityGasPrice = factory(topFee.priority).getNumberByUnit(txGasPriceUnit).toNumber();

        if (topGasPrice > 0 && lowGasPrice > topGasPrice && highGasPrice <= topGasPrice) {
          setHighGasPrice(topGasPrice);
        }

        if (
          topPriorityGasPrice > 0 &&
          lowPriorityGasPrice > topPriorityGasPrice &&
          priorityGasPrice <= topPriorityGasPrice
        ) {
          setHighPriorityGasPrice(topPriorityGasPrice);
        }

        setInitializing(false);
      })();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return (
    <Page title="Cancel Transaction" leftIcon={<Back onClick={goBack} />}>
      {stage === Stages.SETUP && (
        <>
          {transaction.hash != null && (
            <FormRow>
              <FormLabel>Hash</FormLabel>
              <Address address={transaction.hash} />
            </FormRow>
          )}
          {!isHardware && (
            <FormRow>
              <FormLabel>Password</FormLabel>
              <PasswordInput error={passwordError} onChange={setPassword} />
            </FormRow>
          )}
          <FormAccordion
            title={
              <FormRow last>
                <FormLabel>Settings</FormLabel>
                {useEip1559 ? 'EIP-1559' : 'Basic Type'} / {gasPrice.toFixed(2)} {txGasPriceUnit.toString()}
                {useEip1559 ? ' Max Gas Price' : ' Gas Price'}
                {useEip1559
                  ? ` / ${priorityGasPrice.toFixed(2)} ${txGasPriceUnit.toString()} Priority Gas Price`
                  : null}
              </FormRow>
            }
          >
            <FormRow>
              <FormLabel>Use EIP-1559</FormLabel>
              <FormControlLabel
                control={
                  <Switch
                    checked={useEip1559}
                    color="primary"
                    disabled={initializing}
                    onChange={({ target: { checked } }) => setUseEip1559(checked)}
                  />
                }
                label={useEip1559 ? 'Enabled' : 'Disabled'}
              />
            </FormRow>
            <FormRow>
              <FormLabel>{useEip1559 ? 'Max gas price' : 'Gas price'}</FormLabel>
              <Box className={styles.inputField}>
                <Box className={styles.gasPriceSliderBox}>
                  <Slider
                    aria-labelledby="discrete-slider"
                    classes={{
                      markLabel: styles.gasPriceMarkLabel,
                      valueLabel: styles.gasPriceValueLabel,
                    }}
                    className={styles.gasPriceSlider}
                    disabled={initializing}
                    marks={[
                      { value: lowGasPrice, label: 'Normal' },
                      { value: highGasPrice, label: 'Urgent' },
                    ]}
                    max={highGasPrice}
                    min={lowGasPrice}
                    step={0.01}
                    value={gasPrice}
                    valueLabelDisplay="auto"
                    getAriaValueText={(): string => `${gasPrice.toFixed(2)} ${txGasPriceUnit.toString()}`}
                    onChange={(event, value): void => setGasPrice(value as number)}
                    valueLabelFormat={(value): string => value.toFixed(2)}
                  />
                </Box>
                <Box className={styles.gasPriceHelpBox}>
                  <FormHelperText className={styles.gasPriceHelp}>
                    {gasPrice.toFixed(2)} {txGasPriceUnit.toString()}
                  </FormHelperText>
                </Box>
              </Box>
            </FormRow>
            {useEip1559 && (
              <FormRow>
                <FormLabel>Priority gas price</FormLabel>
                <Box className={styles.inputField}>
                  <Box className={styles.gasPriceSliderBox}>
                    <Slider
                      aria-labelledby="discrete-slider"
                      classes={{
                        markLabel: styles.gasPriceMarkLabel,
                        valueLabel: styles.gasPriceValueLabel,
                      }}
                      className={styles.gasPriceSlider}
                      disabled={initializing}
                      marks={[
                        { value: lowPriorityGasPrice, label: 'Normal' },
                        { value: highPriorityGasPrice, label: 'Urgent' },
                      ]}
                      max={highPriorityGasPrice}
                      min={lowPriorityGasPrice}
                      step={0.01}
                      value={priorityGasPrice}
                      valueLabelDisplay="auto"
                      getAriaValueText={(): string => `${priorityGasPrice.toFixed(2)} ${txGasPriceUnit.toString()}`}
                      onChange={(event, value): void => setPriorityGasPrice(value as number)}
                      valueLabelFormat={(value): string => value.toFixed(2)}
                    />
                  </Box>
                  <Box className={styles.gasPriceHelpBox}>
                    <FormHelperText className={styles.gasPriceHelp}>
                      {priorityGasPrice.toFixed(2)} {txGasPriceUnit.toString()}
                    </FormHelperText>
                  </Box>
                </Box>
              </FormRow>
            )}
          </FormAccordion>
        </>
      )}
      {stage === Stages.SIGN && (
        <WaitLedger fullSize blockchain={transaction.blockchain} onConnected={() => onSignTransaction()} />
      )}
      <FormRow last>
        <FormLabel />
        <ButtonGroup classes={{ container: styles.buttons }}>
          {initializing && (
            <Button disabled icon={<CircularProgress size={16} />} label="Checking the network" variant="text" />
          )}
          <Button label="Cancel" onClick={goBack} />
          {isHardware && stage === Stages.SETUP ? (
            <Button primary disabled={initializing} label="Create Transaction" onClick={() => setStage(Stages.SIGN)} />
          ) : (
            <Button
              primary
              label="Sign Transaction"
              disabled={initializing || password.length === 0}
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
    };
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (dispatch: any) => ({
    checkGlobalKey(password) {
      return dispatch(accounts.actions.verifyGlobalKey(password));
    },
    getTopFee(blockchain) {
      return dispatch(transaction.actions.getTopFee(blockchain));
    },
    goBack() {
      dispatch(screen.actions.goBack());
    },
    async signTransaction(tx, entryId, password) {
      if (entryId == null || tx.to == null) {
        return;
      }

      let gasPrice: Wei | undefined;
      let maxGasPrice: Wei | undefined;
      let priorityGasPrice: Wei | undefined;

      if (tx.type === EthereumTransactionType.EIP1559) {
        maxGasPrice = new Wei(tx.maxGasPrice ?? tx.gasPrice ?? 0);
        priorityGasPrice = new Wei(tx.priorityGasPrice ?? 0);
      } else {
        gasPrice = new Wei(tx.maxGasPrice ?? tx.gasPrice ?? 0);
      }

      const signed: SignData | undefined = await dispatch(
        transaction.actions.signTransaction(
          entryId,
          {
            ...tx,
            data: '',
            gas: DEFAULT_GAS_LIMIT,
            gasPrice: gasPrice?.number,
            maxGasPrice: maxGasPrice?.number,
            priorityGasPrice: priorityGasPrice?.number,
            value: amountFactory(tx.blockchain)(0).number,
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
              fee: (maxGasPrice ?? gasPrice ?? Wei.ZERO).multiply(DEFAULT_GAS_LIMIT),
              originalAmount: Wei.ZERO,
            },
            null,
            true,
          ),
        );
      }
    },
  }),
)(CreateCancelTransaction);
