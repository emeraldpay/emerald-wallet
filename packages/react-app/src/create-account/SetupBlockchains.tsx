import { BlockchainCode, IBlockchain, blockchainIdToCode } from '@emeraldwallet/core';
import { IState, accounts, screen, settings } from '@emeraldwallet/store';
import { Button, ButtonGroup, FormLabel, FormRow, PasswordInput } from '@emeraldwallet/ui';
import { Card, CardActions, CardContent, CardHeader, Step, StepLabel, Stepper, Typography } from '@mui/material';
import * as React from 'react';
import { connect } from 'react-redux';
import WaitLedger from '../ledger/WaitLedger';
import SelectBlockchains from './SelectBlockchains';

enum Stages {
  SELECT = 0,
  CONFIRM = 1,
}

type SelectedBlockchains = Set<BlockchainCode>;

interface OwnProps {
  walletId: string;
}

interface StateProps {
  blockchains: IBlockchain[];
  enabledBlockchains: SelectedBlockchains;
  isHardware: boolean;
}

interface DispatchProps {
  onCancel(): void;
  onCreate(blockchain: BlockchainCode, password?: string): void;
  verifyGlobalKey(password: string): Promise<boolean>;
}

const SetupBlockchains: React.FC<OwnProps & StateProps & DispatchProps> = ({
  blockchains,
  enabledBlockchains,
  isHardware,
  onCreate,
  onCancel,
  verifyGlobalKey,
}) => {
  const mounted = React.useRef(true);

  const [stage, setStage] = React.useState(Stages.SELECT);

  const [selectedBlockchains, setSelectedBlockchains] = React.useState<SelectedBlockchains>(new Set());

  const [verifying, setVerifying] = React.useState(false);

  const [password, setPassword] = React.useState<string>();
  const [passwordError, setPasswordError] = React.useState<string>();

  const handleSelectBlockchains = (selected: BlockchainCode[]): void =>
    setSelectedBlockchains(
      selected.reduce<SelectedBlockchains>((carry, blockchain) => carry.add(blockchain), new Set()),
    );

  const handlePasswordChange = (value: string): void => setPassword(value);

  const handleCreate = (): void =>
    blockchains
      .filter(({ params: { code } }) => !enabledBlockchains.has(code) && selectedBlockchains.has(code))
      .forEach((blockchain) => onCreate(blockchain.params.code, password));

  const handleBackClick = (): void => {
    setPasswordError(undefined);
    setStage(Stages.SELECT);
  };

  const handleSaveChanges = async (): Promise<void> => {
    if (password == null) {
      return;
    }

    setPasswordError(undefined);
    setVerifying(true);

    const correctPassword = await verifyGlobalKey(password);

    if (correctPassword) {
      handleCreate();
    } else {
      setPasswordError('Incorrect password');
    }

    if (mounted.current) {
      setVerifying(false);
    }
  };

  const onPasswordEnter = async (): Promise<void> => {
    if (!verifying && (password?.length ?? 0) > 0) {
      await handleSaveChanges();
    }
  };

  React.useEffect(() => {
    return () => {
      mounted.current = false;
    };
  }, []);

  const hasSelectedBlockchains = blockchains.some(
    ({ params: { code } }) => !enabledBlockchains.has(code) && selectedBlockchains.has(code),
  );

  return (
    <Card>
      <CardHeader
        action={
          <Stepper activeStep={stage}>
            <Step>
              <StepLabel>Select Blockchain</StepLabel>
            </Step>
            <Step>
              <StepLabel>Save Changes</StepLabel>
            </Step>
          </Stepper>
        }
      />
      <CardContent>
        {stage === Stages.SELECT && (
          <SelectBlockchains
            blockchains={blockchains}
            enabled={[...enabledBlockchains]}
            onChange={handleSelectBlockchains}
          />
        )}
        {stage === Stages.CONFIRM &&
          (isHardware ? (
            <WaitLedger onConnected={handleCreate} />
          ) : (
            <>
              <FormRow>
                <FormLabel />
                <Typography variant="h6">Please enter password for the seed</Typography>
              </FormRow>
              <FormRow last>
                <FormLabel>Seed password</FormLabel>
                <PasswordInput
                  error={passwordError}
                  minLength={1}
                  placeholder="Enter existing password"
                  showLengthNotice={false}
                  onChange={handlePasswordChange}
                  onPressEnter={onPasswordEnter}
                />
              </FormRow>
            </>
          ))}
      </CardContent>
      {stage === Stages.SELECT && (
        <CardActions>
          <ButtonGroup>
            <Button label="Cancel" primary={false} onClick={onCancel} />
            <Button disabled={!hasSelectedBlockchains} label="Next" primary onClick={() => setStage(Stages.CONFIRM)} />
          </ButtonGroup>
        </CardActions>
      )}
      {stage === Stages.CONFIRM && !isHardware && (
        <CardActions>
          <ButtonGroup>
            <Button label="Cancel" primary={false} onClick={onCancel} />
            <Button label="Back" primary={false} onClick={handleBackClick} />
            <Button
              disabled={verifying || (password?.length ?? 0) === 0}
              label="Save changes"
              primary
              onClick={handleSaveChanges}
            />
          </ButtonGroup>
        </CardActions>
      )}
    </Card>
  );
};

export default connect<StateProps, DispatchProps, OwnProps, IState>(
  (state, { walletId }): StateProps => {
    const wallet = accounts.selectors.findWallet(state, walletId);

    const [reserved] = wallet?.reserved ?? [];

    let isHardware = false;

    if (reserved != null) {
      isHardware = accounts.selectors.isHardwareSeed(state, { type: 'id', value: reserved.seedId });
    }

    const enabledBlockchains =
      wallet?.entries
        .filter((entry) => !entry.receiveDisabled)
        .reduce((carry, entry) => carry.add(blockchainIdToCode(entry.blockchain)), new Set<BlockchainCode>()) ??
      new Set();

    return {
      enabledBlockchains,
      isHardware,
      blockchains: settings.selectors.currentChains(state),
    };
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (dispatch: any, ownProps) => ({
    onCancel() {
      dispatch(screen.actions.gotoScreen(screen.Pages.WALLET, ownProps.walletId));
    },
    onCreate(blockchain, password) {
      dispatch(accounts.actions.createHdAccountAction(ownProps.walletId, blockchain, password));
    },
    verifyGlobalKey(password) {
      return dispatch(accounts.actions.verifyGlobalKey(password));
    },
  }),
)(SetupBlockchains);
