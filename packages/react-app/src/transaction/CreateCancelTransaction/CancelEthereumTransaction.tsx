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
  checkGlobalKey(password: string): Promise<boolean>;
  getTopFee(blockchain: BlockchainCode): Promise<GasPrices>;
  lookupAddress(blockchain: BlockchainCode, address: string): Promise<string | null>;
  signTransaction(tx: EthereumTransaction, entryId?: string, password?: string): Promise<void>;
}

const CancelEthereumTransaction: React.FC<DispatchProps & OwnProps> = ({
  entryId,
  ethTx,
  isHardware,
  tx,
  checkGlobalKey,
  getTopFee,
  goBack,
  lookupAddress,
  signTransaction,
}) => {
  const styles = useStyles();

  const mounted = React.useRef(true);

  const [initializing, setInitializing] = React.useState(true);
  const [stage, setStage] = React.useState(Stages.SETUP);

  const [fromName, setFromName] = React.useState<string | null>(null);
  const [toName, setToName] = React.useState<string | null>(null);

  const [password, setPassword] = React.useState('');
  const [passwordError, setPasswordError] = React.useState<string>();

  const [useEip1559, setUseEip1559] = React.useState(ethTx.type === EthereumTransactionType.EIP1559);

  const factory = React.useMemo(() => amountFactory(ethTx.blockchain), [ethTx.blockchain]);

  const txGasPrice = factory(ethTx.maxGasPrice ?? ethTx.gasPrice ?? 0);
  const txGasPriceUnit = txGasPrice.getOptimalUnit();

  const txPriorityGasPrice = factory(ethTx.priorityGasPrice ?? 0);

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
      await signTransaction({ ...ethTx, ...gasPrices }, entryId);
    } else {
      const correctPassword = await checkGlobalKey(password);

      if (correctPassword) {
        await signTransaction({ ...ethTx, ...gasPrices }, entryId, password);
      } else {
        setPasswordError('Incorrect password');
      }
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
            {formatAmount(factory(ethTx.value))}
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
              <PasswordInput error={passwordError} onChange={setPassword} onPressEnter={onSignTransaction} />
            </FormRow>
          )}
          <FormRow last>
            <FormLabel />
            <ButtonGroup classes={{ container: styles.buttons }}>
              <Button label="Cancel" onClick={goBack} />
              {!isHardware && (
                <Button
                  primary
                  disabled={initializing || password.length === 0}
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
    checkGlobalKey(password) {
      return dispatch(accounts.actions.verifyGlobalKey(password));
    },
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
)(CancelEthereumTransaction);
