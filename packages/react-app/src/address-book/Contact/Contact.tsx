import { BlockchainCode, PersistentState, blockchainIdToCode, isBitcoin } from '@emeraldwallet/core';
import { accounts, addressBook, screen, transaction } from '@emeraldwallet/store';
import { Address, CoinAvatar } from '@emeraldwallet/ui';
import {
  CircularProgress,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Typography,
  createStyles,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Edit as EditIcon, ArrowDropDown as MenuIcon, Clear as RemoveIcon } from '@material-ui/icons';
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
    accountAddress: {
      alignItems: 'center',
      display: 'flex',
      flexBasis: '50%',
    },
    accountBitcoin: {
      alignItems: 'center',
      display: 'flex',
      justifyContent: 'space-between',
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
  getXPubLastIndex(blockchain: BlockchainCode, xpub: string): Promise<number | undefined>;
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

  const [addressUpdating, setAddressUpdating] = React.useState(contact.address.type === 'xpub');
  const [currentContact, setCurrentContact] = React.useState(contact);
  const [menuElement, setMenuElement] = React.useState<null | HTMLButtonElement>(null);

  React.useEffect(() => {
    const {
      address: { address, type },
      blockchain,
      id,
    } = contact;

    const blockchainCode = blockchainIdToCode(blockchain);

    if (id != null) {
      if (isBitcoin(blockchainCode) && type === 'xpub') {
        getXPubLastIndex(blockchainCode, address).then((lastIndex) => {
          if (lastIndex == null) {
            setCurrentContact(contact);
            setAddressUpdating(false);
          } else {
            setXPubIndex(address, lastIndex).then(() => {
              getAddressBookItem(id).then((updated) => {
                setCurrentContact(updated);
                setAddressUpdating(false);
              });
            });
          }
        });
      } else {
        setCurrentContact(contact);
      }
    }
  }, [contact, getAddressBookItem, getXPubLastIndex, setXPubIndex]);

  const {
    address: { address, currentAddress, type },
    blockchain,
    label,
  } = currentContact;

  const blockchainCode = blockchainIdToCode(blockchain);

  return (
    <div className={styles.container}>
      <div className={styles.avatar}>
        <CoinAvatar blockchain={blockchainCode} />
      </div>
      <div className={styles.account}>
        <Typography variant="body1">{label ?? currentAddress ?? address}</Typography>
        {isBitcoin(blockchainCode) && type === 'xpub' ? (
          <div className={styles.accountBitcoin}>
            <div className={styles.accountAddress}>
              <Address
                address={currentAddress ?? ''}
                loading={addressUpdating}
                loadingIcon={<CircularProgress color="primary" size="1em" />}
              />
            </div>
            <Address
              address={address}
              classes={{ root: styles.accountAddress }}
              label={`${address.slice(0, 8)}..${address.slice(-4)}`}
            />
          </div>
        ) : (
          <Address address={address} />
        )}
      </div>
      <div className={styles.actions}>
        <IconButton onClick={(event) => setMenuElement(event.currentTarget)}>
          <MenuIcon />
        </IconButton>
        <Menu anchorEl={menuElement} keepMounted={true} open={menuElement != null} onClose={() => setMenuElement(null)}>
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

export default connect<unknown, DispatchProps, OwnProps>(
  null,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (dispatch: any, ownProps) => ({
    getAddressBookItem(id) {
      return dispatch(addressBook.actions.getAddressBookItem(id));
    },
    async getXPubLastIndex(blockchain, xpub) {
      const start = await dispatch(accounts.actions.getXPubPosition(xpub));

      return dispatch(transaction.actions.getXPubLastIndex(blockchain, xpub, start));
    },
    goToEdit(contact) {
      dispatch(screen.actions.gotoScreen(screen.Pages.EDIT_ADDRESS, contact, null, true));
    },
    onDelete() {
      const {
        contact: { blockchain, id },
      } = ownProps;

      dispatch(addressBook.actions.deleteContactAction(blockchainIdToCode(blockchain), id as string));
    },
    setXPubIndex(xpub, position) {
      return dispatch(transaction.actions.setXPubCurrentIndex(xpub, position));
    },
  }),
)(Contact);
