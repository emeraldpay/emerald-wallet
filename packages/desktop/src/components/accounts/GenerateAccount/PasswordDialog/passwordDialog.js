import React from 'react';
import withStyles from 'react-jss';
import PropTypes from 'prop-types';
import { Back } from '@emeraldplatform/ui-icons';
import {
  Page, Warning, WarningHeader, WarningText, Input
} from '@emeraldplatform/ui';
import { Button, PasswordInput, Advice } from '@emeraldwallet/ui';
import { required } from 'lib/validators';
import { Row, styles as formStyles } from 'elements/Form';
import LoadingIcon from '../LoadingIcon';

const MIN_PASSWORD_LENGTH = 8;

export const styles2 = {
  passwordLabel: {
    height: '24px',
    width: '190px',
    color: '#191919',
    fontSize: '16px',
    fontWeight: 500,
    lineHeight: '24px',
  },
  passwordSubLabel: {
    height: '22px',
    color: '#191919',
    fontSize: '14px',
    lineHeight: '22px',
  },
};

class PasswordDialog extends React.Component {
  static propTypes = {
    onGenerate: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.state = {
      passphrase: '',
      passphraseError: null,
      confirmError: null,
      confirmPassword: null,
    };
  }

  handleGenerate = () => {
    const { onGenerate } = this.props;
    const { passphrase, confirmPassword } = this.state;

    // validate passphrase
    if (passphrase.length < MIN_PASSWORD_LENGTH) {
      return this.setState({
        passphraseError: `Minimum ${MIN_PASSWORD_LENGTH} characters`,
      });
    }

    if (passphrase !== confirmPassword) {
      return this.setState({
        confirmError: 'Passwords does not match',
      });
    }

    onGenerate(passphrase);
  };

  onPassphraseChange = (newValue) => {
    const passphraseError = (newValue.length === 0 || newValue.length >= MIN_PASSWORD_LENGTH)
      ? null
      : this.state.passphraseError;

    this.setState({
      passphrase: newValue,
      passphraseError,
    });
  };

  onConfirmChange(val) {
    this.setState({
      confirmPassword: val.target.value,
    });
  }

  passwordMatch(value) {
    const password = this.state.passphrase;
    const confirmPassword = value;
    return confirmPassword === password ? undefined : 'Passwords must match';
  }

  render() {
    const { onDashboard, t, classes } = this.props;
    const {
      passphraseError, confirmError, confirmPassword, passphrase,
    } = this.state;

    return (
      <Page title={ t('generate.title') } leftIcon={<Back onClick={onDashboard} />}>
        <div>
          <Row>
            <div style={ formStyles.left }/>
            <div style={ formStyles.right }>
              <div style={{ width: '100%' }}>
                <div className={ classes.passwordLabel }>Enter a strong password</div>
                <div className={ classes.passwordSubLabel }>
                  This password will be required to confirm all account operations.
                </div>
                <div style={{ marginTop: '30px' }}>
                  <PasswordInput
                    password={ passphrase }
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
            <div style={formStyles.left} />
            <div style={formStyles.right}>
              <Input
                errorText={confirmError}
                value={confirmPassword}
                placeholder="Confirm Password"
                name="confirmPassword"
                type="password"
                onChange={this.onConfirmChange.bind(this)}
              />
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
                primary
                onClick={ this.handleGenerate }
                label="Generate Account"
                icon={ <LoadingIcon {...this.props} /> }
                disabled={ this.props.loading }
              />
            </div>
          </Row>
        </div>
      </Page>
    );
  }
}

export default withStyles(styles2)(PasswordDialog);
