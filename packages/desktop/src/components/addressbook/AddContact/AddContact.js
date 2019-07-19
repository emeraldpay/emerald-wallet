import { connect } from 'react-redux';
import { ContactForm } from '@emeraldwallet/ui';
import { screen, addressBook } from '@emeraldwallet/store';
import settings from '../../../store/wallet/settings';

const { gotoScreen } = screen.actions;
const AddContact = connect(
  (state, ownProps) => ({
    blockAddress: false,
    title: 'Add Contact',
    blockchains: settings.selectors.currentChains(state),
  }),
  (dispatch, ownProps) => ({
    onSubmit: (data) => {
      const chain = data.blockchain.toLowerCase();
      dispatch(addressBook.actions.addContactAction(chain, data.address, data.name, data.description));
    },
    onCancel: () => {
      dispatch(gotoScreen('address-book'));
    },
  })
)(ContactForm);

export default AddContact;
