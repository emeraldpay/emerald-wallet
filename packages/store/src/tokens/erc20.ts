import {Contract} from '@emeraldwallet/core';
import {abi as TokenAbi, wrapAbi as WrapTokenAbi} from '@emeraldwallet/erc20';

export const tokenContract = new Contract(TokenAbi);
export const wrapTokenContract = new Contract(WrapTokenAbi);
