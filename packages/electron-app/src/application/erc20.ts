import {abi as TokenAbi} from '@emeraldwallet/erc20';
import {Contract} from "@emeraldwallet/core";

export const tokenContract = new Contract(TokenAbi);
