import { PersistentState, blockchainIdToCode } from '@emeraldwallet/core';
import { addressBook, screen } from '@emeraldwallet/store';
import { Account, CoinAvatar } from '@emeraldwallet/ui';
import { IconButton, ListItemIcon, Menu, MenuItem, Typography, createStyles } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import {
  FileCopy as CopyIcon,
  Edit as EditIcon,
  ArrowDropDown as MenuIcon,
  Clear as RemoveIcon,
} from '@material-ui/icons';
import { clipboard } from 'electron';
import * as React from 'react';
import { connect } from 'react-redux';

const useStyles = makeStyles((theme) =>
  createStyles({
    container: {
      alignItems: 'center',
      display: 'flex',
      '& + &': {
        marginTop: theme.spacing(2),
      },
    },
    avatar: {
      flex: '0 0 auto',
      marginRight: theme.spacing(2),
    },
    account: {
      flex: '1 1 auto',
      minWidth: 0,
    },
    actions: {
      flex: '0 0 auto',
      marginLeft: theme.spacing(2),
    },
  }),
);

interface OwnProps {
  contact: PersistentState.AddressbookItem;
}

interface DispatchProps {
  goToEdit(contact: PersistentState.AddressbookItem): void;
  onDelete(): void;
}

const Contact: React.FC<OwnProps & DispatchProps> = ({ contact, goToEdit, onDelete }) => {
  const styles = useStyles();

  const [menuElement, setMenuElement] = React.useState<null | HTMLButtonElement>(null);

  return (
    <div className={styles.container}>
      <div className={styles.avatar}>
        <CoinAvatar chain={blockchainIdToCode(contact.blockchain)} />
      </div>
      <div className={styles.account}>
        <Account address={contact.address.address} addressWidth="100%" name={contact.label} />
      </div>
      <div className={styles.actions}>
        <IconButton onClick={(event) => setMenuElement(event.currentTarget)}>
          <MenuIcon />
        </IconButton>
        <Menu anchorEl={menuElement} keepMounted={true} open={menuElement != null} onClose={() => setMenuElement(null)}>
          <MenuItem
            onClick={() => {
              clipboard.writeText(contact.address.address);

              setMenuElement(null);
            }}
          >
            <ListItemIcon>
              <CopyIcon fontSize="small" />
            </ListItemIcon>
            <Typography variant="inherit">Copy address</Typography>
          </MenuItem>
          <MenuItem onClick={()=>goToEdit(contact)}>
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            <Typography variant="inherit">Edit</Typography>
          </MenuItem>
          <MenuItem onClick={onDelete}>
            <ListItemIcon>
              <RemoveIcon fontSize="small" />
            </ListItemIcon>
            <Typography variant="inherit">Remove</Typography>
          </MenuItem>
        </Menu>
      </div>
    </div>
  );
};

export default connect<{}, DispatchProps, OwnProps>(null, (dispatch, ownProps) => ({
  goToEdit(contact) {
    dispatch(screen.actions.gotoScreen(screen.Pages.EDIT_ADDRESS, contact));
  },
  onDelete() {
    const {
      contact: { blockchain, id },
    } = ownProps;

    dispatch(addressBook.actions.deleteContactAction(blockchainIdToCode(blockchain), id as string));
  },
}))(Contact);
