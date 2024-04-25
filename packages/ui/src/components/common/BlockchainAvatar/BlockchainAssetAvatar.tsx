import { BlockchainCode } from '@emeraldwallet/core';
import * as React from 'react';
import BlockchainAvatar from './BlockchainAvatar';

interface OwnProps {
  asset: string;
  className?: string;
  size?: 'small' | 'large' | 'default';
}

const BlockchainAssetAvatar: React.FC<OwnProps> = ({ asset, ...props }) => {
  let blockchain: BlockchainCode;

  switch (asset) {
    // Mainnet
    case 'BTC':
      blockchain = BlockchainCode.BTC;
      break;
    case 'ETC':
      blockchain = BlockchainCode.ETC;
      break;
    case 'ETH':
      blockchain = BlockchainCode.ETH;
      break;
    // Testnet
    case 'SEPOLIA':
      blockchain = BlockchainCode.Sepolia;
      break;
    case 'TESTBTC':
      blockchain = BlockchainCode.TestBTC;
      break;
    // Other
    default:
      blockchain = BlockchainCode.Unknown;
  }

  return <BlockchainAvatar blockchain={blockchain} {...props}></BlockchainAvatar>;
};

export default BlockchainAssetAvatar;
