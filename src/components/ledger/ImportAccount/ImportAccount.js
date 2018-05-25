// @flow
import React from 'react';
import muiThemeable from 'material-ui/styles/muiThemeable';
import { Button, ButtonGroup } from 'emerald-js-ui';
import { AddCircle as AddIcon } from 'emerald-js-ui/lib/icons3';
import DashboardButton from 'components/common/DashboardButton';
import HDPath from 'components/common/HdPath';
import { Form, Row, styles as formStyles } from 'elements/Form';
import AddrList from './addrlist';
import Pager from './pager';

import styles from './ImportAccount.scss';

type Props = {
  onInit: Function,
  onBackScreen: ?Function,
  hdbase: string,
}

class ImportAccount extends React.Component<Props> {
  componentDidMount() {
    if (this.props.onInit) {
      this.props.onInit();
    }
  }

  render() {
    const { hdbase, changeBaseHD, muiTheme, selected } = this.props;
    const { onAddSelected, onCancel, onDashboard } = this.props;
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

export default muiThemeable()(ImportAccount);
