import { PageTitle } from '@emeraldplatform/ui/lib/components/Page';
import { BlockchainCode } from '@emeraldwallet/core';
import { CoinAvatar } from '@emeraldwallet/ui';
import * as React from 'react';

export interface IChainTitle {
  text?: string;
  chain: BlockchainCode;
}

/**
 * @deprecated
 * @param props
 * @constructor
 */
function ChainTitle (props: IChainTitle) {
  const { chain, text } = props;
  const title = text || '';
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <div style={{ paddingRight: '10px' }} ><CoinAvatar chain={chain}/></div>
      <PageTitle>{title}</PageTitle>
    </div>
  );
}

export default ChainTitle;
