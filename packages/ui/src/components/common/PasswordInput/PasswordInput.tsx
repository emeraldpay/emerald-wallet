import IconButton from '@material-ui/core/IconButton';
import * as React from 'react';
import { ViewVisible as ShowPasswordIcon } from '../../../icons';
import { Input } from '../Input';

interface OwnProps {
  autoFocus?: boolean;
  disabled?: boolean;
  error?: string;
  initialValue?: string;
  minLength?: number;
  placeholder?: string;
  showLengthNotice?: boolean;
  clearPassword?(callback: () => void): void;
  onChange(password: string): void;
  onPressEnter?(): void;
}

const PasswordInput: React.FC<OwnProps> = ({
  autoFocus,
  disabled,
  error,
  initialValue,
  placeholder,
  minLength = 8,
  showLengthNotice = true,
  clearPassword,
  onChange,
  onPressEnter,
}) => {
  const [password, setPassword] = React.useState(initialValue);
  const [showPassword, setShowPassword] = React.useState(false);

  const onPasswordChange = ({ target: { value } }: React.ChangeEvent<HTMLInputElement>): void => {
    setPassword(value);

    onChange(value.length < minLength ? '' : value);
  };

  const showPasswordIcon = (
    <IconButton
      color={showPassword ? 'primary' : undefined}
      size="small"
      tabIndex={-1}
      onClick={() => setShowPassword(!showPassword)}
    >
      <ShowPasswordIcon fontSize="small" />
    </IconButton>
  );

  React.useEffect(() => {
    clearPassword?.(() => setPassword(undefined));
  }, [clearPassword]);

  return (
    <Input
      autoFocus={autoFocus}
      disabled={disabled}
      errorText={
        error ??
        (password != null && password.length < minLength
          ? `Password must be minimum ${minLength} characters`
          : undefined)
      }
      placeholder={placeholder ?? (showLengthNotice ? `At least ${minLength} characters` : undefined)}
      rightIcon={showPasswordIcon}
      type={showPassword ? 'text' : 'password'}
      value={password}
      onChange={onPasswordChange}
      onPressEnter={onPressEnter}
    />
  );
};

export default PasswordInput;
