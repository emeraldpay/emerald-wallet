import * as React from 'react';
import {ViewVisible as EyeIcon} from '@emeraldplatform/ui-icons';
import {Warning, WarningText, Input} from '@emeraldplatform/ui';
import IconButton from '@material-ui/core/IconButton';

interface Props {
  password?: string;
  minLength?: number;
  onChange?: any;
  error?: string;
}

interface State {
  showPassword: boolean;
}

export class PasswordInput extends React.Component<Props, State> {
  static DEFAULT_MIN_LENGTH = 8;
  static defaultProps = {
    minLength: PasswordInput.DEFAULT_MIN_LENGTH,
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      showPassword: false,
    };
  }

  onInputChange = (event: any) => {
    const { onChange } = this.props;
    if (onChange) {
      onChange(event.target.value);
    }
  };

  handleEyeClick = () => {
    const {showPassword} = this.state;
    this.setState({
      showPassword: !showPassword,
    });
  };

  renderMinLengthWarning = (minLength: number) => (
    <div style={{marginTop: '10px'}}>
      <Warning>
        <WarningText>Password must be minimum {minLength} characters.</WarningText>
      </Warning>
    </div>
  );

  render() {
    const {error, minLength, password} = this.props;
    const {showPassword} = this.state;
    const iconStyle = {
      color: showPassword ? 'green' : '',
    };

    const EyeIconButton = (
      <IconButton style={iconStyle} onClick={this.handleEyeClick}>
        <EyeIcon/>
      </IconButton>
    );

    const tooShort = password && (password.length < minLength);
    const placeHolderStr = `At least ${minLength} characters`;
    return (
      <div>
        <div>
          <Input
            value={password}
            errorText={error}
            rightIcon={EyeIconButton}
            onChange={this.onInputChange}
            placeholder={placeHolderStr}
            type={showPassword ? 'text' : 'password'}
          />
        </div>
        {tooShort && this.renderMinLengthWarning(minLength)}
      </div>
    );
  }
}

export default PasswordInput;
