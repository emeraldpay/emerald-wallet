import * as React from 'react';
import { ViewVisible as EyeIcon } from '@emeraldplatform/ui-icons';
import { Warning, WarningText, Input } from '@emeraldplatform/ui';
import IconButton from '@material-ui/core/IconButton';

interface Props {
  onChange?: any;
  error?: string;
}

interface State {
  value: string;
  showPassword: boolean;
}

export class PasswordInput extends React.Component<Props, State> {
    constructor(props: Props) {
      super(props);
      this.state = {
        value: '',
        showPassword: false,
      };
    }

    onInputChange = (event: any) => {
      const { onChange } = this.props;
      if (onChange) {
        onChange(event.target.value);
      }
      this.setState({
        value: event.target.value,
      })
    };

    handleEyeClick = () => {
      const { showPassword } = this.state;
      this.setState({
        showPassword: !showPassword,
      });
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
            <Input
              value={ this.state.value }
              errorText={ error }
              rightIcon={ EyeIconButton }
              onChange={ this.onInputChange }
              placeholder="At least 8 characters"
              type={showPassword ? 'text' : 'password'}
            />
          </div>
          { error && this.renderWarning() }
        </div>
      );
    }
}

export default PasswordInput;
