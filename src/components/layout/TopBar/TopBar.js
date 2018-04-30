import React from 'react';
import { connect } from 'react-redux';
import { Button } from 'emerald-js-ui';
import { Add as AddIcon } from 'emerald-js-ui/lib/icons3';
import Screen from '../../../store/wallet/screen';

import styles from './TopBar.scss';

/**
 * First dumb implementation of TopBar
 */
export class TopBar extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { onAccounts, onNewContact } = this.props;
    return (
      <div className={styles.container}>
        <div>
          <Button
            label="ACCOUNTS"
            onClick={onAccounts}
          />
        </div>
        <div>
          <Button
            label="NEW CONTACT"
            icon={<AddIcon />}
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

export default connect(null, mapDispatchToProps)(TopBar);

