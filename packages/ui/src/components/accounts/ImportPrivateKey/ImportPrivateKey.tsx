import * as React from 'react';
import {withStyles} from '@material-ui/styles';
import CircularProgress from '@material-ui/core/CircularProgress';
import {
  Page, Warning, WarningHeader, WarningText, Input
} from '@emeraldplatform/ui';
import { Back } from '@emeraldplatform/ui-icons';
import Button from '../../common/Button';
import PasswordInput from '../../common/PasswordInput';
import ChainSelector from "../../common/ChainSelector/ChainSelector";
import { Blockchain } from "@emeraldwallet/core";


export const styles = {
  passwordLabel: {
    height: '24px',
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
  formRow: {
    display: 'flex',
    marginBottom: '19px',
    alignItems: 'center',
  },
  left: {
    flexBasis: '20%',
    marginLeft: '14.75px',
    marginRight: '14.75px',
  },
  right: {
    flexGrow: 2,
    display: 'flex',
    alignItems: 'center',
    marginLeft: '14.75px',
    marginRight: '14.75px',
    maxWidth: '580px',
  },
};

function getLoadingIcon(submitting) {
  if (submitting) {
    return (
      <CircularProgress size={25}/>
    );
  }
  return null;
}

interface Props {
  blockchains: Blockchain[],
  onBack?: any;
  error?: any;
  onSubmit?: any;
  submitting?: any;
  classes: any;
}

interface State {
  password?: string;
  confirmPassword?: string;
  privateKey?: string;
  confirmError?: any;
  blockchain: string
}

export class ImportPrivateKey extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      blockchain: props.blockchains.length > 0 ? props.blockchains[0].params.code : '',
    };
  }

  handleSubmit = () => {
    if (this.props.onSubmit && (this.state.confirmError == null)) {
      const { blockchain, password, privateKey } = this.state;
      this.props.onSubmit({blockchain, password, privateKey: privateKey || ''});
    }
  };

  handleConfirmPwdChange = (event: any) => {
    const confirmPassword = event.target.value;
    if (this.state.password != confirmPassword) {
      this.setState({confirmError: "Password must match"});
    } else {
      this.setState({ confirmError: null })
    }
    this.setState({ confirmPassword });
  };

  handlePrivateKeyChange = (event: any) => {
    this.setState({ privateKey: event.target.value });
  };

  handlePasswordChange = (newPwd: any) => {
    this.setState({ password: newPwd });
  };

  handleChainChange = (value: string) => {
    this.setState({
      blockchain: value
    });
  };

  render() {
    const {
      onBack, submitting, classes, error, blockchains,
    } = this.props;
    const { blockchain, privateKey, confirmPassword, password } = this.state;

    const invalid = ((password || '').length < PasswordInput.DEFAULT_MIN_LENGTH) ||
      ((privateKey || '').length == 0) ||
      (password !== confirmPassword);

    return (
      <Page title="Import Private Key" leftIcon={ <Back onClick={ onBack }/> }>
        <div className={classes.formRow}>
          <div className={classes.left}/>
          <div className={classes.right}>
            <div style={{width: '100%'}}>
              <div className={classes.passwordLabel}>Enter a strong password</div>
              <div className={classes.passwordSubLabel}>This password will be required to confirm all account
                                    operations.
              </div>
              <div style={{marginTop: '30px'}}>
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
            <Warning fullWidth={ true }>
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
              placeholder="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={this.handleConfirmPwdChange}
            />
          </div>
        </div>

        <div className={classes.formRow}>
          <div className={classes.left}/>
          <div className={classes.right}>
            <div style={{width: '100%'}}>
              <div className={ classes.passwordLabel }>Enter a private key</div>
              <div>
                <Input
                  value={privateKey}
                  onChange={this.handlePrivateKeyChange}
                  placeholder="Private key in hex format"
                />
              </div>
            </div>
          </div>
        </div>

        <div className={classes.formRow}>
          <div className={classes.left}/>
          <div className={classes.right}>
            <Button
              primary
              label="Import"
              onClick={ this.handleSubmit }
              disabled={ submitting || invalid }
              icon={getLoadingIcon(submitting) }
            />
            <ChainSelector onChange={this.handleChainChange} value={blockchain} chains={blockchains}/>
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
