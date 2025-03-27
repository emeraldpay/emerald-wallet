import { Button as ButtonBase, ButtonProps } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import * as React from 'react';

const useStyles = makeStyles()({
  root: {
    height: 38,
  },
  label: {
    fontSize: 15,
    fontFamily: 'inherit',
    fontWeight: 500,
  },
});

interface OwnProps extends Omit<ButtonProps, 'children'> {
  children?: never;
  icon?: React.ReactNode;
  label?: string;
  primary?: boolean;
}

const Button: React.FC<OwnProps> = ({ icon, label, primary = false, variant = 'contained', ...props }) => {
  const { classes } = useStyles();

  return (
    <ButtonBase
      {...props}
      classes={{
        root: classes.root,
        text: classes.label
      }}
      color={primary === false ? 'secondary' : 'primary'}
      startIcon={icon == null || label == null ? null : icon}
      variant={variant}
    >
      {label == null ? icon : label}
    </ButtonBase>
  );
};

export default Button;
