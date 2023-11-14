import { EntryId, UnsignedBitcoinTx } from '@emeraldpay/emerald-vault-core';
import {
  BitcoinRawTransaction,
  BlockchainCode,
  PersistentState,
  amountFactory,
  blockchainIdToCode,
  workflow,
} from '@emeraldwallet/core';
import { ValidationResult } from '@emeraldwallet/core/lib/workflow';
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
import { BtcConfirm } from '../../common/BtcConfirm';
import { StoredTxView } from '../../common/StoredTxView';
import WaitLedger from '../../ledger/WaitLedger';

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
  isCancel?: boolean;
  isHardware: boolean;
  rawTx: BitcoinRawTransaction;
  tx: StoredTransaction;
  goBack(): void;
  renderNotice(tx: StoredTransaction, unsignedTx: UnsignedBitcoinTx): React.ReactElement;
}

interface DispatchProps {
  broadcastTransaction(data: BroadcastData): void;
  getTopFee(blockchain: BlockchainCode): Promise<GasPrices<number>>;
  restoreBtcTx(cancel: boolean): Promise<workflow.BitcoinTx>;
  signTransaction(unsigned: UnsignedBitcoinTx, handler: SignHandler, password?: string): void;
  verifyGlobalKey(password: string): Promise<boolean>;
}

const ModifyBitcoinTransaction: React.FC<OwnProps & DispatchProps> = ({
  entryId,
  isHardware,
  tx,
  isCancel = false,
  broadcastTransaction,
  getTopFee,
  goBack,
  renderNotice,
  restoreBtcTx,
  signTransaction,
  verifyGlobalKey,
}) => {
  const styles = useStyles();

  const mounted = React.useRef(true);

  const [stage, setStage] = React.useState(Stages.SETUP);

  const [initializing, setInitializing] = React.useState(true);
  const [verifying, setVerifying] = React.useState(false);

  const [restoredTx, setRestoredTx] = React.useState<workflow.BitcoinTx>();

  const [useStdFee, setUseStdFee] = React.useState(true);

  const [feePrice, setFeePrice] = React.useState(0);
  const [minFeePrice, setMinFeePrice] = React.useState(0);
  const [maxFeePrice, setMaxFeePrice] = React.useState(0);

  const [password, setPassword] = React.useState<string>();
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

    if (tx.state > State.SUBMITTED) {
      return;
    }

    if (restoredTx != null) {
      if (isHardware) {
        signTransaction(restoredTx.build(), (txId, signed) => {
          setSignedTxId(txId);
          setSignedRawTx(signed);

          setStage(Stages.CONFIRM);
        });
      } else {
        if (password == null) {
          return;
        }

        setVerifying(true);

        const correctPassword = await verifyGlobalKey(password);

        if (correctPassword) {
          signTransaction(
            restoredTx.build(),
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

        if (mounted.current) {
          setVerifying(false);
        }
      }
    }
  };

  const onPasswordEnter = async (): Promise<void> => {
    if (!verifying && (password?.length ?? 0) > 0) {
      await onSignTransaction();
    }
  };

  const blockchainCode = blockchainIdToCode(tx.blockchain);

  React.useEffect(
    () => {
      Promise.all([restoreBtcTx(isCancel), getTopFee(blockchainCode)])
        .then(([btcTx, { max: currentMaxFee }]) => {
          if (mounted.current) {
            const vkbPrice = amountFactory(blockchainCode)(btcTx.vkbPrice);

            const minimalFee = vkbPrice.plus(vkbPrice.multiply(0.1)).number.toNumber();

            let maximalFee = vkbPrice.plus(vkbPrice.multiply(0.5)).number.toNumber();

            if (currentMaxFee > maximalFee) {
              maximalFee = currentMaxFee;
            }

            setFeePrice(minimalFee);
            setMinFeePrice(minimalFee);
            setMaxFeePrice(maximalFee);

            btcTx.feePrice = minimalFee;

            setRestoredTx(btcTx);

            setInitializing(false);
          }
        })
        .catch(console.warn);

      return () => {
        mounted.current = false;
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
                      getAriaValueText={(value) => restoredTx.getFees(value).toString()}
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
                  <FormHelperText className={styles.feeHelp}>{restoredTx.getFees(feePrice).toString()}</FormHelperText>
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
                disabled={initializing || restoredTx?.validate() !== ValidationResult.OK || tx.state > State.SUBMITTED}
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
              {renderNotice(tx, restoredTx.build())}
              {isHardware ? (
                <WaitLedger fullSize blockchain={blockchainCode} onConnected={() => onSignTransaction()} />
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
                      disabled={verifying || (password?.length ?? 0) === 0 || tx.state > State.SUBMITTED}
                      label="Sign Transaction"
                      onClick={onSignTransaction}
                    />
                  )}
                </ButtonGroup>
              </FormRow>
            </>
          )}
          {stage === Stages.CONFIRM && entryId != null && signedRawTx != null && signedTxId != null && (
            <BtcConfirm
              blockchain={blockchainCode}
              disabled={tx.state > State.SUBMITTED}
              entryId={entryId}
              rawTx={signedRawTx}
              onConfirm={() =>
                broadcastTransaction({
                  entryId,
                  blockchain: blockchainCode,
                  fee: restoredTx.getFees(feePrice),
                  signed: signedRawTx,
                  tx: restoredTx.build(),
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
    getTopFee(blockchain) {
      return dispatch(transaction.actions.getTopFee(blockchain));
    },
    restoreBtcTx(cancel) {
      return dispatch(transaction.actions.restoreBtcTx(rawTx, tx, cancel));
    },
    signTransaction(unsigned, handler, password) {
      if (entryId == null) {
        return;
      }

      dispatch(transaction.actions.signBitcoinTransaction(entryId, unsigned, password, handler));
    },
    verifyGlobalKey(password) {
      return dispatch(accounts.actions.verifyGlobalKey(password));
    },
  }),
)(ModifyBitcoinTransaction);
