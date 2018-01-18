// @flow
import React from 'react';
import { Checkbox as IntCheckbox} from 'emerald-js-ui';

/**
 * Wrapper for redux-form Field
 */
export default class Checkbox extends React.Component {
  handleCheck = (event: any, isInputChecked: boolean) => {
    const { input: { onChange }, onCheck } = this.props;
    onChange(isInputChecked);
    if (onCheck) {
      onCheck(isInputChecked);
    }
  }

  render() {
    const { input: { value }, label } = this.props;
    const checked = !!value;

    return (<IntCheckbox
      label={ label }
      checked={ checked }
      onCheck={ this.handleCheck }
    />);
  }
}
