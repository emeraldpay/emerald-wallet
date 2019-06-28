import * as React from 'react';
import {withStyles} from '@material-ui/styles';
import {Page, Warning, WarningHeader, WarningText, Input} from '@emeraldplatform/ui';
import {Back} from '@emeraldplatform/ui-icons';
import { Blockchain } from "@emeraldwallet/core";
import Button from '../../common/Button';
import HdPath from '../../common/HdPath';
import ChainSelector from '../../common/ChainSelector';

export const styles = {
  passwordLabel: {
    height: '24px',
    color: '#191919',
    fontSize: '16px',
    fontWeight: 500,
    lineHeight: '24px',
  },
  mnemonicLabel: {
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

interface Props {
  chains: Blockchain[],
  onSubmit?: any;
  onBack?: any;
  classes: any;
  error?: any;
  invalid?: any;
  mnemonic?: string;
}

interface State {
  password: string;
  confirmedPassword: string;
  hdpath: string;
  mnemonic: string;
  chain: string
}

export class ImportMnemonic extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      mnemonic: props.mnemonic || '',
      hdpath: '',
      password: '',
      confirmedPassword: '',
      chain: props.chains.length > 0 ? props.chains[0].params.coinTicker : '',
    }
  }

  handlePasswordChange = (event: any) => {
    this.setState({
      password: event.target.value
    });
  };

  handleConfirmedPasswordChange = (event: any) => {
    this.setState({
      confirmedPassword: event.target.value
    });
  };

  handleSubmit = () => {
    if (this.props.onSubmit) {
      const {chain, mnemonic, password, hdpath} = this.state;
      this.props.onSubmit({chain, mnemonic, password, hdpath});
    }
  };

  handleHdPathChange = (hdpath) => {
    this.setState({
      hdpath
    })
  };

  handleMnemonicChange = (event: any) => {
    this.setState({
      mnemonic: event.target.value
    });
  };

  handleChainChange = (value: string) => {
    this.setState({
      chain: value
    });
  };

  render() {
    const {
      onBack, invalid, error, classes, chains,
    } = this.props;
    const {
      chain, password, confirmedPassword, hdpath, mnemonic,
    } = this.state;
    const confirmPwdErrorText = (confirmedPassword.length > 0 && password != confirmedPassword) ? "Password does not match" : null;
    return (
      <Page title="Import Mnemonic" leftIcon={<Back onClick={onBack}/>}>
        <div>
          <div className={classes.formRow}>
            <div className={classes.left}/>
            <div className={classes.right}>
              <div style={{width: '100%'}}>
                <div className={classes.passwordLabel}>Enter a strong password</div>
                <div className={classes.passwordSubLabel}>This password will be required to confirm all account
                  operations.
                </div>
                <div style={{marginTop: '30px'}}>
                  <Input
                    placeholder="At least 8 characters"
                    type="password"
                    value={password}
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
                <WarningText>If you forget this password, you will lose access to the account and its
                  funds.</WarningText>
              </Warning>
            </div>
          </div>
          <div className={classes.formRow}>
            <div className={classes.left}/>
            <div className={classes.right}>
              <Input
                placeholder="Confirm Password"
                type="password"
                onChange={this.handleConfirmedPasswordChange}
                value={confirmedPassword}
                errorText={confirmPwdErrorText}
              />
            </div>
          </div>

          <div className={classes.formRow}>
            <div className={classes.left}/>
            <div className={classes.right}>
              <div style={{width: '100%'}}>
                <div className={classes.mnemonicLabel}>HD derivation path</div>
                <div>
                  <HdPath value={hdpath} onChange={this.handleHdPathChange}/>
                </div>
              </div>
            </div>
          </div>

          <div className={classes.formRow}>
            <div className={classes.left}>
            </div>
            <div className={classes.right}>
              <div style={{width: '100%'}}>
                <div className={classes.mnemonicLabel}>Enter a mnemonic phrase</div>
                <div>
                  <Input
                    value={mnemonic}
                    onChange={this.handleMnemonicChange}
                    multiline={true}
                    rowsMax={4}
                    rows={4}
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
                label="Continue"
                disabled={invalid}
                onClick={this.handleSubmit}
              />
              <ChainSelector onChange={this.handleChainChange} value={chain} chains={chains}/>
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
        </div>
      </Page>
    );
  }
}

export default withStyles(styles)(ImportMnemonic);
