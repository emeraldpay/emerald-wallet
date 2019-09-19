import { connect } from 'react-redux';
import ContactForm from '../ContactForm';

const EditContact = connect(
  (state, ownProps: any) => ({
    blockAddress: true,
    title: 'Edit Contact',
    initialValues: {
      name: ownProps.address.name,
      address: ownProps.address.address,
      description: ownProps.address.description
    }
  }),
  (dispatch, ownProps) => ({
    onSubmit: (data: any) => {
      ownProps.submit(data);
    },
    cancel: () => {
      ownProps.onCancel();
    }
  })
)(ContactForm);

export default EditContact;
