import { connect } from 'react-redux';
import { AddressForm } from '../form';

const AddressEdit = connect(
  (state, ownProps) => ({
    blockAddress: true,
    title: 'Edit Contact',
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
      ownProps.onCancel();
    },
  })
)(AddressForm);

export default AddressEdit;
