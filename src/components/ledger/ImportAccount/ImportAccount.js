// @flow
import DashboardButton from 'components/common/DashboardButton';
import HDPath from 'components/common/HdPath';
import { Form, Row, styles as formStyles } from 'elements/Form';
import { Button, ButtonGroup } from 'emerald-js-ui';
import { AddCircle as AddIcon } from 'emerald-js-ui/lib/icons3';
import { fromJS } from 'immutable';
import muiThemeable from 'material-ui/styles/muiThemeable';
import React from 'react';
import { connect } from 'react-redux';
import ledger from 'store/ledger';
import screen from 'store/wallet/screen';
import Accounts from '../../../store/vault/accounts';
import WaitDialog from '../WaitDialog';
import styles from './ImportAccount.scss';
import AddrList from './addrlist';
import Pager from './pager';


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
    const { connected, hdbase, changeBaseHD, muiTheme, selected } = this.props;
    const { onAddSelected, onCancel, onDashboard } = this.props;
    if (!connected) {
      return (<WaitDialog />);
    }
    return (
      <Form
        caption="Import Ledger hardware account"
        backButton={<DashboardButton onClick={onDashboard} />}
        style={{border: `1px solid ${muiTheme.palette.borderColor}`}}
      >
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
          <div className={styles.row}>
            <ButtonGroup>
              <Button
                label="Add Selected"
                disabled={!selected}
                primary={true}
                onClick={onAddSelected}
                icon={<AddIcon />}
              />
              <Button
                label="Cancel"
                onClick={onCancel}
              />
            </ButtonGroup>
          </div>
        </Row>
      </Form>
    );
  }
}

export default connect(
  (state, ownProps) => ({
    hdbase: state.ledger.getIn(['hd', 'base']),
    connected: state.ledger.get('connected'),
    selected: state.ledger.get('selectedAddr') !== null,
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
    onAddSelected: () => {
      let acc = null;
      dispatch(ledger.actions.importSelected())
        .then((address) => {
          acc = fromJS({ id: address });
          return dispatch(Accounts.actions.loadAccountsList());
        })
        .then(() => {
          // go to account details only when accounts updated
          return dispatch(screen.actions.gotoScreen('account', acc));
        });
    },
    onCancel: () => {
      if (ownProps.onBackScreen) {
        return dispatch(screen.actions.gotoScreen(ownProps.onBackScreen));
      }
      dispatch(screen.actions.gotoScreen('home'));
    },
  })
)(muiThemeable()(ImportAccount));
