import { Input, Page, Warning, WarningHeader, WarningText } from '@emeraldplatform/ui';
import { Back } from '@emeraldplatform/ui-icons';
import { Button, FormRow, PasswordInput } from '@emeraldwallet/ui';
import { CircularProgress } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import * as React from 'react';

export const styles = {
  passwordLabel: {
    height: '24px',
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
  },
  formRow: {
    display: 'flex',
    marginBottom: '19px',
    alignItems: 'center'
  },
  left: {
    flexBasis: '20%',
    marginLeft: '14.75px',
    marginRight: '14.75px'
  },
  right: {
    flexGrow: 2,
    display: 'flex',
    alignItems: 'center',
    marginLeft: '14.75px',
    marginRight: '14.75px',
    maxWidth: '580px'
  }
};

function getLoadingIcon (submitting: boolean) {
  if (submitting) {
    return (
      <CircularProgress size={25}/>
    );
  }
  return null;
}

export interface IProps {
  onBack?: any;
  error?: any;
  onSubmit?: any;
  submitting?: any;
  classes: any;
}

interface IState {
  password?: string;
  confirmPassword?: string;
  privateKey?: string;
  confirmError?: any;
}

export class ImportPrivateKey extends React.Component<IProps, IState> {
  constructor (props: IProps) {
    super(props);
    this.state = {};
  }

  public handleSubmit = () => {
    if (this.props.onSubmit && (this.state.confirmError == null)) {
      const { password, privateKey } = this.state;
      this.props.onSubmit({ password, privateKey: privateKey || '' });
    }
  }

  public handleConfirmPwdChange = (event: any) => {
    const confirmPassword = event.target.value;
    if (this.state.password !== confirmPassword) {
      this.setState({ confirmError: 'Password must match' });
    } else {
      this.setState({ confirmError: null });
    }
    this.setState({ confirmPassword });
  }

  public handlePrivateKeyChange = (event: any) => {
    this.setState({ privateKey: event.target.value });
  }

  public handlePasswordChange = (newPwd: any) => {
    this.setState({ password: newPwd });
  }


  public render () {
    const {
      submitting, classes, error
    } = this.props;
    const { privateKey, confirmPassword, password } = this.state;

    const invalid = ((password || '').length < PasswordInput.DEFAULT_MIN_LENGTH) ||
      ((privateKey || '').length === 0) ||
      (password !== confirmPassword);

    return (
      <Page title='Import Private Key' >
        <div className={classes.formRow}>
          <div className={classes.left}/>
          <div className={classes.right}>
            <div style={{ width: '100%' }}>
              <div className={classes.passwordLabel}>Enter a strong password</div>
              <div className={classes.passwordSubLabel}>This password will be required to confirm all account
                                    operations.
              </div>
              <div style={{ marginTop: '30px' }}>
                <PasswordInput
                  password={password}
                  onChange={this.handlePasswordChange}
                />
              </div>
            </div>
          </div>
        </div>
        <div className={classes.formRow}>
          <div className={classes.left}/>
          <div className={classes.right}>
            <Warning fullWidth={true}>
              <WarningHeader>Don&#39;t forget it.</WarningHeader>
              <WarningText>If you forget this password, you will lose access to the account and its funds.</WarningText>
            </Warning>
          </div>
        </div>
        <div className={classes.formRow}>
          <div className={classes.left}/>
          <div className={classes.right}>
            <Input
              errorText={this.state.confirmError}
              placeholder='Confirm Password'
              type='password'
              value={confirmPassword}
              onChange={this.handleConfirmPwdChange}
            />
          </div>
        </div>

        <div className={classes.formRow}>
          <div className={classes.left}/>
          <div className={classes.right}>
            <div style={{ width: '100%' }}>
              <div className={classes.passwordLabel}>Enter a private key</div>
              <div>
                <Input
                  value={privateKey}
                  onChange={this.handlePrivateKeyChange}
                  placeholder='Private key in hex format'
                />
              </div>
            </div>
          </div>
        </div>

        <div className={classes.formRow}>
          <div className={classes.left}/>
          <div className={classes.right}>
            <Button
              primary={true}
              label='Import'
              onClick={this.handleSubmit}
              disabled={submitting || invalid}
              icon={getLoadingIcon(submitting)}
            />
          </div>
        </div>

        {error && (
          <div className={classes.formRow}>
            <div className={classes.left}/>
            <div className={classes.right}>
              <Warning>
                <WarningText>{error}</WarningText>
              </Warning>
            </div>
          </div>
        )}
      </Page>
    );
  }
}

export default withStyles(styles)(ImportPrivateKey);
