import { connect } from 'react-redux';
import { addAddress } from 'store/addressActions';
import { gotoScreen } from '../../store/wallet/screen/screenActions';
import { AddressForm } from './form';

const AddressAdd = connect(
  (state, ownProps) => ({
    blockAddress: false,
  }),
  (dispatch, ownProps) => ({
    onSubmit: (data) => new Promise((resolve, reject) => {
      dispatch(addAddress(data.address, data.name, data.description))
        .then((response) => {
          resolve(response);
          dispatch(gotoScreen('address', data.address));
        });
    }),
    cancel: () => {
      dispatch(gotoScreen('address-book'));
    },
  })
)(AddressForm);

export default AddressAdd;
