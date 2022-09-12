import { IState, addressBook, screen, settings } from '@emeraldwallet/store';
import { connect } from 'react-redux';
import ContactForm, { DispatchProps, StateProps } from '../ContactForm';

export default connect<StateProps, DispatchProps, {}, IState>(
  (state) => ({
    blockchains: settings.selectors.currentChains(state),
    title: 'Add Contact',
  }),
  (dispatch) => ({
    onSubmit({ address, blockchain, description, label }) {
      dispatch(addressBook.actions.addContactAction(address, blockchain, label, description));
    },
    onCancel() {
      dispatch(screen.actions.gotoScreen(screen.Pages.ADDRESS_BOOK, null, null, true));
    },
  }),
)(ContactForm);
