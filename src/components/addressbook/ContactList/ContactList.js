import React from 'react';
import { connect } from 'react-redux';
import muiThemeable from 'material-ui/styles/muiThemeable';
import Immutable from 'immutable';
import Contact from './Contact';
import TopBar from '../../layout/TopBar';

const styles = {
  container: {
    marginBottom: '10px',
    marginTop: '5px',
  },

  listItem: {
    marginTop: '10px',
  },

  noItems: {
    padding: '10px',
    backgroundColor: 'white',
    marginTop: '10px',
    textAlign: 'center',
  },
};

const ContactList = ({ addressBook, muiTheme }) => {
  styles.listItem.border = `1px solid ${muiTheme.palette.borderColor}`;
  styles.noItems.border = `1px solid ${muiTheme.palette.borderColor}`;

  let list;
  if (addressBook.size > 0) {
    list = addressBook.map((addr) => (
      <div key={addr.get('address')} style={styles.listItem}>
        <Contact address={addr} />
      </div>));
  } else {
    list = (
      <div style={styles.noItems}>
        There are no contacts. Add one.
      </div>);
  }

  return (
    <div>
      <TopBar />
      <div style={styles.container}>
        {list}
      </div>
    </div>
  );
};

const AddressBook = connect(
  (state, ownProps) => ({
    addressBook: state.addressBook.get('addressBook', Immutable.List()),
  }),
  (dispatch, ownProps) => ({
  })
)(muiThemeable()(ContactList));

export default AddressBook;
