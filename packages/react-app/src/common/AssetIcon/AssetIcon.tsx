import { BlockchainCode, EthereumAddress, TokenRegistry } from '@emeraldwallet/core';
import { IState } from '@emeraldwallet/store';
import { BlockchainAssetAvatar } from '@emeraldwallet/ui';
import { createStyles, makeStyles } from '@material-ui/core';
import classNames from 'classnames';
import * as React from 'react';
import { connect } from 'react-redux';

const useStyles = makeStyles((theme) =>
  createStyles({
    image: {
      maxWidth: '100%',
    },
    defaultSize: {
      width: theme.spacing(4),
      height: theme.spacing(4),
    },
    smallSize: {
      width: theme.spacing(3),
      height: theme.spacing(3),
    },
    largeSize: {
      width: theme.spacing(8),
      height: theme.spacing(8),
    },
  }),
);

interface OwnProps {
  asset: string;
  blockchain?: BlockchainCode;
  className?: string;
  size?: 'small' | 'large' | 'default';
}

interface StateProps {
  tokenRegistry: TokenRegistry;
}

const AssetIcon: React.FC<OwnProps & StateProps> = ({
  asset,
  blockchain,
  className,
  tokenRegistry,
  size = 'default',
}) => {
  const styles = useStyles();

  if (blockchain != null && EthereumAddress.isValid(asset) && tokenRegistry.hasAddress(blockchain, asset)) {
    const { icon, name } = tokenRegistry.byAddress(blockchain, asset);

    if (icon != null) {
      return <img className={classNames(styles.image, styles[`${size}Size`])} alt={name} src={icon} />;
    }
  }

  return <BlockchainAssetAvatar asset={asset} className={className} size={size} />;
};

export default connect<StateProps, unknown, unknown, IState>(({ application: { tokens } }) => ({
  tokenRegistry: new TokenRegistry(tokens),
}))(AssetIcon);
