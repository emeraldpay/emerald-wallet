import {Input} from '@emeraldplatform/ui';
import {ViewVisible as EyeIcon} from '@emeraldplatform/ui-icons';
import IconButton from '@material-ui/core/IconButton';
import * as React from 'react';
import {createStyles} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import {WithDefaults} from "@emeraldwallet/core";

const useStyles = makeStyles(
  createStyles({})
);

// Component properties
interface OwnProps {
  password?: string;
  minLength?: number;
  onChange?: (password: string) => void;
  error?: string;
  disabled?: boolean;
  showPlaceholder?: boolean;
}

const defaults: Partial<OwnProps> = {
  password: "",
  minLength: 8,
  showPlaceholder: true,
}

/**
 *
 */
const PasswordInput = ((props: OwnProps) => {
  const styles = useStyles();
  props = WithDefaults(props, defaults);
  const {minLength, showPlaceholder} = props;
  const {error, password} = props;
  const [showPassword, setShowPassword] = React.useState(false);
  const [current, setCurrent] = React.useState(password);

  const iconStyle = {
    color: showPassword ? 'green' : ''
  };

  const EyeIconButton = (
    <IconButton tabIndex={-1} style={iconStyle} onClick={() => setShowPassword(!showPassword)}>
      <EyeIcon/>
    </IconButton>
  );

  const tooShort = password && (password.length < minLength);
  const placeHolderStr = showPlaceholder ? `At least ${minLength} characters` : '';
  const errorText = (tooShort && `Password must be minimum ${minLength} characters.`) || error;

  const onChange = (e) => {
    const value: string = e.target.value || "";
    setCurrent(value);
    if (value.length >= minLength) {
      props.onChange(value);
    } else {
      props.onChange("");
    }
  }

  return (
    <Input
      disabled={props.disabled}
      value={current}
      errorText={errorText}
      rightIcon={EyeIconButton}
      onChange={onChange}
      placeholder={placeHolderStr}
      type={showPassword ? 'text' : 'password'}
    />
  );
})

export default PasswordInput;
