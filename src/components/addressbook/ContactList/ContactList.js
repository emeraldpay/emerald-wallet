import React from 'react';
import { connect } from 'react-redux';
import muiThemeable from 'material-ui/styles/muiThemeable';
import FlatButton from 'material-ui/FlatButton';
import { Add as AddIcon, Book as BookIcon } from 'emerald-js-ui/lib/icons3';
import Avatar from 'material-ui/Avatar';
import { cardSpace, tables } from 'lib/styles';
import Immutable from 'immutable';
import { gotoScreen } from '../../../store/wallet/screen/screenActions';
import Address from './Contact';
import TopBar from '../../layout/TopBar';

import styles from './ContactList.scss';

const ContactList = ({ addressBook, muiTheme }) => {
  let list;
  if (addressBook.size > 0) {
    list = addressBook.map((addr) => (
      <div key={addr.get('address')} style={{ border: `1px solid ${muiTheme.palette.borderColor}` }} className={styles.listItem}>
        <Address address={addr} />
      </div>));
  } else {
    list = (
      <div style={{ border: `1px solid ${muiTheme.palette.borderColor}` }} className={styles.noItems}>
        There are no contacts. Add one.
      </div>);
  }

  return (
    <div>
      <TopBar />
      <div className={styles.container}>
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
