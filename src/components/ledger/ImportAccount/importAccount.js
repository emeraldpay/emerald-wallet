// @flow
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import muiThemeable from 'material-ui/styles/muiThemeable';
import DashboardButton from 'components/common/DashboardButton';
import { Form, styles as formStyles, Row } from 'elements/Form';
import ledger from 'store/ledger';
import screen from 'store/wallet/screen';
import HDPath from 'components/common/HdPath';
import AddrList from './addrlist';
import Pager from './pager';
import WaitDialog from '../WaitDialog';
import Buttons from './buttons';

import styles from './importAccount.scss';

type Props = {
  init: Function,
  onBackScreen: ?Function,
  connected: boolean,
  hdbase: string,
}

class ImportAccount extends React.Component<Props> {
  componentDidMount() {
    if (this.props.init) {
      this.props.init();
    }
  }

  render() {
    const { connected, hdbase, changeBaseHD, onBackScreen, onDashboard, muiTheme } = this.props;
    if (!connected) {
      return (<WaitDialog />);
    }
    return (
      <Form caption="Import Ledger hardware account" backButton={<DashboardButton onClick={onDashboard} />} style={{border: `1px solid ${muiTheme.palette.borderColor}`}}>
        <Row>
          <div style={formStyles.left}>
            <div style={formStyles.fieldName}>HD derivation path</div>
          </div>
          <div style={formStyles.right}>
            <HDPath value={hdbase} onChange={changeBaseHD} />
            <div style={{ marginLeft: '5px' }}><Pager /></div>
          </div>
        </Row>
        <Row>
          <div className={styles.row}><AddrList /></div>
        </Row>
        <Row>
          <div className={styles.row}><Buttons onBackScreen={onBackScreen} /></div>
        </Row>
      </Form>
    );
  }
}

export default connect(
  (state, ownProps) => ({
    hdbase: state.ledger.getIn(['hd', 'base']),
    connected: state.ledger.get('connected'),
  }),
  (dispatch, ownProps) => ({
    changeBaseHD: (hdpath: string) => {
      dispatch(ledger.actions.setBaseHD(hdpath));
      dispatch(ledger.actions.getAddresses());
    },
    init: () => dispatch(ledger.actions.getAddresses()),
    onDashboard: () => {
      if (ownProps.onBackScreen) {
        return dispatch(screen.actions.gotoScreen(ownProps.onBackScreen));
      }
      dispatch(screen.actions.gotoScreen('home'));
    },
  })
)(muiThemeable()(ImportAccount));
