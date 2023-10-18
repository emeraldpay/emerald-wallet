import { BigAmount } from '@emeraldpay/bigamount';
import { Wei } from '@emeraldpay/bigamount-crypto';
import { EntryId } from '@emeraldpay/emerald-vault-core';
import {
  BlockchainCode,
  DEFAULT_GAS_LIMIT,
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

const CancelEthereumTransaction: React.FC<DispatchProps & OwnProps> = ({
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

  const [password, setPassword] = React.useState<string>();
  const [passwordError, setPasswordError] = React.useState<string>();

  const [useEip1559, setUseEip1559] = React.useState(ethTx.type === EthereumTransactionType.EIP1559);

  const factory = React.useMemo(() => amountFactory(ethTx.blockchain), [ethTx.blockchain]);
  const zeroAmount = React.useMemo(() => factory(0), [factory]);

  const txGasPrice =
    (ethTx.type === EthereumTransactionType.EIP1559 ? ethTx.maxGasPrice : ethTx.gasPrice) ?? zeroAmount;
  const txGasPriceUnit = txGasPrice.getOptimalUnit();

  const txPriorityGasPrice = ethTx.priorityGasPrice ?? zeroAmount;

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

  const onSignTransaction = async (): Promise<void> => {
    setPasswordError(undefined);

    const newGasPrice = BigAmount.createFor(gasPrice, zeroAmount.units, factory, txGasPriceUnit);
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
      await signTransaction({ ...ethTx, ...gasPrices }, entryId);
    } else {
      if (password == null) {
        return;
      }

      setVerifying(true);

      const correctPassword = await verifyGlobalKey(password);

      if (correctPassword) {
        await signTransaction({ ...ethTx, ...gasPrices }, entryId, password);
      } else {
        setPasswordError('Incorrect password');
      }

      if (mounted.current) {
        setVerifying(false);
      }
    }
  };

  const onPasswordEnter = async (): Promise<void> => {
    if (!initializing && !verifying && (password?.length ?? 0) > 0) {
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

  React.useEffect(() => {
    return () => {
      mounted.current = false;
    };
  }, []);

  React.useEffect(
    () => {
      let mounted = true;

      (async () => {
        const { blockchain } = ethTx;

        const topFee = await getTopFee(blockchain);

        if (mounted) {
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
        }
      })();

      return () => {
        mounted = false;
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

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
            <Typography>Canceling transaction {ethTx.hash}</Typography>
          </FormRow>
          {isHardware ? (
            <WaitLedger fullSize blockchain={ethTx.blockchain} onConnected={() => onSignTransaction()} />
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
                  disabled={initializing || verifying || (password?.length ?? 0) === 0}
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
    lookupAddress(blockchain, address) {
      return dispatch(blockchains.actions.lookupAddress(blockchain, address));
    },
    async signTransaction(tx, entryId, password) {
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
        transaction.actions.signTransaction(
          entryId,
          {
            ...tx,
            ...gasPrices,
            data: '',
            gas: DEFAULT_GAS_LIMIT,
            value: zeroAmount,
          },
          password,
        ),
      );

      if (signed != null) {
        const gasPrice = (tx.type === EthereumTransactionType.EIP1559 ? tx.maxGasPrice : tx.gasPrice) ?? zeroAmount;

        dispatch(
          screen.actions.gotoScreen(
            screen.Pages.BROADCAST_TX,
            {
              ...signed,
              fee: gasPrice.multiply(DEFAULT_GAS_LIMIT),
              originalAmount: Wei.ZERO,
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
)(CancelEthereumTransaction);
