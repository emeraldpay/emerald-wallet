import { connection } from '@emeraldwallet/store';
import { ConnectionStatus } from '@emeraldwallet/ui';
import { connect } from 'react-redux';

export default connect(
  (state, ownProps) => {
    return {
      status: connection.selectors.getStatus(state)
    };
  }
)(ConnectionStatus);
