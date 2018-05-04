import { connect } from 'react-redux';
import Addressbook from '../../../store/vault/addressbook';
import { gotoScreen } from '../../../store/wallet/screen/screenActions';
import { AddressForm } from '../form';

const AddressAdd = connect(
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
    cancel: () => {
      dispatch(gotoScreen('address-book'));
    },
  })
)(AddressForm);

export default AddressAdd;
