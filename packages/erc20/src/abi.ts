/** Abbreviated ABI for ERC20-compatible tokens * */
const TokenAbi = [
  {
    name: 'approve',
    inputs: [
      { name: '_spender', type: 'address' },
      { name: '_amount', type: 'uint256' },
    ],
    outputs: [{ name: 'success', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    name: 'totalSupply',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    name: 'transferFrom',
    inputs: [
      { name: '_from', type: 'address' },
      { name: '_to', type: 'address' },
      { name: '_value', type: 'uint256' },
    ],
    outputs: [{ name: 'success', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    name: 'balanceOf',
    inputs: [{ name: '_owner', type: 'address' }],
    outputs: [{ name: 'balance', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    name: 'transfer',
    inputs: [
      { name: '_to', type: 'address' },
      { name: '_value', type: 'uint256' },
    ],
    outputs: [{ name: 'success', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    name: 'symbol',
    inputs: [],
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    name: 'name',
    inputs: [],
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    name: 'decimals',
    inputs: [],
    outputs: [{ name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function',
  },
];

export const WrapTokenAbi = [
  ...TokenAbi,
  {
    name: 'deposit',
    inputs: [],
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    name: 'withdraw',
    inputs: [{ name: '_value', type: 'uint256' }],
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];

export default TokenAbi;
