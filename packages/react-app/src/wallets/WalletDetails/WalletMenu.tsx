import { Uuid, isEthereumEntry } from '@emeraldpay/emerald-vault-core';
import { IState, accounts, screen } from '@emeraldwallet/store';
import { IconButton, ListItemIcon, Menu, MenuItem, Typography } from '@material-ui/core';
import {
  PlaylistAdd as AddIcon,
  Assignment as DetailsIcon,
  Settings as SettingsIcon,
  AddCircleOutline as SetupIcon,
  BorderColor as SignIcon,
  AccountBalanceWallet as WalletIcon,
} from '@material-ui/icons';
import * as React from 'react';
import { connect } from 'react-redux';

interface DispatchProps {
  onAddAccount(): void;
  onAddAddress(): void;
  onShowDetails(): void;
  onSignMessage(): void;
  onWalletSettings(): void;
}

interface OwnProps {
  walletId: Uuid;
}

interface StateProps {
  hasEthereumEntry: boolean;
  hasHDAccount: boolean;
}

const WalletMenu: React.FC<DispatchProps & OwnProps & StateProps> = ({
  hasEthereumEntry,
  hasHDAccount,
  onAddAccount,
  onAddAddress,
  onShowDetails,
  onSignMessage,
  onWalletSettings,
}) => {
  const [menuElement, setMenuElement] = React.useState<HTMLButtonElement | null>(null);

  const onCloseMenu = (): void => {
    setMenuElement(null);
  };

  const onOpenMenu = (event: React.MouseEvent<HTMLButtonElement>): void => {
    setMenuElement(event.currentTarget);
  };

  return (
    <>
      <IconButton onClick={onOpenMenu}>
        <SettingsIcon />
      </IconButton>
      <Menu anchorEl={menuElement} open={menuElement != null} onClose={onCloseMenu}>
        <MenuItem onClick={onSignMessage}>
          <ListItemIcon>
            <SignIcon fontSize="small" />
          </ListItemIcon>
          <Typography variant="inherit">Sign Message</Typography>
        </MenuItem>
        <MenuItem onClick={onShowDetails}>
          <ListItemIcon>
            <DetailsIcon fontSize="small" />
          </ListItemIcon>
          <Typography variant="inherit">Wallet Details</Typography>
        </MenuItem>
        <MenuItem
          onClick={() => {
            onCloseMenu();
            onWalletSettings();
          }}
        >
          <ListItemIcon>
            <WalletIcon fontSize="small" />
          </ListItemIcon>
          <Typography variant="inherit">Wallet Settings</Typography>
        </MenuItem>
        <MenuItem disabled={!hasHDAccount} onClick={onAddAccount}>
          <ListItemIcon>
            <SetupIcon fontSize="small" />
          </ListItemIcon>
          <Typography variant="inherit">Setup Supported Blockchains</Typography>
        </MenuItem>
        <MenuItem disabled={!hasHDAccount || !hasEthereumEntry} onClick={onAddAddress}>
          <ListItemIcon>
            <AddIcon fontSize="small" />
          </ListItemIcon>
          <Typography variant="inherit">Use Additional Addresses</Typography>
        </MenuItem>
      </Menu>
    </>
  );
};

export default connect<StateProps, DispatchProps, OwnProps, IState>(
  (state, ownProps) => {
    const wallet = accounts.selectors.findWallet(state, ownProps.walletId);

    return {
      hasEthereumEntry: wallet?.entries.find((entry) => !entry.receiveDisabled && isEthereumEntry(entry)) != null,
      hasHDAccount: (wallet?.reserved?.length ?? 0) > 0,
    };
  },
  (dispatch, ownProps) => ({
    onAddAccount() {
      dispatch(screen.actions.gotoScreen(screen.Pages.SETUP_BLOCKCHAINS, ownProps.walletId));
    },
    onAddAddress() {
      dispatch(screen.actions.gotoScreen(screen.Pages.ADD_HD_ADDRESS, ownProps.walletId));
    },
    onShowDetails() {
      dispatch(screen.actions.gotoScreen(screen.Pages.WALLET_INFO, ownProps.walletId));
    },
    onSignMessage() {
      dispatch(screen.actions.gotoScreen(screen.Pages.SIGN_MESSAGE, ownProps.walletId));
    },
    onWalletSettings() {
      dispatch(screen.actions.showDialog(screen.Dialogs.WALLET_SETTINGS, ownProps.walletId));
    },
  }),
)(WalletMenu);
