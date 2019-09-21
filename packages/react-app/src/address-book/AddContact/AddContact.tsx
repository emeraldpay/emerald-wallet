import { addressBook, screen, settings } from '@emeraldwallet/store';
import { connect } from 'react-redux';
import ContactForm from '../ContactForm';

const { gotoScreen } = screen.actions;
const AddContact = connect(
  (state, ownProps) => ({
    blockAddress: false,
    title: 'Add Contact',
    blockchains: settings.selectors.currentChains(state)
  }),
  (dispatch, ownProps) => ({
    onSubmit: (data: any) => {
      const chain = data.blockchain.toLowerCase();
      dispatch(addressBook.actions.addContactAction(chain, data.address, data.name, data.description));
    },
    onCancel: () => {
      dispatch(gotoScreen('address-book'));
    }
  })
)(ContactForm);

export default AddContact;
