import * as React from 'react';

interface Props {
  height?: string;
  width?: string;
}

const Logo = (props: Props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={props.width || '64'} height={props.height || '64'} viewBox='0 0 64 64'>
    <path fill="#00c853" d="M32 56L16 32 32 8l16 24-16 24z" />
    <path opacity=".5" d="M38.4 36.8L40 44l8-12-9.6 4.8z" />
    <path opacity=".2" d="M16 32l8 12 1.6-7.2L16 32z" />
    <path opacity=".3" d="M32 40l-6.4-3.2L24 44l8 12 8-12-1.6-7.2L32 40z" />
    <path opacity=".2" d="M32 40l6.4-3.2L36 26l-4-2-4 2-2.4 10.8L32 40z" />
    <path opacity=".4" d="M36 26l2.4 10.8L48 32l-12-6z" />
    <path opacity=".1" d="M28 26l-12 6 9.6 4.8L28 26zM32 24l4 2-4-18-4 18 4-2z" />
    <path opacity=".3" d="M48 32L32 8l4 18 12 6z" />
  </svg>
);


export default Logo;
