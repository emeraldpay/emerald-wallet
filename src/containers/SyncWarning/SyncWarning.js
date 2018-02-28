import { connect } from 'react-redux';
import { SyncWarning } from 'emerald-js-ui';


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
)(SyncWarning);
