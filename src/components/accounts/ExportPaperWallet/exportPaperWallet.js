import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Field, reduxForm } from 'redux-form';
import { Button, Page } from 'emerald-js-ui';
import { Back } from 'emerald-js-ui/lib/icons3';
import { Row, styles as formStyles } from '../../../elements/Form';
import TextField from '../../../elements/Form/TextField';
import screen from '../../../store/wallet/screen';
import accounts from '../../../store/vault/accounts';

const styles = {
  passwordLabel: {
   height: '24px',
    width: '190px',
    color: '#191919',
    fontSize: '16px',
    fontWeight: '500',
    lineHeight: '24px',
  },
  passwordSubLabel: {
    height: '22px',
    width: '320px',
    color: '#191919',
    fontSize: '14px',
    lineHeight: '22px',
  },
};

class ExportPaperWallet extends React.Component {
  static propTypes = {
    accountId: PropTypes.string,
    onBack: PropTypes.func,
    handleSubmit: PropTypes.func,
  };

  render() {
    const { accountId, onBack, handleSubmit } = this.props;

    return (
      <Page title="Print Paper Wallet" leftIcon={<Back onClick={onBack}/> } >
        <Row>
          <div style={formStyles.left}/>
          <div style={formStyles.right}>
            { accountId }
          </div>
        </Row>
        <Row>
          <div style={formStyles.left}>
          </div>
          <div style={formStyles.right}>
            <div style={{ width: '100%' }}>
              <div style={styles.passwordLabel}>Enter a password</div>
              <div style={styles.passwordSubLabel}>
                Password needs for confirm all wallet operations.</div>
              <div style={{ marginTop: '30px' }}>
                <Field
                  name="password"
                  type="password"
                  component={ TextField }
                  fullWidth={ true }
                  underlineShow={ false }
                />
              </div>
            </div>
          </div>
        </Row>
        <Row>
          <div style={formStyles.left}/>
          <div style={formStyles.right}>
            <Button primary label="EXPORT" onClick={ handleSubmit } />
          </div>
        </Row>
      </Page>
    );
  }
}


const exportForm = reduxForm({
  form: 'exportPaperWallet',
  fields: ['password'],
})(ExportPaperWallet);

export default connect(
  (state, ownProps) => ({
  }),
  (dispatch, ownProps) => ({
    onSubmit: (data) => {
      const address = ownProps.accountId;
      dispatch(accounts.actions.exportPrivateKey(data.password, address))
        .then((privKey) => {
          return dispatch(screen.actions.gotoScreen('paper-wallet', { address, privKey }));
        })
        .catch((err) => dispatch(screen.actions.showError(err)));
    },
    onBack: () => {
      dispatch(screen.actions.gotoScreen('home'));
    },

  }))(exportForm);
