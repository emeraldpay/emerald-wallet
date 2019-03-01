import React from 'react';
import withStyles from 'react-jss';
import { connect } from 'react-redux';
import muiThemeable from 'material-ui/styles/muiThemeable';
import Immutable from 'immutable';
import Contact from './Contact';
import TopBar from '../../layout/TopBar';

const styles2 = {
  container: {
    marginBottom: '10px',
    marginTop: '5px',
  },
  listItem: {
    marginTop: '10px',
  },
  noItems: {
    backgroundColor: 'white',
    padding: '10px',
    marginTop: '10px',
    textAlign: 'center',
  },
};

const ContactList = ({ addressBook, muiTheme, classes }) => {
  let list;
  if (addressBook.size > 0) {
    list = addressBook.map((contact) => (
      <div key={contact.get('address')} style={{ border: `1px solid ${muiTheme.palette.borderColor}` }} className={classes.listItem}>
        <Contact address={contact} />
      </div>));
  } else {
    list = (
      <div style={{ border: `1px solid ${muiTheme.palette.borderColor}` }} className={classes.noItems}>
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
    addressBook: state.addressBook.get('addressBook', Immutable.List()),
  }),
  (dispatch, ownProps) => ({
  })
)(muiThemeable()(StyledContactList));

export default AddressBook;
