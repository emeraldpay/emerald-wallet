import React from 'react';
import { shallow } from 'enzyme';
import { AddToken, styles2 } from './add';
import ConnectedAddToken from './';

const reduceClasses = (prev, curr) => Object.assign({}, prev, { [curr]: curr });
const classes = Object.keys(styles2).reduce(reduceClasses, {});

describe('tokens/AddToken', () => {
  it('renders without crash', () => {
    const component = shallow(<AddToken classes={classes} />);
  });

  it('onSubmit dispatch valid actions to store', () => {
    const store = {
      subscribe() {},
      getState() {},
      dispatch() { return Promise.resolve(); },
    };
    const component = shallow(<ConnectedAddToken />, {context: { store}});
    expect(component.props().onSubmit({token: {}})).toBeDefined();
  });
});

