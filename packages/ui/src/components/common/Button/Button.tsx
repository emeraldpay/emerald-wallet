import Button from '@material-ui/core/Button';
import { createStyles, withStyles } from '@material-ui/core/styles';
import * as React from 'react';

interface IBtnProps {
  style?: any;
  primary?: any;
  onClick?: any;
  label?: string;
  icon?: any;
  href?: string;
  variant?: any;
  target?: any;
  rel?: any;
  disabled?: boolean;
  classes?: any;
}

const styles = createStyles({
  root: {
    height: 38
  },
  label: {
    fontSize: '15px',
    fontWeight: 500,
    fontFamily: 'inherit'
  }
});

const StyledButton = withStyles(styles)(Button);

const Btn = (props: IBtnProps) => {
  const {
    primary, onClick, label, icon, href, variant, disabled, ...restProps
  } = props;
  return (
    <StyledButton
      disabled={disabled}
      color={primary ? 'primary' : 'secondary'}
      // href={href}
      variant={variant || 'contained'}
      onClick={onClick}
      {...restProps}
    >
      {icon}
      {label}
    </StyledButton>
  );
};

export default Btn;
