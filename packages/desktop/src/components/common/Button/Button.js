import React from 'react';
import Button from '@material-ui/core/Button';

const Btn = (props) => {
  const {
    primary, onClick, label, icon, href, variant, ...restProps
  } = props;
  const style = {
    fontSize: '15px',
    fontWeight: '500',
    // lineHeight: '18px',
    height: '40px',
    fontFamily: 'inherit',
    ...props.style,
  };
  return (
      <Button
        color={primary ? 'primary' : 'secondary'}
        href={href}
        variant={variant || 'contained'}
        style={style}
        onClick={onClick}
        {...restProps}
      >
        {icon}
        {label}
      </Button>
  );
};

const ThemedButton = Btn;

export default ThemedButton;
