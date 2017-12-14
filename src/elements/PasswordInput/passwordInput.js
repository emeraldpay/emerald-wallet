import React from 'react';
import PropTypes from 'prop-types';

import TextField from 'elements/Form/TextField';
import { Warning, WarningText } from 'elements/Warning/warning';
import { Eye as EyeIcon } from 'emerald-js-ui/lib/icons';


export default class PasswordInput extends React.Component {
    static propTypes = {
      onChange: PropTypes.func,
      error: PropTypes.string,
    }

    onInputChange = (event, newValue) => {
      const { onChange } = this.props;
      onChange(newValue);
    };

    renderWarning = () => (
      <div style={{ marginTop: '10px' }}>
        <Warning>
          <WarningText>Password must be minimum 8 characters.</WarningText>
        </Warning>
      </div>
    );

    render() {
      const { error } = this.props;

      return (
        <div>
          <div>
            <TextField
              error={ error }
              rightIcon={ <EyeIcon/> }
              onChange={ this.onInputChange }
              hintText="At least 8 characters"
              type="password"
              name="password"
              fullWidth={ true }
              underlineShow={ false }
            />
          </div>
          { error && this.renderWarning() }
        </div>
      );
    }
}

