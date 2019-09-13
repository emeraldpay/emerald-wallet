import { connect } from 'react-redux';
import { ConnectionStatus } from '@emeraldwallet/ui';
import { connection } from '@emeraldwallet/store';

export default connect(
  (state, ownProps) => {
    return {
      status: connection.selectors.getStatus(state),
    };
  }
)(ConnectionStatus);
