import { BigAmount } from '@emeraldpay/bigamount';
import { EntryId } from '@emeraldpay/emerald-vault-core';
import {
  BlockchainCode,
  EthereumTransaction,
  EthereumTransactionType,
  amountFactory,
  formatAmount,
} from '@emeraldwallet/core';
import {
  GasPrices,
  IState,
  SignData,
  StoredTransaction,
  accounts,
  blockchains,
  screen,
  transaction,
} from '@emeraldwallet/store';
import { Address, Button, ButtonGroup, FormAccordion, FormLabel, FormRow, PasswordInput } from '@emeraldwallet/ui';
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
import * as React from 'react';
import { connect } from 'react-redux';
import WaitLedger from '../../ledger/WaitLedger';
import StoredTxView from '../StoredTxView';

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
    address: {
      display: 'flex',
      flex: 1,
      flexDirection: 'column',
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
  entryId: EntryId | undefined;
  ethTx: EthereumTransaction;
  isHardware: boolean;
  tx: StoredTransaction;
  goBack(): void;
}

interface DispatchProps {
  getTopFee(blockchain: BlockchainCode): Promise<GasPrices>;
  lookupAddress(blockchain: BlockchainCode, address: string): Promise<string | null>;
  signTransaction(tx: EthereumTransaction, entryId?: string, password?: string): Promise<void>;
  verifyGlobalKey(password: string): Promise<boolean>;
}

const SpeedUpEthereumTransaction: React.FC<OwnProps & DispatchProps> = ({
  entryId,
  ethTx,
  isHardware,
  tx,
  getTopFee,
  goBack,
  lookupAddress,
  signTransaction,
  verifyGlobalKey,
}) => {
  const styles = useStyles();

  const mounted = React.useRef(true);

  const [stage, setStage] = React.useState(Stages.SETUP);

  const [initializing, setInitializing] = React.useState(true);
  const [verifying, setVerifying] = React.useState(false);

  const [fromName, setFromName] = React.useState<string | null>(null);
  const [toName, setToName] = React.useState<string | null>(null);

  const factory = React.useMemo(() => amountFactory(ethTx.blockchain), [ethTx.blockchain]);
  const zeroAmount = React.useMemo(() => factory(0), [factory]);

  const txGasPrice =
    (ethTx.type === EthereumTransactionType.EIP1559 ? ethTx.maxGasPrice : ethTx.gasPrice) ?? zeroAmount;
  const txGasPriceUnit = txGasPrice.getOptimalUnit(undefined, undefined, 6);

  const [useEip1559, setUseEip1559] = React.useState(ethTx.type === EthereumTransactionType.EIP1559);

  const minGasPriceNumber = txGasPrice.plus(txGasPrice.multiply(0.1)).getNumberByUnit(txGasPriceUnit).toNumber();

  const [maxGasPrice, setMaxGasPrice] = React.useState(minGasPriceNumber);
  const [highMaxGasPrice, setHighMaxGasPrice] = React.useState<BigAmount>(txGasPrice.plus(txGasPrice.multiply(0.5)));

  const txPriorityGasPrice = ethTx.priorityGasPrice ?? zeroAmount;

  const minPriorityGasPriceNumber = txPriorityGasPrice.getNumberByUnit(txGasPriceUnit).toNumber();

  const [priorityGasPrice, setPriorityGasPrice] = React.useState(minPriorityGasPriceNumber);
  const [highPriorityGasPrice, setHighPriorityGasPrice] = React.useState(
    txPriorityGasPrice.plus(txPriorityGasPrice.multiply(0.5)),
  );

  const [password, setPassword] = React.useState<string>();
  const [passwordError, setPasswordError] = React.useState<string>();

  const onSignTransaction = async (): Promise<void> => {
    setPasswordError(undefined);

    const newGasPrice = BigAmount.createFor(maxGasPrice, zeroAmount.units, factory, txGasPriceUnit);
    const newPriorityGasPrice = BigAmount.createFor(priorityGasPrice, zeroAmount.units, factory, txGasPriceUnit);

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
      await signTransaction(
        {
          ...ethTx,
          ...gasPrices,
        },
        entryId,
      );
    } else {
      if (password == null) {
        return;
      }

      setVerifying(true);

      const correctPassword = await verifyGlobalKey(password);

      if (correctPassword) {
        await signTransaction(
          {
            ...ethTx,
            ...gasPrices,
          },
          entryId,
          password,
        );
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

  React.useEffect(() => {
    (async () => {
      if (mounted.current) {
        const { blockchain } = ethTx;

        let name = await lookupAddress(blockchain, ethTx.from);

        setFromName(name);

        if (ethTx.to != null) {
          name = await lookupAddress(blockchain, ethTx.to);

          setToName(name);
        }
      }
    })();
  }, [ethTx, lookupAddress]);

  React.useEffect(
    () => {
      (async () => {
        if (mounted.current) {
          const { blockchain } = ethTx;

          const topFee = await getTopFee(blockchain);

          const factory = amountFactory(blockchain);

          const topMaxGasPrice = factory(topFee.max);
          const highMaxGasPrice = topMaxGasPrice.getNumberByUnit(txGasPriceUnit).toNumber();

          const topPriorityGasPrice = factory(topFee.priority);
          const highPriorityGasPrice = topPriorityGasPrice.getNumberByUnit(txGasPriceUnit).toNumber();

          if (highMaxGasPrice > 0 && minGasPriceNumber > highMaxGasPrice && maxGasPrice <= highMaxGasPrice) {
            setHighMaxGasPrice(topMaxGasPrice);
          }

          if (
            highPriorityGasPrice > 0 &&
            minPriorityGasPriceNumber > highPriorityGasPrice &&
            priorityGasPrice <= highPriorityGasPrice
          ) {
            setHighPriorityGasPrice(topPriorityGasPrice);
          }

          setInitializing(false);
        }
      })();

      return () => {
        mounted.current = false;
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const highGasPriceNumber = highMaxGasPrice.getNumberByUnit(txGasPriceUnit).toNumber();
  const highPriorityGasPriceNumber = highPriorityGasPrice.getNumberByUnit(txGasPriceUnit).toNumber();

  return (
    <>
      {stage === Stages.SETUP && (
        <>
          <StoredTxView tx={tx} />
          <FormRow>
            <FormLabel top={0}>From</FormLabel>
            <div className={styles.address}>
              <Address address={ethTx.from} />
              {fromName != null && <Address address={fromName} />}
            </div>
          </FormRow>
          {ethTx.to != null && (
            <FormRow>
              <FormLabel top={0}>To</FormLabel>
              <div className={styles.address}>
                <Address address={ethTx.to} />
                {toName != null && <Address address={toName} />}
              </div>
            </FormRow>
          )}
          <FormRow>
            <FormLabel>Amount</FormLabel>
            {formatAmount(ethTx.value)}
          </FormRow>
          <FormAccordion
            title={
              <FormRow last>
                <FormLabel>Settings</FormLabel>
                {useEip1559 ? 'EIP-1559' : 'Basic Type'} / {maxGasPrice.toFixed(2)} {txGasPriceUnit.toString()}
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
                      { value: minGasPriceNumber, label: 'Normal' },
                      { value: highGasPriceNumber, label: 'Urgent' },
                    ]}
                    max={highGasPriceNumber}
                    min={minGasPriceNumber}
                    step={0.01}
                    value={maxGasPrice}
                    valueLabelDisplay="auto"
                    getAriaValueText={(): string => `${maxGasPrice.toFixed(2)} ${txGasPriceUnit.toString()}`}
                    onChange={(event, value): void => setMaxGasPrice(value as number)}
                    valueLabelFormat={(value): string => value.toFixed(2)}
                  />
                </Box>
                <Box className={styles.gasPriceHelpBox}>
                  <FormHelperText className={styles.gasPriceHelp}>
                    {maxGasPrice.toFixed(2)} {txGasPriceUnit.toString()}
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
                        { value: minPriorityGasPriceNumber, label: 'Normal' },
                        { value: highPriorityGasPriceNumber, label: 'Urgent' },
                      ]}
                      max={highPriorityGasPriceNumber}
                      min={minPriorityGasPriceNumber}
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
          <FormRow last>
            <FormLabel />
            <ButtonGroup classes={{ container: styles.buttons }}>
              {initializing && (
                <Button disabled icon={<CircularProgress size={16} />} label="Checking the network" variant="text" />
              )}
              <Button label="Cancel" onClick={goBack} />
              <Button
                primary
                disabled={initializing}
                label="Create Transaction"
                onClick={() => setStage(Stages.SIGN)}
              />
            </ButtonGroup>
          </FormRow>
        </>
      )}
      {stage === Stages.SIGN && (
        <>
          <FormRow>
            <FormLabel />
            <Typography>Speed up transaction {ethTx.hash}</Typography>
          </FormRow>
          {isHardware ? (
            <WaitLedger fullSize blockchain={ethTx.blockchain} onConnected={() => onSignTransaction} />
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
    </>
  );
};

export default connect<unknown, DispatchProps, OwnProps, IState>(
  null,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (dispatch: any) => ({
    getTopFee(blockchain) {
      return dispatch(transaction.actions.getTopFee(blockchain));
    },
    goBack() {
      dispatch(screen.actions.goBack());
    },
    lookupAddress(blockchain, address) {
      return dispatch(blockchains.actions.lookupAddress(blockchain, address));
    },
    async signTransaction(tx, password, entryId) {
      if (entryId == null || tx.to == null) {
        return;
      }

      const zeroAmount = amountFactory(tx.blockchain)(0);

      let gasPrices: Pick<EthereumTransaction, 'gasPrice' | 'maxGasPrice' | 'priorityGasPrice'>;

      if (tx.type === EthereumTransactionType.EIP1559) {
        gasPrices = {
          maxGasPrice: tx.maxGasPrice ?? zeroAmount,
          priorityGasPrice: tx.priorityGasPrice ?? zeroAmount,
        };
      } else {
        gasPrices = {
          gasPrice: tx.gasPrice ?? zeroAmount,
        };
      }

      const signed: SignData | undefined = await dispatch(
        transaction.actions.signTransaction(entryId, { ...tx, ...gasPrices }, password),
      );

      if (signed != null) {
        const gasPrice = (tx.type === EthereumTransactionType.EIP1559 ? tx.maxGasPrice : tx.gasPrice) ?? zeroAmount;

        dispatch(
          screen.actions.gotoScreen(
            screen.Pages.BROADCAST_TX,
            {
              ...signed,
              fee: gasPrice.multiply(tx.gas),
              originalAmount: tx.value,
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
)(SpeedUpEthereumTransaction);
