import { PersistentState } from '@emeraldwallet/core';
import { addressBook, IState } from '@emeraldwallet/store';
import { Theme } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import * as React from 'react';
import { connect } from 'react-redux';
import TopBar from '../../common/TopBar';
import Contact from './Contact';

interface StateProps {
  contacts: PersistentState.AddressbookItem[];
}

const useStyles = makeStyles<Theme>((theme) =>
  createStyles({
    container: {
      marginBottom: '10px',
      marginTop: '5px',
    },
    listItem: {
      marginTop: '10px',
      border: `1px solid ${theme.palette && theme.palette.divider}`,
    },
    noItems: {
      backgroundColor: 'white',
      padding: '10px',
      marginTop: '10px',
      textAlign: 'center',
      border: `1px solid ${theme.palette && theme.palette.divider}`,
    },
  }),
);

const ContactList: React.FC<StateProps> = ({ contacts }) => {
  const styles = useStyles();

  return (
    <div>
      <TopBar />
      <div className={styles.container}>
        {contacts.length > 0 ? (
          <>
            {contacts.map((contact) => (
              <div key={`${contact.blockchain}-${contact.address.address}`} className={styles.listItem}>
                <Contact contact={contact} />
              </div>
            ))}
          </>
        ) : (
          <div className={styles.noItems}>There are no contacts. Add one.</div>
        )}
      </div>
    </div>
  );
};

const AddressBook = connect<StateProps, {}, {}, IState>((state) => ({
  contacts: addressBook.selectors.all(state),
}))(ContactList);

export default AddressBook;
