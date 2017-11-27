/** Abbreviated ABI for ERC20-compatible tokens **/
export const TokenAbi = [
  {
    name: 'approve',
    inputs: [
      {name: '_spender', type: 'address'},
      {name: '_amount', type: 'uint256'},
    ],
    outputs: [{name: 'success', type: 'bool'}],
  },
  {
    name: 'totalSupply',
    inputs: [],
    outputs: [{name: '', type: 'uint256'}],
  },
  {
    name: 'divisor',
    inputs: [],
    outputs: [{name: 'divisor', type: 'uint256'}],
  },
  {
    name: 'transferFrom',
    inputs: [
      {name: '_from', type: 'address'},
      {name: '_to', type: 'address'},
      {name: '_value', type: 'uint256'},
    ],
    outputs: [{name: 'success', type: 'bool'}],
  },
  {
    name: 'balanceOf',
    inputs: [{name: '_owner', type: 'address'}],
    outputs: [{name: 'balance', type: 'uint256'}],
  },
  {
    name: 'transfer',
    inputs: [
      {name: '_to', type: 'address'},
      {name: '_value', type: 'uint256'},
    ],
    outputs: [{name: 'success', type: 'bool'}],
  },
  {
    name: 'symbol',
    inputs: [],
    outputs: [{name: '', type: 'string'}],
  },
  {
    name: 'name',
    inputs: [],
    outputs: [{name: '', type: 'string'}],
  },
  {
    name: 'decimals',
    inputs: [],
    outputs: [{name: '', type: 'uint8'}],
  },
];
