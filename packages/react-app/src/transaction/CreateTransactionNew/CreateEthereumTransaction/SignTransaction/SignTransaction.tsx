import { EthereumEntry } from '@emeraldpay/emerald-vault-core';
import { BlockchainCode, TokenRegistry, workflow } from '@emeraldwallet/core';
import { CreateTxStage, IState, SignData, accounts, blockchains, transaction, txStash } from '@emeraldwallet/store';
import { ArrowRight, Button, ButtonGroup, FormLabel, FormRow, IdentityIcon, PasswordInput } from '@emeraldwallet/ui';
import { createStyles, makeStyles } from '@material-ui/core';
import * as React from 'react';
import { connect } from 'react-redux';
import WaitLedger from '../../../../ledger/WaitLedger';

const useStyles = makeStyles((theme) =>
  createStyles({
    address: {
      alignItems: 'center',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
    },
    addressField: {
      lineHeight: '1',
      minHeight: '1rem',
      paddingTop: 10,
    },
    addresses: {
      display: 'flex',
      justifyContent: 'center',
    },
    addressesDirection: {
      alignItems: 'center',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
    },
    addressesDirectionAmount: {
      alignItems: 'center',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
    },
    addressesDirectionAmountText: {
      fontSize: '28px',
    },
    addressesDirectionArrow: {
      display: 'flex',
    },
    buttons: {
      display: 'flex',
      justifyContent: 'end',
      paddingTop: 10,
      width: '100%',
    },
    fee: {
      display: 'flex',
      justifyContent: 'center',
      marginBottom: 20,
      marginTop: 10,
    },
    feeText: {
      color: theme.palette.text.secondary,
    },
  }),
);

interface OwnProps {
  entry: EthereumEntry;
  onCancel(): void;
}

interface StateProps {
  createTx: workflow.CreateTx;
  isHardware: boolean;
}

interface DispatchProps {
  lookupAddress(blockchain: BlockchainCode, address: string): Promise<string | null>;
  signTx(createTx: workflow.CreateTx, password?: string): Promise<void>;
  verifyGlobalKey(password: string): Promise<boolean>;
}

const SignTransaction: React.FC<OwnProps & StateProps & DispatchProps> = ({
  createTx,
  isHardware,
  lookupAddress,
  onCancel,
  signTx,
  verifyGlobalKey,
}) => {
  const styles = useStyles();

  const mounted = React.useRef(true);

  const [nameByAddress, setNameByAddress] = React.useState<Record<string, string>>({});

  const [verifying, setVerifying] = React.useState(false);

  const [password, setPassword] = React.useState<string | undefined>();
  const [passwordError, setPasswordError] = React.useState<string | undefined>();

  const handleSignTransaction = async (): Promise<void> => {
    setPasswordError(undefined);

    if (createTx != null) {
      if (isHardware) {
        await signTx(createTx);
      } else if (password != null) {
        setVerifying(true);

        const correctPassword = await verifyGlobalKey(password);

        if (correctPassword) {
          await signTx(createTx, password);
        } else {
          setPasswordError('Incorrect password');
        }

        if (mounted.current) {
          setVerifying(false);
        }
      }
    }
  };

  const handlePasswordEnter = async (): Promise<void> => {
    if (!verifying && (password?.length ?? 0) > 0) {
      await handleSignTransaction();
    }
  };

  const renderAddress = (address: string | undefined): React.ReactElement => (
    <div className={styles.address}>
      <IdentityIcon size={50} id={address ?? ''} />
      <div className={styles.addressField}>{address}</div>
      <div className={styles.addressField}>
        {address == null || nameByAddress[address] == null ? undefined : nameByAddress[address]}
      </div>
    </div>
  );

  React.useEffect(() => {
    if (createTx != null) {
      const { blockchain, from, to } = createTx;

      Promise.all([
        from == null ? Promise.resolve(null) : lookupAddress(blockchain, from),
        to == null ? Promise.resolve(null) : lookupAddress(blockchain, to),
      ]).then(([fromName, toName]) => {
        if (mounted.current) {
          const nameByAddress: Record<string, string> = {};

          if (from != null && fromName != null) {
            nameByAddress[from] = fromName;
          }

          if (to != null && toName != null) {
            nameByAddress[to] = toName;
          }

          setNameByAddress(nameByAddress);
        }
      });
    }
  }, [createTx, lookupAddress]);

  React.useEffect(() => {
    return () => {
      mounted.current = false;
    };
  }, []);

  const display = createTx.display();

  return (
    <>
      <div className={styles.addresses}>
        {renderAddress(createTx.from)}
        <div className={styles.addressesDirection}>
          <div className={styles.addressesDirectionAmount}>
            <div className={styles.addressesDirectionAmountText} title={createTx.amount.toString()}>
              {display.amount()} {display.amountUnit()}
            </div>
          </div>
          <div className={styles.addressesDirectionArrow}>
            <ArrowRight />
          </div>
        </div>
        {renderAddress(createTx.to)}
      </div>
      <div className={styles.fee}>
        <span className={styles.feeText}>
          Plus {display.feeCost()} {display.feeCostUnit()} for {display.fee()} {display.feeUnit()}.
        </span>
      </div>
      {isHardware ? (
        <WaitLedger fullSize blockchain={createTx.blockchain} onConnected={handleSignTransaction} />
      ) : (
        <FormRow>
          <FormLabel>Password</FormLabel>
          <PasswordInput
            error={passwordError}
            minLength={1}
            placeholder="Enter existing password"
            showLengthNotice={false}
            onChange={setPassword}
            onPressEnter={handlePasswordEnter}
          />
        </FormRow>
      )}
      <FormRow last>
        <ButtonGroup classes={{ container: styles.buttons }}>
          <Button label="Cancel" onClick={onCancel} />
          {!isHardware && (
            <Button
              disabled={verifying || (password?.length ?? 0) === 0}
              primary={true}
              label="Sign Transaction"
              onClick={handleSignTransaction}
            />
          )}
        </ButtonGroup>
      </FormRow>
    </>
  );
};

export default connect<StateProps, DispatchProps, OwnProps, IState>(
  (state, { entry }) => {
    const transaction = txStash.selectors.getTransaction(state);

    if (transaction == null) {
      throw new Error('Transaction not provided!');
    }

    const tokenRegistry = new TokenRegistry(state.application.tokens);

    return {
      createTx: workflow.CreateTxConverter.fromPlain(transaction, tokenRegistry),
      isHardware: accounts.selectors.isHardwareEntry(state, entry) ?? false,
    };
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (dispatch: any, { entry }) => ({
    lookupAddress(blockchain, address) {
      return dispatch(blockchains.actions.lookupAddress(blockchain, address));
    },
    async signTx(createTx, password) {
      if (createTx.from != null && createTx.to != null) {
        const data: SignData | null = await dispatch(
          transaction.actions.signTransaction(entry.id, createTx.build(), password),
        );

        if (data != null) {
          const { txId, signed: raw } = data;

          dispatch(txStash.actions.setSigned({ raw, txId }));
          dispatch(txStash.actions.setStage(CreateTxStage.BROADCAST));
        }
      }
    },
    verifyGlobalKey(password) {
      return dispatch(accounts.actions.verifyGlobalKey(password));
    },
  }),
)(SignTransaction);
