import React from 'react';
import withStyles from 'react-jss';
import { connect } from 'react-redux';
import muiThemeable from 'material-ui/styles/muiThemeable';
import Button from 'elements/Button';
import { Add as AddIcon } from 'emerald-js-ui/lib/icons3';
import Screen from '../../../store/wallet/screen';

export const styles2 = {
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
    const {
      onAccounts, onNewContact, muiTheme, classes,
    } = this.props;
    return (
      <div className={classes.container}>
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

const StyledTopBar = withStyles(styles2)(TopBar);

const mapDispatchToProps = (dispatch) => ({
  onAccounts: () => dispatch(Screen.actions.gotoScreen('home')),
  onNewContact: () => dispatch(Screen.actions.gotoScreen('add-address')),
});

export default muiThemeable()(connect(null, mapDispatchToProps)(StyledTopBar));
