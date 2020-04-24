import { addressBook } from '@emeraldwallet/store';
import { createStyles, withStyles } from '@material-ui/core/styles';
import * as React from 'react';
import { connect } from 'react-redux';
import TopBar from '../../common/TopBar';
import Contact from './Contact';

const styles = (theme: any) => createStyles({
  container: {
    marginBottom: '10px',
    marginTop: '5px'
  },
  listItem: {
    marginTop: '10px',
    border: `1px solid ${theme.palette && theme.palette.divider}`
  },
  noItems: {
    backgroundColor: 'white',
    padding: '10px',
    marginTop: '10px',
    textAlign: 'center',
    border: `1px solid ${theme.palette && theme.palette.divider}`
  }
});

interface IProps {
  contacts?: any;
  classes: any;
}

const ContactList = ({ contacts, classes }: IProps) => {
  let list;
  if (contacts.length > 0) {
    list = contacts.map((contact: any) => (
      <div key={contact.address} className={classes.listItem}>
        <Contact address={contact} />
      </div>
    ));
  } else {
    list = (
      <div className={classes.noItems}>
        There are no contacts. Add one.
      </div>
    );
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

const StyledContactList = withStyles(styles)(ContactList);

const AddressBook = connect(
  (state, ownProps) => ({
    contacts: addressBook.selectors.all(state)
  }),
  (dispatch, ownProps) => ({
  })
)((StyledContactList));

export default AddressBook;
