import React from 'react';
import { connect } from 'react-redux';
import { SyncWarning } from '@emeraldplatform/ui';

class SyncWarningContainer extends React.Component {
  render() {
    const { currentBlock, highestBlock } = this.props;
    if (currentBlock && highestBlock && (highestBlock - currentBlock >= 20)) {
      return (<SyncWarning {...this.props} />);
    }
    return null;
  }
}

export default connect(
  (state, ownProps) => {
    const currentBlock = state.network.getIn(['currentBlock', 'height'])
            || state.network.getIn(['sync', 'currentBlock']);
    const highestBlock = state.network.getIn(['sync', 'highestBlock']);
    const startingBlock = state.network.getIn(['sync', 'startingBlock']);
    return {
      currentBlock,
      highestBlock,
      startingBlock,
    };
  }
)(SyncWarningContainer);
