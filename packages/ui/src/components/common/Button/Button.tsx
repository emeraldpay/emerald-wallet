import { Button as BaseButton, ButtonProps } from '@material-ui/core';
import { createStyles, makeStyles, withStyles } from '@material-ui/core/styles';
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

const StyledButton = withStyles(styles)(BaseButton);

const useStyles = makeStyles(
  createStyles({
    icon: {
      display: 'inline-flex',
      marginRight: 5,
    },
  }),
);

interface OwnProps extends Omit<ButtonProps, 'children'> {
  children?: never;
  icon?: React.ReactNode;
  label?: string;
  primary?: boolean;
}

const Button: React.FC<OwnProps> = ({ icon, label, primary = false, variant = 'contained', ...props }) => {
  const styles = useStyles();

  return (
    <StyledButton color={primary === false ? 'secondary' : 'primary'} variant={variant} {...props}>
      {icon == null ? null : label == null ? icon : <div className={styles.icon}>{icon}</div>}
      {label}
    </StyledButton>
  );
};

export default Button;
