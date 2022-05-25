import { isEthereumEntry } from '@emeraldpay/emerald-vault-core';
import { accounts, IState, screen } from '@emeraldwallet/store';
import { ListItemIcon, Menu, MenuItem, Typography } from '@material-ui/core';
import {
  AddCircleOutline as AddCircleOutlineIcon,
  Assignment as AssignmentIcon,
  MoreVert as MoreVertIcon,
  PlaylistAdd,
} from '@material-ui/icons';
import * as React from 'react';
import { connect } from 'react-redux';

interface DispatchProps {
  onAddAccount(): void;
  onAddAddress(): void;
  onShowDetails(): void;
}

interface OwnProps {
  walletId: string;
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
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | SVGSVGElement>(null);

  const handleClick = React.useCallback((event: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const handleClose = React.useCallback(() => {
    setAnchorEl(null);
  }, []);

  return (
    <>
      <MoreVertIcon onClick={handleClick} />
      <Menu id="simple-menu" anchorEl={anchorEl} keepMounted={true} open={Boolean(anchorEl)} onClose={handleClose}>
        <MenuItem onClick={onShowDetails}>
          <ListItemIcon>
            <AssignmentIcon fontSize="small" />
          </ListItemIcon>
          <Typography variant="inherit">Wallet Details</Typography>
        </MenuItem>
        <MenuItem disabled={!hasHDAccount} onClick={onAddAccount}>
          <ListItemIcon>
            <AddCircleOutlineIcon fontSize="small" />
          </ListItemIcon>
          <Typography variant="inherit">Setup Supported Coins</Typography>
        </MenuItem>
        <MenuItem disabled={!hasHDAccount || !hasEthereumEntry} onClick={onAddAddress}>
          <ListItemIcon>
            <PlaylistAdd fontSize="small" />
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
      hasEthereumEntry: wallet?.entries.find((entry) => isEthereumEntry(entry) && !entry.receiveDisabled) != null,
      hasHDAccount: (wallet?.reserved?.length ?? 0) > 0,
    };
  },
  (dispatch, ownProps) => ({
    onAddAccount: () => {
      dispatch(screen.actions.gotoScreen(screen.Pages.CREATE_HD_ACCOUNT, ownProps.walletId));
    },
    onAddAddress: () => {
      dispatch(screen.actions.gotoScreen(screen.Pages.ADD_HD_ADDRESS, ownProps.walletId));
    },
    onShowDetails: () => {
      dispatch(screen.actions.gotoScreen(screen.Pages.WALLET_INFO, ownProps.walletId));
    },
  }),
)(WalletMenu);
