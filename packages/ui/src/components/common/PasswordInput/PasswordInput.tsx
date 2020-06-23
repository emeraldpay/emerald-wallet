import {Input} from '@emeraldplatform/ui';
import {ViewVisible as EyeIcon} from '@emeraldplatform/ui-icons';
import IconButton from '@material-ui/core/IconButton';
import * as React from 'react';
import {createStyles, Paper, TextField} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";

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
}

const defaults: Partial<OwnProps> = {
  password: "",
  minLength: 8
}

/**
 *
 */
const PasswordInput = ((props: OwnProps) => {
  props = {...defaults, ...props};
  const styles = useStyles();

  const {error, password} = props;
  const minLength = props.minLength | defaults.minLength
  const [showPassword, setShowPassword] = React.useState(false);
  const [current, setCurrent] = React.useState(password);

  const iconStyle = {
    color: showPassword ? 'green' : ''
  };

  const EyeIconButton = (
    <IconButton style={iconStyle} onClick={() => setShowPassword(!showPassword)}>
      <EyeIcon/>
    </IconButton>
  );

  const tooShort = password && (password.length < minLength);
  const placeHolderStr = `At least ${minLength} characters`;
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
