import IconButton from '@material-ui/core/IconButton';
import * as React from 'react';
import { ViewVisible as EyeIcon } from '../../../icons';
import { Input } from '../Input';

interface OwnProps {
  disabled?: boolean;
  error?: string;
  initialValue?: string;
  minLength?: number;
  showPlaceholder?: boolean;
  onChange?(password: string): void;
  onPressEnter?(): void;
}

const PasswordInput: React.FC<OwnProps> = ({
  disabled,
  error,
  initialValue,
  onChange,
  onPressEnter,
  minLength = 8,
  showPlaceholder = true,
}) => {
  const [password, setPassword] = React.useState(initialValue);
  const [showPassword, setShowPassword] = React.useState(false);

  const onPasswordChange = ({ target: { value } }: React.ChangeEvent<HTMLInputElement>): void => {
    setPassword(value);

    onChange(value.length < minLength ? '' : value);
  };

  const showPasswordIcon = (
    <IconButton
      size="small"
      style={{ color: showPassword ? 'green' : undefined }}
      tabIndex={-1}
      onClick={() => setShowPassword(!showPassword)}
    >
      <EyeIcon fontSize="small" />
    </IconButton>
  );

  return (
    <Input
      disabled={disabled}
      errorText={initialValue?.length < minLength ? `Password must be minimum ${minLength} characters` : error}
      placeholder={showPlaceholder ? `At least ${minLength} characters` : undefined}
      rightIcon={showPasswordIcon}
      type={showPassword ? 'text' : 'password'}
      value={password}
      onChange={onPasswordChange}
      onPressEnter={onPressEnter}
    />
  );
};

export default PasswordInput;
