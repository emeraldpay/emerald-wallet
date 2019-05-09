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
  disabled?: boolean;
  classes?: any;
}

const Btn = (props: Props) => {
  const {
    primary, onClick, label, icon, href, variant, disabled, ...restProps
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
      // size='medium'
      disabled={disabled}
      color={primary ? 'primary' : 'secondary'}
      // href={href}
      variant={variant || 'contained'}
      // style={style}
      onClick={onClick}
      {...restProps}
    >
      {icon}
      {label}
    </Button>
  );
};

export default Btn;
