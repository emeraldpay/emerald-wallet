import IconButton from '@material-ui/core/IconButton';
import * as React from 'react';
import { ViewVisible as ShowPasswordIcon } from '../../../icons';
import { Input } from '../Input';

interface OwnProps {
  disabled?: boolean;
  error?: string;
  minLength?: number;
  placeholder?: string;
  showLengthNotice?: boolean;
  onChange(password: string): void;
  onPressEnter?(): void;
}

const PasswordInput: React.FC<OwnProps> = ({
  disabled,
  error,
  placeholder,
  minLength = 8,
  showLengthNotice = true,
  onChange,
  onPressEnter,
}) => {
  const [password, setPassword] = React.useState<string>();
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

  return (
    <Input
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
