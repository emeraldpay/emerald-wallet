import { BlockchainCode, IBlockchain, PersistentState } from '@emeraldwallet/core';
import { IState, addressBook, screen, settings } from '@emeraldwallet/store';
import { Back, Page } from '@emeraldwallet/ui';
import { Button, MenuItem, TextField } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import ContactIcon from '@material-ui/icons/PersonAdd';
import * as React from 'react';
import { connect } from 'react-redux';
import Contact from '../Contact';

const useStyles = makeStyles(() =>
  createStyles({
    blockchains: {
      marginRight: 20,
      width: 320,
    },
    emptyList: {
      textAlign: 'center',
    },
    footer: {
      alignItems: 'center',
      display: 'flex',
      justifyContent: 'space-between',
    },
  }),
);

type BlockchainCodeSelector = 'all' | BlockchainCode;

interface StateProps {
  blockchains: IBlockchain[];
  getContacts(blockchain: BlockchainCodeSelector): PersistentState.AddressbookItem[];
}

interface DispatchProps {
  goBack(): void;
  goToAddNewContact(): void;
}

const ContactList: React.FC<StateProps & DispatchProps> = ({ blockchains, getContacts, goBack, goToAddNewContact }) => {
  const styles = useStyles();

  const [blockchain, setBlockchain] = React.useState<BlockchainCodeSelector>('all');
  const [contacts, setContacts] = React.useState(getContacts(blockchain));

  React.useEffect(() => {
    setContacts(getContacts(blockchain));
  }, [blockchain, getContacts]);

  return (
    <Page
      title="Address Book"
      leftIcon={<Back onClick={goBack} />}
      footer={
        <div className={styles.footer}>
          <TextField
            classes={{ root: styles.blockchains }}
            select={true}
            value={blockchain}
            onChange={({ target: { value } }) => setBlockchain(value as BlockchainCode)}
          >
            <MenuItem value="all">All</MenuItem>
            {blockchains.map((blockchain) => (
              <MenuItem key={blockchain.params.code} value={blockchain.params.code}>
                {blockchain.getTitle()}
              </MenuItem>
            ))}
          </TextField>
          <Button color="primary" startIcon={<ContactIcon />} variant="outlined" onClick={goToAddNewContact}>
            Add new
          </Button>
        </div>
      }
    >
      {contacts.length > 0 ? (
        contacts.map((contact) => (
          <Contact key={`${contact.blockchain}-${contact.address.address}`} contact={contact} />
        ))
      ) : (
        <div className={styles.emptyList}>There are no contacts. Add one.</div>
      )}
    </Page>
  );
};

const AddressBook = connect<StateProps, DispatchProps, {}, IState>(
  (state) => ({
    blockchains: settings.selectors.currentChains(state),
    getContacts(blockchain) {
      return addressBook.selectors.byBlockchain(state, blockchain === 'all' ? null : blockchain);
    },
  }),
  (dispatch) => ({
    goBack() {
      dispatch(screen.actions.goBack());
    },
    goToAddNewContact() {
      dispatch(screen.actions.gotoScreen(screen.Pages.ADD_ADDRESS, null, null, true));
    },
  }),
)(ContactList);

export default AddressBook;
