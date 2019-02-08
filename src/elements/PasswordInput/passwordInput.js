import React from 'react';
import PropTypes from 'prop-types';
import { ViewVisible as EyeIcon } from '@emeraldplatform/ui-icons';
import { Warning, WarningText } from 'emerald-js-ui';
import IconButton from '@material-ui/core/IconButton';
import TextField from '../Form/TextField';


export default class PasswordInput extends React.Component {
    static propTypes = {
      onChange: PropTypes.func,
      error: PropTypes.string,
    }

    constructor(props) {
      super(props);
      this.state = {
        showPassword: false,
      };
    }

    onInputChange = (event, newValue) => {
      const { onChange } = this.props;
      onChange(newValue);
    };

    handleEyeClick = () => {
      const { showPassword } = this.state;
      this.setState({
        showPassword: !showPassword,
      });
    }

    renderWarning = () => (
      <div style={{ marginTop: '10px' }}>
        <Warning>
          <WarningText>Password must be minimum 8 characters.</WarningText>
        </Warning>
      </div>
    );

    render() {
      const { error } = this.props;
      const { showPassword } = this.state;
      const iconStyle = {
        color: showPassword ? 'green' : '',
      };

      const EyeIconButton = (
        <IconButton style={iconStyle} onClick={this.handleEyeClick}>
          <EyeIcon />
        </IconButton>
      );

      return (
        <div>
          <div>
            <TextField
              error={ error }
              rightIcon={ EyeIconButton }
              onChange={ this.onInputChange }
              hintText="At least 8 characters"
              type={showPassword ? 'text' : 'password'}
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
