import { addAccount, IState, screen } from '@emeraldwallet/store';
import { IconButton, ListItemIcon, Menu, MenuItem, Typography } from '@material-ui/core';
import {
  AddCircleOutline as AddCircleOutlineIcon,
  ArrowDownward as ArrowDownwardIcon,
  ArrowUpward as ArrowUpwardIcon,
  Assignment as AssignmentIcon,
  MoreVert as MoreVertIcon
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

function WalletMenu (props: IDispatchProps) {
  const { showDetails, onAddAccount } = props;
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div>
      <IconButton aria-label='details' onClick={handleClick}>
         <MoreVertIcon />
      </IconButton>
      <Menu
        id='simple-menu'
        anchorEl={anchorEl}
        keepMounted={true}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem onClick={showDetails}>
          <ListItemIcon>
            <AssignmentIcon fontSize='small' />
          </ListItemIcon>
          <Typography variant='inherit'>Wallet Details</Typography>
        </MenuItem>
        <MenuItem onClick={onAddAccount}>
          <ListItemIcon>
            <AddCircleOutlineIcon fontSize='small' />
          </ListItemIcon>
          <Typography variant='inherit'>Add currency</Typography>
        </MenuItem>
        <MenuItem>
          <ListItemIcon>
            <ArrowDownwardIcon fontSize='small' />
          </ListItemIcon>
          <Typography variant='inherit'>Deposit Into Wallet</Typography>
        </MenuItem>
        <MenuItem>
          <ListItemIcon>
            <ArrowUpwardIcon fontSize='small' />
          </ListItemIcon>
          <Typography variant='inherit'>Send From Wallet</Typography>
        </MenuItem>
      </Menu>
    </div>
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
        dispatch(addAccount.actions.start());
        dispatch(screen.actions.gotoScreen(screen.Pages.ADD_ACCOUNT));
      }
    };
  }
)((WalletMenu));
