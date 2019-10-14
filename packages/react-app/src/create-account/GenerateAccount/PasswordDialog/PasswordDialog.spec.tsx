import { render } from '@testing-library/react';
import { fromJS } from 'immutable';
import * as React from 'react';
import { Provider } from 'react-redux';
import PasswordDialog from './PasswordDialog';

function createStore () {
  return {
    replaceReducer () {},
    dispatch () {},
    subscribe () {},
    getState () {
      return {
        wallet: {
          settings: fromJS({ mode: { chains: ['ETH'] } })
        }
      };
    }
  };
}

describe('PasswordDialog', () => {
  it('renders without crash', () => {
    const component = render(
      <Provider store={createStore() as any}>
        <PasswordDialog onDashboard={jest.fn()} t={jest.fn()} onGenerate={jest.fn()}/>
      </Provider>
    );
    expect(component).toBeDefined();
  });
});
