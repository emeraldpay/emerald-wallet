/*
Copyright 2019 ETCDEV GmbH

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
import {default as MCheckbox} from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import * as React from 'react';

export interface ICheckboxProps {
  label?: string;
  checked?: boolean;
  disabled?: boolean;
  onCheck?: (any, boolean) => void;
}

export interface ICheckboxState {
  checked?: boolean;
}

/**
 * For now this is a wrapper around Material-UI Checkbox
 */
export class Checkbox extends React.Component<ICheckboxProps, ICheckboxState> {
  constructor(props) {
    super(props);
    this.state = {
      checked: props.checked
    };
  }

  public handleCheck = (event: any, isInputChecked: boolean) => {
    this.setState({
      checked: isInputChecked
    });
    if (this.props.onCheck) {
      this.props.onCheck(event, isInputChecked);
    }
  }

  public render() {
    const styles = {
      icon: {
        checked: {
          marginRight: '10px'
        },
        unchecked: {
          marginRight: '10px'
        }
      }
    };
    const {checked} = this.state;
    const {label, disabled} = this.props;
    const iconStyle = checked ? styles.icon.checked : styles.icon.unchecked;

    return (
      <FormControlLabel
        control={(
          <MCheckbox
            checked={checked}
            disabled={disabled}
            // iconStyle={iconStyle}
            onChange={this.handleCheck}
          />
        )}
        label={label}
      />
    );
  }
}

export default Checkbox;
