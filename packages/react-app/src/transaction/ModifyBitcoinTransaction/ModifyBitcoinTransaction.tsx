import { EntryId, UnsignedBitcoinTx } from '@emeraldpay/emerald-vault-core';
import {
  BitcoinRawTransaction,
  BlockchainCode,
  PersistentState,
  blockchainIdToCode,
  workflow,
} from '@emeraldwallet/core';
import { BroadcastData, GasPrices, SignHandler, StoredTransaction, accounts, transaction } from '@emeraldwallet/store';
import { Address, Balance, Button, ButtonGroup, FormLabel, FormRow, PasswordInput } from '@emeraldwallet/ui';
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
import { connect } from 'react-redux';
import WaitLedger from '../../ledger/WaitLedger';
import Confirm from '../CreateBitcoinTransaction/Confirm';
import StoredTxView from '../StoredTxView';

const { ChangeType, Direction, State } = PersistentState;

const useStyles = makeStyles(
  createStyles({
    address: {
      display: 'flex',
      flex: 1,
      flexDirection: 'column',
    },
    feeHelp: {
      paddingLeft: 10,
      position: 'initial',
    },
    feeHelpBox: {
      width: 500,
      clear: 'left',
    },
    feeMarkLabel: {
      fontSize: '0.7em',
      opacity: 0.8,
    },
    feeSlider: {
      marginBottom: 10,
      paddingTop: 10,
      width: 300,
    },
    feeSliderBox: {
      float: 'left',
      width: 300,
    },
    feeTypeBox: {
      float: 'left',
      height: 40,
      width: 200,
    },
    inputField: {
      flexGrow: 5,
    },
    notice: {
      marginBottom: 20,
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
  CONFIRM = 'confirm',
}

interface OwnProps {
  entryId: EntryId | undefined;
  isHardware: boolean;
  rawTx: BitcoinRawTransaction;
  tx: StoredTransaction;
  goBack(): void;
  prepareTx?(tx: workflow.CreateBitcoinTx): workflow.CreateBitcoinTx;
  renderNotice(tx: StoredTransaction, unsignedTx: UnsignedBitcoinTx): React.ReactNode;
}

interface DispatchProps {
  broadcastTransaction(data: BroadcastData): void;
  checkGlobalKey(password: string): Promise<boolean>;
  getTopFee(blockchain: BlockchainCode): Promise<GasPrices<number>>;
  restoreBtcTx(): Promise<workflow.CreateBitcoinTx>;
  signTransaction(unsigned: UnsignedBitcoinTx, handler: SignHandler, password?: string): void;
}

const ModifyBitcoinTransaction: React.FC<OwnProps & DispatchProps> = ({
  entryId,
  isHardware,
  tx,
  broadcastTransaction,
  checkGlobalKey,
  getTopFee,
  goBack,
  prepareTx,
  renderNotice,
  restoreBtcTx,
  signTransaction,
}) => {
  const styles = useStyles();

  const [initializing, setInitializing] = React.useState(true);
  const [stage, setStage] = React.useState(Stages.SETUP);

  const [restoredTx, setRestoredTx] = React.useState<workflow.CreateBitcoinTx>();

  const [useStdFee, setUseStdFee] = React.useState(true);

  const [feePrice, setFeePrice] = React.useState(0);
  const [minFeePrice, setMinFeePrice] = React.useState(0);
  const [maxFeePrice, setMaxFeePrice] = React.useState(0);

  const [password, setPassword] = React.useState('');
  const [passwordError, setPasswordError] = React.useState<string>();

  const [signedRawTx, setSignedRawTx] = React.useState<string | null>(null);
  const [signedTxId, setSignedTxId] = React.useState<string | null>(null);

  const txChanges = React.useMemo(
    () =>
      tx.changes
        .filter((change) => change.type !== ChangeType.FEE)
        .sort((first, second) => {
          if (first.direction === second.direction) {
            return 0;
          }

          return first.direction > second.direction ? -1 : 1;
        }) ?? [],
    [tx.changes],
  );

  const onSetFeePrice = (value: number): void => {
    if (restoredTx != null) {
      restoredTx.feePrice = value;
    }

    setFeePrice(value);
  };

  const onSignTransaction = async (): Promise<void> => {
    setPasswordError(undefined);

    if (restoredTx != null) {
      if (isHardware) {
        signTransaction(restoredTx.create(), (txId, signed) => {
          setSignedTxId(txId);
          setSignedRawTx(signed);

          setStage(Stages.CONFIRM);
        });
      } else {
        const correctPassword = await checkGlobalKey(password);

        if (correctPassword) {
          signTransaction(
            restoredTx.create(),
            (txId, signed) => {
              setSignedTxId(txId);
              setSignedRawTx(signed);

              setStage(Stages.CONFIRM);
            },
            password,
          );
        } else {
          setPasswordError('Incorrect password');
        }
      }
    }
  };

  const blockchainCode = blockchainIdToCode(tx.blockchain);

  React.useEffect(
    () => {
      let mounted = true;

      Promise.all([restoreBtcTx(), getTopFee(blockchainCode)])
        .then(([btcTx, { max: currentMaxFee }]) => {
          if (mounted) {
            const { vkbPrice } = btcTx;

            const minimalFee = vkbPrice.plus(vkbPrice.multiply(0.1)).number.toNumber();

            let maximalFee = vkbPrice.plus(vkbPrice.multiply(0.5)).number.toNumber();

            if (currentMaxFee > maximalFee) {
              maximalFee = currentMaxFee;
            }

            setFeePrice(minimalFee);
            setMinFeePrice(minimalFee);
            setMaxFeePrice(maximalFee);

            btcTx.feePrice = minimalFee;

            setRestoredTx(prepareTx?.(btcTx) ?? btcTx);

            setInitializing(false);
          }
        })
        .catch(console.warn);

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
          {txChanges.map((change, index) => (
            <FormRow key={`${change.address}-${index}`}>
              {txChanges[index - 1]?.direction === change.direction ? (
                <FormLabel />
              ) : (
                <FormLabel top={0}>{change.direction === Direction.EARN ? 'To' : 'From'}</FormLabel>
              )}
              <>
                <div className={styles.address}>
                  <Address address={change.address ?? 'Unknown address'} disableCopy={change.address == null} />
                </div>
                <Balance balance={change.amountValue} />
              </>
            </FormRow>
          ))}
          {restoredTx != null && (
            <FormRow>
              <FormLabel top>Fee</FormLabel>
              <Box className={styles.inputField}>
                <Box className={styles.feeTypeBox}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={useStdFee}
                        onChange={(event) => {
                          const checked = event.target.checked;

                          if (checked) {
                            onSetFeePrice(minFeePrice);
                          }

                          setUseStdFee(checked);
                        }}
                        name="checkedB"
                        color="primary"
                      />
                    }
                    label={useStdFee ? 'Standard Fee' : 'Custom Fee'}
                  />
                </Box>
                {!useStdFee && (
                  <Box className={styles.feeSliderBox}>
                    <Slider
                      className={styles.feeSlider}
                      classes={{ markLabel: styles.feeMarkLabel }}
                      defaultValue={minFeePrice}
                      getAriaValueText={(value) => restoredTx.estimateFees(value).toString()}
                      aria-labelledby="discrete-slider"
                      valueLabelDisplay="auto"
                      step={1}
                      marks={[
                        { value: minFeePrice, label: 'Normal' },
                        { value: maxFeePrice, label: 'Urgent' },
                      ]}
                      min={minFeePrice}
                      max={maxFeePrice}
                      onChange={(event, value) => onSetFeePrice(value as number)}
                      valueLabelFormat={(value) => (value / 1024).toFixed(2)}
                    />
                  </Box>
                )}
                <Box className={styles.feeHelpBox}>
                  <FormHelperText className={styles.feeHelp}>
                    {restoredTx.estimateFees(feePrice).toString()}
                  </FormHelperText>
                </Box>
              </Box>
            </FormRow>
          )}
          <FormRow last>
            <FormLabel />
            <ButtonGroup classes={{ container: styles.buttons }}>
              {initializing && (
                <Button disabled icon={<CircularProgress size={16} />} label="Checking the network" variant="text" />
              )}
              <Button label="Cancel" onClick={goBack} />
              <Button
                primary
                disabled={initializing && tx.state > State.SUBMITTED}
                label="Create Transaction"
                onClick={() => setStage(Stages.SIGN)}
              />
            </ButtonGroup>
          </FormRow>
        </>
      )}
      {restoredTx != null && (
        <>
          {stage === Stages.SIGN && (
            <>
              <div className={styles.notice}>{renderNotice(tx, restoredTx.create())}</div>
              {isHardware ? (
                <WaitLedger fullSize blockchain={blockchainCode} onConnected={() => onSignTransaction()} />
              ) : (
                <FormRow>
                  <FormLabel>Password</FormLabel>
                  <PasswordInput error={passwordError} onChange={setPassword} />
                </FormRow>
              )}
              <FormRow last>
                <FormLabel />
                <ButtonGroup classes={{ container: styles.buttons }}>
                  <Button label="Cancel" onClick={goBack} />
                  {!isHardware && (
                    <Button
                      primary
                      disabled={password.length === 0}
                      label="Sign Transaction"
                      onClick={onSignTransaction}
                    />
                  )}
                </ButtonGroup>
              </FormRow>
            </>
          )}
          {stage === Stages.CONFIRM && entryId != null && signedRawTx != null && signedTxId != null && (
            <Confirm
              blockchain={blockchainCode}
              entryId={entryId}
              rawTx={signedRawTx}
              onConfirm={() =>
                broadcastTransaction({
                  entryId,
                  blockchain: blockchainCode,
                  fee: restoredTx.estimateFees(feePrice),
                  signed: signedRawTx,
                  tx: restoredTx.create(),
                  txId: signedTxId,
                })
              }
            />
          )}
        </>
      )}
    </>
  );
};

export default connect<unknown, DispatchProps, OwnProps>(
  null,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (dispatch: any, { entryId, rawTx, tx }) => ({
    broadcastTransaction(data) {
      dispatch(transaction.actions.broadcastTx(data));
    },
    checkGlobalKey(password) {
      return dispatch(accounts.actions.verifyGlobalKey(password));
    },
    getTopFee(blockchain) {
      return dispatch(transaction.actions.getTopFee(blockchain));
    },
    restoreBtcTx() {
      return dispatch(transaction.actions.restoreBtcTx(rawTx, tx));
    },
    signTransaction(unsigned, handler, password) {
      if (entryId == null) {
        return;
      }

      dispatch(transaction.actions.signBitcoinTransaction(entryId, unsigned, password, handler));
    },
  }),
)(ModifyBitcoinTransaction);
