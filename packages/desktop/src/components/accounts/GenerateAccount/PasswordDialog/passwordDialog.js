import React from 'react';
import { connect } from 'react-redux';
import withStyles from 'react-jss';
import PropTypes from 'prop-types';
import { Back } from '@emeraldplatform/ui-icons';
import {
  Page, Warning, WarningHeader, WarningText, Input
} from '@emeraldplatform/ui';
import {
  Button, PasswordInput, Advice, ChainSelector
} from '@emeraldwallet/ui';
import {settings} from '@emeraldwallet/store';
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
    blockchains: PropTypes.array.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      passphrase: '',
      passphraseError: null,
      confirmError: null,
      confirmPassword: null,
      blockchain: props.blockchains.length > 0 ? props.blockchains[0].params.code : '',
    };
  }

  handleGenerate = () => {
    const { onGenerate } = this.props;
    const { passphrase, confirmPassword, blockchain } = this.state;

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

    onGenerate(passphrase, blockchain);
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

  onChainChange = (blockchain) => {
    this.setState({
      blockchain: blockchain.toLowerCase(),
    });
  };

  passwordMatch(value) {
    const password = this.state.passphrase;
    const confirmPassword = value;
    return confirmPassword === password ? undefined : 'Passwords must match';
  }

  render() {
    const {
      onDashboard, t, classes, blockchains,
    } = this.props;
    const {
      passphraseError, confirmError, confirmPassword, passphrase, blockchain,
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
              <ChainSelector onChange={ this.onChainChange } value={ blockchain } chains={ blockchains }/>
            </div>
          </Row>
        </div>
      </Page>
    );
  }
}

const StyledPasswordDialog = withStyles(styles2)(PasswordDialog);

export default connect(
  (state, ownProps) => {
    return {
      blockchains: settings.selectors.currentChains(state),
    };
  }
)(StyledPasswordDialog);
