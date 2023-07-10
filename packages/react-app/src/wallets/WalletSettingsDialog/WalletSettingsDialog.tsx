import { dialog, getCurrentWindow } from '@electron/remote';
import { Wallet } from '@emeraldpay/emerald-vault-core';
import { IState, accounts, application, screen } from '@emeraldwallet/store';
import { ButtonGroup, HashIcon, Input } from '@emeraldwallet/ui';
import Button from '@emeraldwallet/ui/lib/components/common/Button';
import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  createStyles,
  makeStyles,
} from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import { FileFilter } from 'electron';
import * as React from 'react';
import { connect } from 'react-redux';

const IMAGES_FILE_FILTER: Readonly<FileFilter> = {
  name: 'Images',
  extensions: ['jpg', 'jpeg', 'png'],
};

const useStyles = makeStyles(
  createStyles({
    root: {
      width: '100%',
    },
    icon: {
      display: 'inline-block',
      height: 100,
      width: 100,
    },
  }),
);

interface OwnProps {
  walletId: string;
  onClose(): void;
}

interface StateProps {
  wallet?: Wallet;
  walletIcon?: string | null;
}

interface DispatchProps {
  fsReadFile(filePath: string): Promise<Uint8Array | null>;
  setWalletIcon(icon: Uint8Array | null): Promise<boolean>;
  showError(exception: Error): void;
  updateWalletName(name: string): void;
}

const WalletSettingsDialog: React.FC<OwnProps & StateProps & DispatchProps> = ({
  wallet,
  walletIcon,
  fsReadFile,
  setWalletIcon,
  showError,
  updateWalletName,
  onClose,
}) => {
  const styles = useStyles();

  const [name, setName] = React.useState(wallet?.name);
  const [icon, setIcon] = React.useState(walletIcon);

  const onSetIcon = async (): Promise<void> => {
    const {
      filePaths: [filePath],
    } = await dialog.showOpenDialog(getCurrentWindow(), { filters: [IMAGES_FILE_FILTER] });

    if (filePath == null || filePath.length === 0) {
      return;
    }

    const content = await fsReadFile(filePath);

    if (content == null) {
      return;
    }

    setIcon(Buffer.from(content).toString('base64'));
  };

  const onResetIcon = (): void => {
    setIcon(null);
  };

  const onSave = async (): Promise<void> => {
    updateWalletName(name ?? '');

    try {
      await setWalletIcon(icon == null ? null : new Uint8Array(Buffer.from(icon, 'base64')));

      onClose();
    } catch (exception) {
      showError(exception as Error);
    }
  };

  return (
    <Dialog classes={{ paper: styles.root }} open={true}>
      <DialogTitle>Edit Wallet Details</DialogTitle>
      <DialogContent>
        {wallet == null ? (
          <Alert severity="warning">Wallet not found</Alert>
        ) : (
          <Grid container>
            <Grid item xs={3}>
              <Grid container justifyContent="center">
                <Grid item>
                  {icon == null ? (
                    <HashIcon value={`WALLET/${wallet.id}`} size={100} />
                  ) : (
                    <img alt="Wallet Icon" className={styles.icon} src={`data:image/png;base64,${icon}`} />
                  )}
                </Grid>
                <Grid item>
                  <Box mt={1}>
                    <ButtonGroup vertical>
                      <Button primary label="Set Image" onClick={onSetIcon} />
                      <Button label="Reset Image" onClick={onResetIcon} />
                    </ButtonGroup>
                  </Box>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={9}>
              <Input placeholder="Wallet Name" value={name} onChange={({ target: { value } }) => setName(value)} />
            </Grid>
          </Grid>
        )}
      </DialogContent>
      <DialogActions>
        <Button label="Close" onClick={onClose} />
        <Button primary label="Save" onClick={onSave} />
      </DialogActions>
    </Dialog>
  );
};

export default connect<StateProps, DispatchProps, OwnProps, IState>(
  (state, { walletId }) => ({
    wallet: accounts.selectors.findWallet(state, walletId),
    walletIcon: state.accounts.icons[walletId],
  }),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (dispatch: any, { walletId }) => ({
    fsReadFile(filePath) {
      return dispatch(application.actions.fsReadFile(filePath));
    },
    setWalletIcon(icon) {
      return dispatch(accounts.actions.setWalletIcon(walletId, icon));
    },
    showError(exception) {
      dispatch(screen.actions.showError(exception));
    },
    updateWalletName(name) {
      return dispatch(accounts.actions.updateWallet(walletId, name));
    },
  }),
)(WalletSettingsDialog);
