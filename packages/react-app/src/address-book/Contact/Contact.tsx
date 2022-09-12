import { BlockchainCode, PersistentState, blockchainIdToCode, isBitcoin } from '@emeraldwallet/core';
import { addressBook, screen, transaction } from '@emeraldwallet/store';
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
  getAddressBookItem(id: string): Promise<PersistentState.AddressbookItem>;
  getXPubLastIndex(blockchain: BlockchainCode, xpub: string): Promise<number>;
  goToEdit(contact: PersistentState.AddressbookItem): void;
  onDelete(): void;
  setXPubIndex(xpub: string, position: number): Promise<void>;
}

const Contact: React.FC<OwnProps & DispatchProps> = ({
  contact,
  getAddressBookItem,
  getXPubLastIndex,
  goToEdit,
  onDelete,
  setXPubIndex,
}) => {
  const styles = useStyles();

  const [menuElement, setMenuElement] = React.useState<null | HTMLButtonElement>(null);

  const copyAddress = React.useCallback(
    async ({ blockchain, address: { address, type }, id }: PersistentState.AddressbookItem) => {
      const blockchainCode = blockchainIdToCode(blockchain);

      let copyAddress = address;

      if (isBitcoin(blockchainCode) && type === 'xpub') {
        const lastIndex = await getXPubLastIndex(blockchainCode, address);

        await setXPubIndex(address, lastIndex + 1);

        if (id != null) {
          const {
            address: { address: lastAddress },
          } = await getAddressBookItem(id);

          copyAddress = lastAddress;
        }
      }

      clipboard.writeText(copyAddress);

      setMenuElement(null);
    },
    [getAddressBookItem, getXPubLastIndex, setXPubIndex],
  );

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
          <MenuItem onClick={() => copyAddress(contact)}>
            <ListItemIcon>
              <CopyIcon fontSize="small" />
            </ListItemIcon>
            <Typography variant="inherit">Copy address</Typography>
          </MenuItem>
          <MenuItem onClick={() => goToEdit(contact)}>
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

export default connect<{}, DispatchProps, OwnProps>(
  null,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (dispatch: any, ownProps) => ({
    getAddressBookItem(id) {
      return dispatch(addressBook.actions.getAddressBookItem(id));
    },
    getXPubLastIndex(blockchain, xpub) {
      return dispatch(transaction.actions.getXPubLastIndex(blockchain, xpub));
    },
    goToEdit(contact) {
      dispatch(screen.actions.gotoScreen(screen.Pages.EDIT_ADDRESS, contact));
    },
    onDelete() {
      const {
        contact: { blockchain, id },
      } = ownProps;

      dispatch(addressBook.actions.deleteContactAction(blockchainIdToCode(blockchain), id as string));
    },
    setXPubIndex(xpub, position) {
      return dispatch(transaction.actions.setXPubIndex(xpub, position));
    },
  }),
)(Contact);
