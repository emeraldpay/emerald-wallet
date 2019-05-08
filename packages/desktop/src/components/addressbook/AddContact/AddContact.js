import { connect } from 'react-redux';
import { ContactForm } from '@emeraldwallet/ui';
import Addressbook from '../../../store/vault/addressbook';
import { gotoScreen } from '../../../store/wallet/screen/screenActions';

const AddContact = connect(
  (state, ownProps) => ({
    blockAddress: false,
    title: 'Add Contact',
  }),
  (dispatch, ownProps) => ({
    onSubmit: (data) => new Promise((resolve, reject) => {
      dispatch(Addressbook.actions.addAddress(data.address, data.name, data.description))
        .then((response) => {
          resolve(response);
          dispatch(gotoScreen('address-book'));
        });
    }),
    onCancel: () => {
      dispatch(gotoScreen('address-book'));
    },
  })
)(ContactForm);

export default AddContact;
