import * as React from 'react';
import {ViewVisible as EyeIcon} from '@emeraldplatform/ui-icons';
import {Input} from '@emeraldplatform/ui';
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

  private handleInputChange = (event: any) => {
    const { onChange } = this.props;
    onChange && onChange(event.target.value);
  };

  private handleEyeClick = () => {
    const {showPassword} = this.state;
    this.setState({
      showPassword: !showPassword,
    });
  };

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
    const errorText = (tooShort && `Password must be minimum ${minLength} characters.` ) || error;
    return (
        <div>
          <Input
            value={password}
            errorText={errorText}
            rightIcon={EyeIconButton}
            onChange={this.handleInputChange}
            placeholder={placeHolderStr}
            type={showPassword ? 'text' : 'password'}
          />
        </div>
    );
  }

}

export default PasswordInput;
