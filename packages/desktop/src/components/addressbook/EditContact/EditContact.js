import { connect } from 'react-redux';
import { ContactForm } from '@emeraldwallet/ui';

const EditContact = connect(
  (state, ownProps) => ({
    blockAddress: true,
    title: 'Edit Contact',
    initialValues: {
      name: ownProps.address.name,
      address: ownProps.address.address,
      description: ownProps.address.description,
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
)(ContactForm);

export default EditContact;
