import { connect } from 'react-redux';
import { AddressForm } from './form';

const AddressEdit = connect(
  (state, ownProps) => ({
    blockAddress: true,
    initialValues: {
      name: ownProps.address.get('name'),
      address: ownProps.address.get('address'),
      description: ownProps.address.get('description'),
    },
  }),
  (dispatch, ownProps) => ({
    onSubmit: (data) => {
      ownProps.submit(data);
    },
    cancel: () => {
      ownProps.cancel();
    },
  })
)(AddressForm);

export default AddressEdit;
