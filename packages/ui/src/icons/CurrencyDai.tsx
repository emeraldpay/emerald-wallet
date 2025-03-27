import SvgIcon, { SvgIconProps } from '@mui/material/SvgIcon';
import * as React from 'react';

const CurrencyDai: React.ComponentType<SvgIconProps> = (props) => (
  <SvgIcon fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 64 64" {...props}>
    <path d="M8 28h48M8 36h48M16 52h12a20 20 0 0 0 0-40H16z" />
  </SvgIcon>
);

export default CurrencyDai;
