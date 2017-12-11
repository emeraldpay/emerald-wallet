// @flow
import accounts from '../vault/accounts';
import screen from './screen';

/**
 * Shows account details page if address in the vault or notification otherwise.
 */
export const showAccountDetails = (address: string) => {
  return (dispatch, getState) => {
    const state = getState();
    const acc = accounts.selectors.selectAccount(state, address);
    if (!acc) {
      dispatch(screen.actions.showNotification(`Account ${address} not found in the vault`, 'warning', 3000));
    } else {
      dispatch(screen.actions.gotoScreen('account', acc));
    }
  };
};
