import { IState, connection } from '@emeraldwallet/store';
import { ConnectionStateProps, ConnectionStatus } from '@emeraldwallet/ui';
import { connect } from 'react-redux';

export default connect<ConnectionStateProps, unknown, unknown, IState>((state) => ({
  status: connection.selectors.getStatus(state),
}))(ConnectionStatus);
