import { INITIAL_STATE } from './reducer';
import * as selectors from './selectors';
import { moduleName } from './types';

describe('selectors', () => {
  const appState = {
    [moduleName]: INITIAL_STATE
  };

  it('should work', () => {
    expect(selectors.terms(appState)).toEqual(INITIAL_STATE.terms);
    expect(selectors.isConnecting(appState)).toEqual(INITIAL_STATE.connecting);
    expect(selectors.getMessage(appState)).toEqual(INITIAL_STATE.message);
    expect(selectors.isConfigured(appState)).toEqual(INITIAL_STATE.configured);
  });
});
