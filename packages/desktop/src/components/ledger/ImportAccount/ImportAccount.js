// @flow
import React from 'react';
import withStyles from 'react-jss';
import muiThemeable from 'material-ui/styles/muiThemeable';
import { Page, ButtonGroup } from '@emeraldplatform/ui';
import { AddCircle as AddIcon, Back } from '@emeraldplatform/ui-icons';
import HDPath from 'components/common/HdPath';
import { Row, styles as formStyles } from 'elements/Form';
import { Button } from '@emeraldwallet/ui';
import AddrList from './AddrList';
import Pager from './Pager';

const styles2 = {
  row: {
    marginLeft: '14.75px',
    marginRight: '14.75px',
  },
};

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
    const {
      hdbase, changeBaseHD, muiTheme, selected,
    } = this.props;
    const { onAddSelected, onCancel, onDashboard } = this.props;
    const { classes } = this.props;
    return (
      <Page title="Import Ledger hardware account" leftIcon={<Back onClick={onDashboard} />}>
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
          <div className={classes.row}><AddrList /></div>
        </Row>
        <Row>
          <div className={classes.row}>
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
      </Page>
    );
  }
}

export default muiThemeable()(withStyles(styles2)(ImportAccount));
