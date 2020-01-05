import * as React from "react";
import {Button, IconButton, ListItemIcon, Menu, MenuItem, Typography} from "@material-ui/core";
import MoreVertIcon from '@material-ui/icons/MoreVert';
import AssignmentIcon from '@material-ui/icons/Assignment';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import {connect} from "react-redux";
import {addresses, screen, State, addAccount} from "@emeraldwallet/store";
import { WalletOp } from "@emeraldpay/emerald-vault-core";

type OwnProps = {
  wallet: WalletOp
}

type RenderProps = {
}

type DispatchProps = {
  showDetails: () => void,
  addAccount: () => void
}

const WalletMenu = ((props: RenderProps & DispatchProps) => {

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const { showDetails, addAccount } = props;

  return (
    <div>
      <IconButton aria-label="details"
                   onClick={handleClick}>
         <MoreVertIcon />
      </IconButton>
      <Menu
        id="simple-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem onClick={showDetails}>
          <ListItemIcon>
            <AssignmentIcon fontSize="small" />
          </ListItemIcon>
          <Typography variant="inherit">Wallet Details</Typography>
        </MenuItem>
        <MenuItem onClick={addAccount}>
          <ListItemIcon>
            <AddCircleOutlineIcon fontSize="small" />
          </ListItemIcon>
          <Typography variant="inherit">Add Coin</Typography>
        </MenuItem>
        <MenuItem>
          <ListItemIcon>
            <ArrowDownwardIcon fontSize="small" />
          </ListItemIcon>
          <Typography variant="inherit">Deposit Into Wallet</Typography>
        </MenuItem>
        <MenuItem>
          <ListItemIcon>
            <ArrowUpwardIcon fontSize="small" />
          </ListItemIcon>
          <Typography variant="inherit">Send From Wallet</Typography>
        </MenuItem>
      </Menu>
    </div>
  );
});

export default connect<RenderProps, DispatchProps, OwnProps, State>(
  null,
  (dispatch, ownProps) => {
    return {
      showDetails: () => {
        dispatch(screen.actions.gotoScreen('wallet', ownProps.wallet.value));
      },
      addAccount: () => {
        dispatch(addAccount.actions.start(ownProps.wallet));
        dispatch(screen.actions.gotoScreen('add-account'));
      },
    }
  }
)((WalletMenu));