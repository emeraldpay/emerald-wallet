import {
  Input, Page, Warning, WarningHeader, WarningText
} from '@emeraldplatform/ui';
import { Back } from '@emeraldplatform/ui-icons';
import { BlockchainCode } from '@emeraldwallet/core';
import {settings, State} from '@emeraldwallet/store';
import {
  Advice, Button, ChainSelector, FormRow, PasswordInput
} from '@emeraldwallet/ui';
import { withStyles } from '@material-ui/styles';
import * as React from 'react';
import { connect } from 'react-redux';
import LoadingIcon from '../LoadingIcon';

const MIN_PASSWORD_LENGTH = 8;

export const styles2 = {
  passwordLabel: {
    height: '24px',
    width: '190px',
    color: '#191919',
    fontSize: '16px',
    fontWeight: 500,
    lineHeight: '24px'
  },
  passwordSubLabel: {
    height: '22px',
    color: '#191919',
    fontSize: '14px',
    lineHeight: '22px'
  }
};

export interface IProps {
  onGenerate: any;
  blockchains: any;
  classes: any;
  t: any;
  onDashboard: any;
  loading?: boolean;
}

interface IState {
  passphrase: string;
  passphraseError: any | null;
  confirmError: any | null;
  confirmPassword: string | null;
  blockchain: BlockchainCode;
}

class PasswordDialog extends React.Component<IProps, IState> {
  constructor (props: IProps) {
    super(props);
    this.state = {
      passphrase: '',
      passphraseError: null,
      confirmError: null,
      confirmPassword: null,
      blockchain: props.blockchains.length > 0 ? props.blockchains[0].params.code : ''
    };
  }

  public handleGenerate = () => {
    const { onGenerate } = this.props;
    const { passphrase, confirmPassword, blockchain } = this.state;

    // validate passphrase
    if (passphrase.length < MIN_PASSWORD_LENGTH) {
      return this.setState({
        passphraseError: `Minimum ${MIN_PASSWORD_LENGTH} characters`
      });
    }

    if (passphrase !== confirmPassword) {
      return this.setState({
        confirmError: 'Passwords does not match'
      });
    }

    onGenerate(passphrase, blockchain);
  }

  public onPassphraseChange = (newValue: string) => {
    const passphraseError = (newValue.length === 0 || newValue.length >= MIN_PASSWORD_LENGTH)
      ? null
      : this.state.passphraseError;

    this.setState({
      passphrase: newValue,
      passphraseError
    });
  }

  public onConfirmChange (val: any) {
    this.setState({
      confirmPassword: val.target.value
    });
  }

  public onChainChange = (blockchain: any) => {
    this.setState({
      blockchain: blockchain.toLowerCase()
    });
  }

  public passwordMatch (value: string) {
    const password = this.state.passphrase;
    const confirmPassword = value;
    return confirmPassword === password ? undefined : 'Passwords must match';
  }

  public render () {
    const {
      onDashboard, t, classes, blockchains
    } = this.props;
    const {
      passphraseError, confirmError, confirmPassword, passphrase, blockchain
    } = this.state;

    return (
      <Page title={t('accounts.generate.title')} leftIcon={<Back onClick={onDashboard} />}>
        <div>
          <FormRow
            rightColumn={
              <ChainSelector onChange={this.onChainChange} value={blockchain} chains={blockchains}/>
            }
          />
          <FormRow
            rightColumn={(
              <div style={{ width: '100%' }}>
                <div className={classes.passwordLabel}>Enter a strong password</div>
                <div className={classes.passwordSubLabel}>
                  This password will be required to confirm all account operations.
                </div>
                <div style={{ marginTop: '30px' }}>
                  <PasswordInput
                    password={passphrase}
                    onChange={this.onPassphraseChange}
                    error={passphraseError}
                  />
                </div>
              </div>
            )}
          />

          <FormRow
            rightColumn={(
              <Warning fullWidth={true}>
                <WarningHeader>Don&#39;t forget it.</WarningHeader>
                <WarningText>If you forget password, you will lose your account with all
                  funds.</WarningText>
              </Warning>
            )}
          />

          <FormRow
            rightColumn={(
              <Input
                errorText={confirmError}
                value={confirmPassword || ''}
                placeholder='Confirm Password'
                type='password'
                onChange={this.onConfirmChange.bind(this)}
              />
            )}
          />

          <FormRow
            rightColumn={(
              <Advice
                title='Advice'
                text={(
                  <div>
                    You can use a word or phrase as password. Write it in short text.<br/>
                    Only you know where password is. It is safer than write a password only.
                  </div>
                )}
              />
            )}
          />

          <FormRow
            rightColumn={(
              <Button
                primary={true}
                onClick={this.handleGenerate}
                label='Generate Account'
                icon={<LoadingIcon {...this.props} />}
                disabled={this.props.loading}
              />
            )}
          />
        </div>
      </Page>
    );
  }
}

const StyledPasswordDialog = withStyles(styles2)(PasswordDialog);

export default connect<any, any, any, State>(
  (state, ownProps) => {
    return {
      blockchains: settings.selectors.currentChains(state)
    };
  }
)(StyledPasswordDialog);
