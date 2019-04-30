import React from 'react';
import { shallow, mount } from 'enzyme';
import { AddToken, styles2 } from './add';
import ConnectedAddToken from '.';
import {Provider} from "react-redux";

const reduceClasses = (prev, curr) => Object.assign({}, prev, { [curr]: curr });
const classes = Object.keys(styles2).reduce(reduceClasses, {});

describe('tokens/AddToken', () => {
  it('renders without crash', () => {
    const component = shallow(<AddToken classes={classes} />);
    expect(component).toBeDefined();
  });

  it('onSubmit dispatch valid actions to store', () => {
    const store = {
      subscribe() {},
      getState() {},
      dispatch() { return Promise.resolve(); },
    };
    const component = mount(<Provider store={store}><ConnectedAddToken /></Provider>);
    console.error(component.debug());
    expect(component.props().onSubmit({token: {}})).toBeDefined();
  });
});
