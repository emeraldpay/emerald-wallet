import React from 'react';
import PropTypes from 'prop-types';
import Button from 'elements/Button';
import { Form, Row, styles as formStyles } from 'elements/Form';
import { Warning, WarningHeader, WarningText } from 'elements/Warning/warning';
import PasswordInput from 'elements/PasswordInput';
import DashboardButton from 'components/common/DashboardButton';
import Advice from './advice';
import styles from './passwordDialog.scss';
import getLoadingIcon from '../getLoadingIcon';

const MIN_PASSWORD_LENGTH = 8;

class PasswordDialog extends React.Component {
  static propTypes = {
    onGenerate: PropTypes.func,
  }

  constructor(props) {
    super(props);
    this.state = {
      passphrase: '',
      passphraseError: null,
    };
  }

  handleGenerate = () => {
    const { onGenerate } = this.props;
    const passphrase = this.state.passphrase;

    // validate passphrase
    if (passphrase.length < MIN_PASSWORD_LENGTH) {
      this.setState({
        passphraseError: `Minimum ${MIN_PASSWORD_LENGTH} characters`,
      });
    } else {
      onGenerate(passphrase);
    }
  }

  onPassphraseChange = (newValue) => {
    const passphraseError = (newValue.length === 0 || newValue.length >= MIN_PASSWORD_LENGTH) ?
      null :
      this.state.passphraseError;

    this.setState({
      passphrase: newValue,
      passphraseError,
    });
  }


  render() {
    const { onDashboard, t, backLabel } = this.props;
    const { passphraseError } = this.state;

    return (
      <Form caption={ t('generate.title') } backButton={ <DashboardButton onClick={ onDashboard } label={backLabel}/> }>
        <Row>
          <div style={ formStyles.left }/>
          <div style={ formStyles.right }>
            <div style={{ width: '100%' }}>
              <div className={ styles.passwordLabel }>Enter a strong password</div>
              <div className={ styles.passwordSubLabel }>
                        This password will be required to confirm all account operations.
              </div>
              <div style={{ marginTop: '30px' }}>
                <PasswordInput
                  onChange={ this.onPassphraseChange }
                  error={ passphraseError }
                />
              </div>
            </div>
          </div>
        </Row>

        <Row>
          <div style={ formStyles.left }/>
          <div style={ formStyles.right }>
            <Warning fullWidth={ true }>
              <WarningHeader>Don&#39;t forget it.</WarningHeader>
              <WarningText>If you forget password, you will lose your account with all
                            funds.</WarningText>
            </Warning>
          </div>
        </Row>

        <Row>
          <div style={formStyles.left}/>
          <div style={formStyles.right}>
            <Advice
              title="Advice"
              text={ <div>You can use a word or phrase as password. Write it in short text.<br/>
                        Only you know where password is. It is safer than write a password only.
              </div>}
            />
          </div>
        </Row>

        <Row>
          <div style={formStyles.left}/>
          <div style={formStyles.right}>
            <Button
              primary onClick={ this.handleGenerate }
              label="Generate Account"
              icon={ getLoadingIcon(this.props) }
              disabled={ this.props.loading }
            />
          </div>
        </Row>
      </Form>
    );
  }
}


export default PasswordDialog;

