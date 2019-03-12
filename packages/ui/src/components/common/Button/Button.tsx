import * as React from 'react';
import Button from '@material-ui/core/Button';

interface Props {
  style?: any;
  primary?: any;
  onClick?: any;
  label?: string;
  icon?: any;
  href?: string;
  variant?: any;
  target?: any;
  rel?: any;
}

const Btn = (props: Props) => {
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

export default Btn;
