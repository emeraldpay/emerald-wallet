import { Contract } from '@emeraldplatform/contracts';
import { abi as TokenAbi } from '@emeraldwallet/erc20';

export const tokenContract = new Contract(TokenAbi);
