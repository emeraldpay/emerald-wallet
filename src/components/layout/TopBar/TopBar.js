import React from 'react';
import { connect } from 'react-redux';
import muiThemeable from 'material-ui/styles/muiThemeable';
import { Button } from 'emerald-js-ui';
import { Add as AddIcon } from 'emerald-js-ui/lib/icons3';
import Screen from '../../../store/wallet/screen';

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
};

/**
 * First dumb implementation of TopBar
 */
export class TopBar extends React.Component {
  render() {
    const { onAccounts, onNewContact, muiTheme } = this.props;
    return (
      <div style={styles.container}>
        <div>
          <Button
            label="ACCOUNTS"
            onClick={onAccounts}
          />
        </div>
        <div>
          <Button
            label="NEW CONTACT"
            icon={<AddIcon style={{color: muiTheme.palette.alternateTextColor}} />}
            onClick={onNewContact}
          />
        </div>
      </div>
    );
  }
}

const mapDispatchToProps = (dispatch) => ({
  onAccounts: () => dispatch(Screen.actions.gotoScreen('home')),
  onNewContact: () => dispatch(Screen.actions.gotoScreen('add-address')),
});

export default muiThemeable()(connect(null, mapDispatchToProps)(TopBar));
