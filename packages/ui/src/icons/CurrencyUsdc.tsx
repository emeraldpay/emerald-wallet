import SvgIcon, { SvgIconProps } from '@mui/material/SvgIcon';
import * as React from 'react';

const CurrencyUsdc: React.ComponentType<SvgIconProps> = (props) => (
  <SvgIcon fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 64 64" {...props}>
    <circle cx="32" cy="32" r="24" />
    <path d="M28 47.5a16 16 0 0 1 0-31" />
    <path d="M36 16.5a16 16 0 0 1 0 31" />
    <path d="M30 32a4 4 0 0 1 0-8" />
    <path d="M34 32a4 4 0 0 1 0 8" />
    <path d="M32 20v4" />
    <path d="M32 40v4" />
    <path d="M30 32h4" />
    <path d="M38 26s-2-2-4-2h-4" />
    <path d="M26 38s2 2 4 2h4" />
  </SvgIcon>
);

export default CurrencyUsdc;
