import { Button as ButtonBase, ButtonProps } from '@material-ui/core';
import { createStyles, withStyles } from '@material-ui/core/styles';
import * as React from 'react';

const styles = createStyles({
  root: {
    height: 38,
  },
  label: {
    fontSize: 15,
    fontFamily: 'inherit',
    fontWeight: 500,
  },
});

const StyledButton = withStyles(styles)(ButtonBase);

interface OwnProps extends Omit<ButtonProps, 'children'> {
  children?: never;
  icon?: React.ReactNode;
  label?: string;
  primary?: boolean;
}

const Button: React.FC<OwnProps> = ({ icon, label, primary = false, variant = 'contained', ...props }) => (
  <StyledButton
    {...props}
    color={primary === false ? 'secondary' : 'primary'}
    startIcon={icon == null || label == null ? null : icon}
    variant={variant}
  >
    {label == null ? icon : label}
  </StyledButton>
);

export default Button;
