import { IState, addressBook, screen, settings } from '@emeraldwallet/store';
import { connect } from 'react-redux';
import ContactForm, { DispatchProps, StateProps } from '../ContactForm';

export default connect<StateProps, DispatchProps, {}, IState>(
  (state) => ({
    blockchains: settings.selectors.currentChains(state),
    title: 'Edit Contact',
  }),
  (dispatch) => ({
    onSubmit({ blockchain, id, label }) {
      dispatch(addressBook.actions.editContactAction(blockchain, id, label));
    },
    onCancel() {
      dispatch(screen.actions.gotoScreen(screen.Pages.ADDRESS_BOOK, null, null, true));
    },
  }),
)(ContactForm);
