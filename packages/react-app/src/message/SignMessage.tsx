import { EntryId, SeedDescription, SignedMessage, WalletEntry, isEthereumEntry } from '@emeraldpay/emerald-vault-core';
import { isSeedPkRef } from '@emeraldpay/emerald-vault-core/lib/types';
import { EthereumMessage, blockchainById, isStructuredMessage } from '@emeraldwallet/core';
import { IState, accounts, screen } from '@emeraldwallet/store';
import {
  Address,
  Back,
  Button,
  ButtonGroup,
  FormLabel,
  FormRow,
  IdentityIcon,
  Page,
  PasswordInput,
  Table,
} from '@emeraldwallet/ui';
import { hashMessage } from '@ethersproject/hash';
import { recoverAddress } from '@ethersproject/transactions';
import {
  Chip,
  Menu,
  MenuItem,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import * as React from 'react';
import { connect } from 'react-redux';
import WaitLedger from '../ledger/WaitLedger';

const useStyles = makeStyles()({
  address: {
    alignItems: 'center',
    cursor: 'pointer',
    display: 'flex',
  },
  addressIcon: {
    marginRight: 20,
  },
  buttons: {
    display: 'flex',
    justifyContent: 'end',
    width: '100%',
  },
  message: {
    maxHeight: 240,
  },
  validation: {
    display: 'flex',
    justifyContent: 'end',
    marginBottom: 10,
    width: '100%',
  },
  typeAutoDetected: {
    marginLeft: 20,
  }
});

enum Stages {
  SETUP = 'setup',
  SIGN = 'sign',
  VERIFY = 'verify',
}

enum MessageType {
  AUTO = 'auto',
  EIP191 = 'eip191',
  EIP712 = 'eip712',
}

enum Validation {
  EMPTY = 'empty',
  EIP191 = 'eip191',
  EIP712 = 'eip712',
  INVALID = 'invalid',
}

interface SignAddress {
  address: string;
  entryId: EntryId;
}

type AddressesByEntry = Record<EntryId, string[]>;
type EntryById = Record<EntryId, WalletEntry>;

interface OwnProps {
  walletId: string;
}

interface StateProps {
  addressesByEntry?: AddressesByEntry;
  entryById?: EntryById;
  getSeed(entryId: EntryId): SeedDescription | undefined;
}

interface DispatchPros {
  goBack(): void;
  goShowMessage(message: SignedMessage, text: string): void;
  showError(message: string): void;
  signMessage(entryId: string, message: string, type: MessageType, password?: string): Promise<SignedMessage>;
  verifyGlobalKey(password: string): Promise<boolean>;
}

const SignMessage: React.FC<OwnProps & StateProps & DispatchPros> = ({
  addressesByEntry,
  entryById,
  getSeed,
  goBack,
  goShowMessage,
  showError,
  signMessage,
  verifyGlobalKey,
}) => {
  const { classes } = useStyles();

  const mounted = React.useRef(true);

  const [stage, setStage] = React.useState(Stages.SETUP);

  const [addressMenuElement, setAddressMenuElement] = React.useState<HTMLDivElement | null>(null);

  const [selectedAddress, setSelectedAddress] = React.useState<SignAddress>(() => {
    const [[entryId, addresses = []]] = Object.entries(addressesByEntry ?? {});

    return {
      entryId,
      address: addresses[0],
    };
  });

  const [messageText, setMessageText] = React.useState('');
  const [messageType, setMessageType] = React.useState(MessageType.AUTO);

  const [validation, setValidation] = React.useState(Validation.EMPTY);

  const [verifying, setVerifying] = React.useState(false);

  const [password, setPassword] = React.useState<string>();
  const [passwordError, setPasswordError] = React.useState<string>();

  const structuredMessage = React.useMemo<EthereumMessage | null>(() => {
    try {
      return JSON.parse(messageText);
    } catch (exception) {
      return null;
    }
  }, [messageText]);

  const validateMessage = (message: string | null, type?: MessageType): void => {
    message ??= messageText;
    type ??= messageType;

    if (message.length === 0) {
      setValidation(Validation.EMPTY);
    } else if (type === MessageType.AUTO) {
      setValidation(isStructuredMessage(message) ? Validation.EIP712 : Validation.EIP191);
    } else if (type === MessageType.EIP712) {
      setValidation(isStructuredMessage(message) ? Validation.EIP712 : Validation.INVALID);
    } else {
      setValidation(Validation.EIP191);
    }
  };

  const onOpenAddressMenu = (event: React.MouseEvent<HTMLDivElement>): void =>
    setAddressMenuElement(event.currentTarget);

  const onCloseAddressMenu = (): void => setAddressMenuElement(null);

  const onChangeMessageText = ({ target: { value } }: React.ChangeEvent<HTMLTextAreaElement>): void => {
    setMessageText(value);
    validateMessage(value);
  };

  const onChangeMessageType = ({ target: { value } }: React.ChangeEvent<HTMLInputElement>): void => {
    const type = value as MessageType;

    setMessageType(type);
    validateMessage(null, type);
  };

  const onConfirmMessage = (): void => setStage(validation === Validation.EIP712 ? Stages.VERIFY : Stages.SIGN);

  const onVerifyBack = (): void => setStage(Stages.SETUP);
  const onVerifyNext = (): void => setStage(Stages.SIGN);

  const verifyMessage = ({ address, signature }: SignedMessage): boolean => {
    return address.toLowerCase() === recoverAddress(hashMessage(messageText), signature).toLowerCase();
  };

  const onLedgerConnected = async (): Promise<void> => {
    const signed = await signMessage(selectedAddress.entryId, messageText, messageType);

    if (verifyMessage(signed)) {
      goShowMessage(signed, messageText);
    } else {
      showError('Signature has incorrect signer address');
    }
  };

  const onSignMessage = async (): Promise<void> => {
    if (password == null) {
      return;
    }

    setPasswordError(undefined);
    setVerifying(true);

    const correctPassword = await verifyGlobalKey(password);

    if (correctPassword) {
      const signed = await signMessage(selectedAddress.entryId, messageText, messageType, password);

      if (verifyMessage(signed)) {
        goShowMessage(signed, messageText);
      } else {
        showError('Signature has incorrect signer address');
      }
    } else {
      setPasswordError('Incorrect password');
    }

    if (mounted.current) {
      setVerifying(false);
    }
  };

  const onPasswordEnter = async (): Promise<void> => {
    if (!verifying && (password?.length ?? 0) > 0) {
      await onSignMessage();
    }
  };

  const renderAddress = (signAddress: SignAddress): React.ReactElement => {
    const { address, entryId } = signAddress;

    const onClick = (): void => {
      setAddressMenuElement(null);
      setSelectedAddress(signAddress);
    };

    return (
      <div className={classes.address} onClick={onClick}>
        <div className={classes.addressIcon}>
          <IdentityIcon id={address} />
        </div>
        <div>
          <Address disableCopy address={address} />
          {entryById != null && (
            <Typography color="secondary" variant="body2">
              {blockchainById(entryById[entryId].blockchain)?.getTitle()}
            </Typography>
          )}
        </div>
      </div>
    );
  };

  const renderMessage = (message: unknown, keys: string[] = []): React.ReactNode => {
    if (message != null && typeof message === 'object') {
      return Object.entries(message).map(([key, value]) => {
        const path = [...keys, key];

        if (typeof value === 'string') {
          return (
            <TableRow key={key}>
              <TableCell>{path.join(' > ')}</TableCell>
              <TableCell>{value}</TableCell>
            </TableRow>
          );
        }

        if (value != null && typeof value === 'object') {
          return renderMessage(value, path);
        }

        return null;
      });
    }

    return (
      <TableRow>
        <TableCell align="center" colSpan={2}>
          Empty message
        </TableCell>
      </TableRow>
    );
  };

  React.useEffect(() => {
    return () => {
      mounted.current = false;
    };
  }, []);

  const isInvalid = validation === Validation.INVALID;
  const seed = getSeed(selectedAddress.entryId);

  return (
    <Page title="Sign Message" leftIcon={<Back onClick={goBack} />}>
      {stage === Stages.SETUP && (
        <>
          <FormRow>
            <FormLabel>Sign With</FormLabel>
            {addressesByEntry == null ? (
              <Typography>No addresses available</Typography>
            ) : (
              <>
                <div onClick={onOpenAddressMenu}>{renderAddress(selectedAddress)}</div>
                <Menu anchorEl={addressMenuElement} open={addressMenuElement != null} onClose={onCloseAddressMenu}>
                  {Object.entries(addressesByEntry).map(([entryId, addresses]) =>
                    addresses.map((address) => (
                      <MenuItem
                        key={`${entryId}.${address}`}
                        selected={selectedAddress.entryId === entryId && selectedAddress.address === address}
                      >
                        {renderAddress({ address, entryId })}
                      </MenuItem>
                    )),
                  )}
                </Menu>
              </>
            )}
          </FormRow>
          <FormRow>
            <FormLabel>Type</FormLabel>
            <TextField select value={messageType} onChange={onChangeMessageType}>
              <MenuItem value={MessageType.AUTO}>Auto</MenuItem>
              <MenuItem value={MessageType.EIP191}>Unstructured / EIP-191</MenuItem>
              <MenuItem value={MessageType.EIP712}>Structured / EIP-712</MenuItem>
            </TextField>
            {messageType === MessageType.AUTO && (
                <Chip
                  className={classes.typeAutoDetected}
                  color="primary"
                  label={validation === Validation.EIP712 ? 'Structured / EIP-712' : 'Unstructured / EIP-191'}
                />
            )}
          </FormRow>

          <FormRow>
            <FormLabel top>Message</FormLabel>
            <TextField
              fullWidth
              multiline
              error={isInvalid}
              helperText={isInvalid ? 'Invalid message format (EIP-712)' : null}
              maxRows={7}
              minRows={7}
              value={messageText}
              onChange={onChangeMessageText}
            />
          </FormRow>
          <FormRow last>
            <FormLabel />
            <ButtonGroup classes={{ container: classes.buttons }}>
              <Button label="Cancel" onClick={goBack} />
              <Button
                disabled={validation === Validation.EMPTY || validation === Validation.INVALID}
                label={`${validation === Validation.EIP712 ? 'Preview' : 'Sign'} message`}
                primary={true}
                onClick={onConfirmMessage}
              />
            </ButtonGroup>
          </FormRow>
        </>
      )}
      {stage === Stages.VERIFY && (
        <>
          <FormRow>
            <FormLabel>Sign With</FormLabel>
            <Address address={selectedAddress.address} />
          </FormRow>
          <FormRow>
            <FormLabel>Type</FormLabel>
            <Chip
              color="primary"
              label={messageType === 'eip712' ? 'Structured / EIP-712' : 'Unstructured / EIP-191'}
            />
          </FormRow>
          <FormRow>
            <FormLabel>Contract</FormLabel>
            <Address address={structuredMessage?.domain?.verifyingContract ?? ''} />
          </FormRow>
          <FormRow>
            <FormLabel top>Message</FormLabel>
            <TableContainer className={classes.message}>
              <Table divided size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Key</TableCell>
                    <TableCell>Value</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>{renderMessage(structuredMessage?.message)}</TableBody>
              </Table>
            </TableContainer>
          </FormRow>
          <FormRow last>
            <FormLabel />
            <ButtonGroup classes={{ container: classes.buttons }}>
              <Button label="Cancel" onClick={goBack} />
              <Button label="Edit" onClick={onVerifyBack} />
              <Button label="Sign message" primary={true} onClick={onVerifyNext} />
            </ButtonGroup>
          </FormRow>
        </>
      )}
      {stage === Stages.SIGN && (
        <>
          {seed?.type === 'ledger' ? (
            <WaitLedger onConnected={onLedgerConnected} />
          ) : (
            <>
              <FormRow>
                <FormLabel />
                <Typography>Enter password to unlock seed {seed?.label ?? seed?.id}</Typography>
              </FormRow>
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
            </>
          )}
          <FormRow last>
            <ButtonGroup classes={{ container: classes.buttons }}>
              <Button label="Cancel" onClick={goBack} />
              {seed?.type !== 'ledger' && (
                <Button
                  disabled={verifying || (password?.length ?? 0) === 0}
                  label="Sign Message"
                  primary={true}
                  onClick={onSignMessage}
                />
              )}
            </ButtonGroup>
          </FormRow>
        </>
      )}
    </Page>
  );
};

export default connect<StateProps, DispatchPros, OwnProps, IState>(
  (state, ownProps) => {
    const entries = accounts.selectors
      .findWallet(state, ownProps.walletId)
      ?.entries.filter((entry) => !entry.receiveDisabled && isEthereumEntry(entry));

    const entryById = entries?.reduce<EntryById>((carry, entry) => ({ ...carry, [entry.id]: entry }), {});

    return {
      entryById,
      addressesByEntry: entries?.reduce<AddressesByEntry>((carry, entry) => {
        const { address, id } = entry;

        if (address != null) {
          return {
            ...carry,
            [id]: [...(carry[id] ?? []), address.value],
          };
        }

        return carry;
      }, {}),
      getSeed(entryId) {
        const { [entryId]: entry } = entryById ?? {};

        if (isSeedPkRef(entry, entry.key)) {
          return accounts.selectors.getSeed(state, entry.key.seedId);
        }

        return undefined;
      },
    };
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (dispatch: any, { walletId }) => ({
    goBack() {
      dispatch(screen.actions.goBack());
    },
    goShowMessage(message, text) {
      dispatch(screen.actions.gotoScreen(screen.Pages.SHOW_MESSAGE, { message, text, walletId }));
    },
    showError(message) {
      dispatch(screen.actions.showError(new Error(message)));
    },
    signMessage(entryId, message, type, password) {
      return dispatch(
        accounts.actions.signMessage(
          entryId,
          {
            message,
            type: type === MessageType.AUTO && isStructuredMessage(message) ? MessageType.EIP712 : MessageType.EIP191,
          },
          password,
        ),
      );
    },
    verifyGlobalKey(password) {
      return dispatch(accounts.actions.verifyGlobalKey(password));
    },
  }),
)(SignMessage);
