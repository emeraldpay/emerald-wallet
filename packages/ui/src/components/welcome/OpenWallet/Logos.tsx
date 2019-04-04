import * as React from 'react';

interface Props {
  size: number;
}
export const ETH = ({size} : Props) => (
  <svg width={size} height={size} viewBox="0 0 256 417" xmlns="http://www.w3.org/2000/svg"
       preserveAspectRatio="xMidYMid">
    <path fill="#343434" d="M127.961 0l-2.795 9.5v275.668l2.795 2.79 127.962-75.638z"/>
    <path fill="#8C8C8C" d="M127.962 0L0 212.32l127.962 75.639V154.158z"/>
    <path fill="#3C3C3B" d="M127.961 312.187l-1.575 1.92v98.199l1.575 4.6L256 236.587z"/>
    <path fill="#8C8C8C" d="M127.962 416.905v-104.72L0 236.585z"/>
    <path fill="#141414" d="M127.961 287.958l127.96-75.637-127.96-58.162z"/>
    <path fill="#393939" d="M0 212.32l127.96 75.638v-133.8z"/>
  </svg>
);

export const ETC = ({size} : Props) => (
  <svg version="1.1"
     viewBox="0 4 64 60" enableBackground="new 0 0 64 64" width={size}>
    <g>
      <polygon fill="#00C853" points="16,28 32,4 48,28 32,20 	"/>
      <polygon fill="#00C853" points="48,36 32,60 16,36 32,44 	"/>
      <polygon fill="#00C853" points="32,40 16,32 32,24 48,32 	"/>
    </g>
    <polygon opacity="0.2" points="32,40 16,32 32,24 48,32 "/>
    <polygon opacity="0.4" points="48,36 32,60 16,36 32,44 "/>
  </svg>
);
