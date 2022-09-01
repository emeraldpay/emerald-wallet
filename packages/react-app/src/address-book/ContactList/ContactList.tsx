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
      display: 'flex',
      flexDirection: 'column',
      maxHeight: '100%',
    },
    list: {
      height: '100%',
      marginTop: 10,
      overflowY: 'auto',
    },
    listItem: {
      border: `1px solid ${theme.palette && theme.palette.divider}`,
      margin: 5,
    },
    noItems: {
      backgroundColor: 'white',
      border: `1px solid ${theme.palette && theme.palette.divider}`,
      marginTop: 10,
      padding: 10,
      textAlign: 'center',
    },
  }),
);

const ContactList: React.FC<StateProps> = ({ contacts }) => {
  const styles = useStyles();

  return (
    <div className={styles.container}>
      <TopBar />
      <div className={styles.list}>
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
