import React from 'react';
import {withStyles} from '@material-ui/styles';
import { connect } from 'react-redux';
import { addressBook } from '@emeraldwallet/store';
import Contact from './Contact';
import TopBar from '../../layout/TopBar';

const styles2 = (theme) => ({
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
});

const ContactList = ({ contacts, classes }) => {
  let list;
  if (contacts.length > 0) {
    list = contacts.map((contact) => (
      <div key={contact.address} className={classes.listItem}>
        <Contact address={contact} />
      </div>));
  } else {
    list = (
      <div className={classes.noItems}>
        There are no contacts. Add one.
      </div>);
  }

  return (
    <div>
      <TopBar />
      <div className={classes.container}>
        {list}
      </div>
    </div>
  );
};

const StyledContactList = withStyles(styles2)(ContactList);

const AddressBook = connect(
  (state, ownProps) => ({
    contacts: addressBook.selectors.all(state),
  }),
  (dispatch, ownProps) => ({
  })
)((StyledContactList));

export default AddressBook;
