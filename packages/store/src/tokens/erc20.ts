import { Contract, tokenAbi, wrapTokenAbi } from '@emeraldwallet/core';

export const tokenContract = new Contract(tokenAbi);
export const wrapTokenContract = new Contract(wrapTokenAbi);
