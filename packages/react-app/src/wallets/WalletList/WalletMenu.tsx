import { IState, screen } from '@emeraldwallet/store';
import { ListItemIcon, Menu, MenuItem, Typography } from '@material-ui/core';
import {
  AddCircleOutline as AddCircleOutlineIcon,
  Assignment as AssignmentIcon,
  MoreVert as MoreVertIcon,
} from '@material-ui/icons';
import * as React from 'react';
import { connect } from 'react-redux';

interface DispatchProps {
  showDetails: () => void;
  onAddAccount: () => void;
}

interface OwnProps {
  hasHDAccount: boolean;
  walletId: string;
}

const WalletMenu: React.FC<DispatchProps & OwnProps> = ({ hasHDAccount, showDetails, onAddAccount }) => {
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
      <Menu
        id="simple-menu"
        anchorEl={anchorEl}
        keepMounted={true}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem onClick={showDetails}>
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
      </Menu>
    </>
  );
};

export default connect<{}, DispatchProps, OwnProps, IState>(
  null,
  (dispatch, ownProps) => (
    {
      onAddAccount: () => {
        dispatch(screen.actions.gotoScreen(screen.Pages.CREATE_HD_ACCOUNT, ownProps.walletId));
      },
      showDetails: () => {
        dispatch(screen.actions.gotoScreen(screen.Pages.WALLET_INFO, ownProps.walletId));
      },
    }
  ),
)(WalletMenu);
