import {
  ActionTypes,
  ILoadSettingsAction,
  ISetExchRatesAction,
  IUpdateSettingsAction
} from './types';

export interface ISettings {
  language: string;
  localeCurrency: string;
  showHiddenAccounts: boolean;
  numConfirmations: string;
}

export function loadSettings (): ILoadSettingsAction {
  return {
    type: ActionTypes.LOAD_SETTINGS
  };
}

export function updateSettings (settings: ISettings): IUpdateSettingsAction {
  return {
    type: ActionTypes.UPDATE,
    payload: settings
  };
}

// export function update (settings: ISettings) {
//   return (dispatch: any, getState: any) => {
//     ipcRenderer.send('prices/setCurrency', settings.localeCurrency);
//     return Promise.all([
//       dispatch({
//         currency: settings.localeCurrency,
//         type: ActionTypes.SET_LOCALE_CURRENCY
//       }),
//       dispatch({
//         show: settings.showHiddenAccounts,
//         type: ActionTypes.SET_SHOW_HIDDEN_ACCOUNTS
//       }),
//       dispatch({
//         numConfirmations: parseInt(settings.numConfirmations, 10),
//         type: ActionTypes.NUM_CONFIRMATIONS
//       })
//     ]).then(() => {
//       return dispatch(screen.actions.showNotification('Settings has been saved', 'success', 3000, null, null));
//     });
//   };
// }

export function setRatesAction (rates: any): ISetExchRatesAction {
  return {
    type: ActionTypes.EXCHANGE_RATES,
    payload: {
      rates
    }
  };
}
