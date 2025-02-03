import * as React from 'react';

interface ILogoProps {
  height?: string;
  width?: string;
}

const Logo = (props: ILogoProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={props.width || '64'} height={props.height || '64'} viewBox="0 0 320 480" fill="none" >
    <path d="M0 320L160 480L320 320L0 160V320Z" fill="#32D486"/>
    <path d="M160 0L0 80L320 320V80L160 0Z" fill="#32D486"/>
  </svg>
);

export default Logo;
