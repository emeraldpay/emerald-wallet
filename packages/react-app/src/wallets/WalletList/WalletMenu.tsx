import { IState, screen } from '@emeraldwallet/store';
import { ListItemIcon, Menu, MenuItem, Typography } from '@material-ui/core';
import {
  AddCircleOutline as AddCircleOutlineIcon,
  Assignment as AssignmentIcon,
  MoreVert as MoreVertIcon,
} from '@material-ui/icons';
import * as React from 'react';
import { connect } from 'react-redux';

interface IOwnProps {
  walletId: string;
}

interface IDispatchProps {
  showDetails: () => void;
  onAddAccount: () => void;
}

function WalletMenu(props: IDispatchProps) {
  const { showDetails, onAddAccount } = props;
  const [anchorEl, setAnchorEl] = React.useState<null | SVGSVGElement>(null);

  const handleClick = (event: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

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
        <MenuItem onClick={onAddAccount}>
          <ListItemIcon>
            <AddCircleOutlineIcon fontSize="small" />
          </ListItemIcon>
          <Typography variant="inherit">Setup Supported Coins</Typography>
        </MenuItem>
      </Menu>
    </>
  );
}

export default connect<{}, IDispatchProps, IOwnProps, IState>(
  null,
  (dispatch, ownProps) => {
    return {
      showDetails: () => {
        dispatch(screen.actions.gotoScreen(screen.Pages.WALLET, ownProps.walletId));
      },
      onAddAccount: () => {
        dispatch(screen.actions.gotoScreen(screen.Pages.CREATE_HD_ACCOUNT, ownProps.walletId));
      },
    };
  },
)(WalletMenu);
