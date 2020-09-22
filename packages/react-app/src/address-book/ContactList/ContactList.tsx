import {addressBook, IState} from '@emeraldwallet/store';
import {createStyles, makeStyles} from '@material-ui/core/styles';
import * as React from 'react';
import {connect} from 'react-redux';
import TopBar from '../../common/TopBar';
import Contact from './Contact';
import {AddressBookItem} from "@emeraldpay/emerald-vault-core";
import {Theme} from "@material-ui/core";

const useStyles = makeStyles<Theme>((theme) =>
  createStyles({
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
  })
);

const ContactList = ({contacts}: Props) => {
  const styles = useStyles();
  let list;
  if (contacts.length > 0) {
    list = contacts.map((contact: AddressBookItem) => (
      <div key={`${contact.blockchain}_${contact.address.value}`} className={styles.listItem}>
        <Contact address={contact}/>
      </div>
    ));
  } else {
    list = (
      <div className={styles.noItems}>
        There are no contacts. Add one.
      </div>
    );
  }

  return (
    <div>
      <TopBar/>
      <div className={styles.container}>
        {list}
      </div>
    </div>
  );
};

// State Properties
interface Props {
  contacts: AddressBookItem[]
}

const AddressBook = connect(
  (state: IState): Props => ({
    contacts: addressBook.selectors.all(state)
  }),
  (dispatch, ownProps) => ({})
)((ContactList));

export default AddressBook;
