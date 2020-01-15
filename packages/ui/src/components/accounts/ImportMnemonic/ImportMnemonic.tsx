import { Input, Page, Warning, WarningHeader, WarningText } from '@emeraldplatform/ui';
import { Back } from '@emeraldplatform/ui-icons';
import { Blockchain, BlockchainCode } from '@emeraldwallet/core';
import { withStyles } from '@material-ui/core/styles';
import * as React from 'react';
import Button from '../../common/Button';
import ChainSelector from '../../common/ChainSelector';
import FormRow from '../../common/FormRow';
import HdPath from '../../common/HdPath';

export const styles = {
  mnemonicLabel: {
    color: '#191919',
    fontSize: '16px',
    fontWeight: 500,
    height: '24px',
    lineHeight: '24px'
  },
  passwordLabel: {
    color: '#191919',
    fontSize: '16px',
    fontWeight: 500,
    height: '24px',
    lineHeight: '24px'
  },
  passwordSubLabel: {
    color: '#191919',
    fontSize: '14px',
    height: '22px',
    lineHeight: '22px'
  }
};

export interface IProps {
  blockchains: Blockchain[];
  onSubmit?: any;
  onBack?: any;
  classes: any;
  error?: any;
  invalid?: any;
  mnemonic?: string;
  initialValues: {
    hdpath: string
  };
}

interface IState {
  password: string;
  confirmedPassword: string;
  hdpath: string;
  mnemonic: string;
  blockchain: BlockchainCode;
}

export class ImportMnemonic extends React.Component<IProps, IState> {
  constructor (props: IProps) {
    super(props);
    this.state = {
      blockchain: props.blockchains.length > 0 ? props.blockchains[0].params.code : BlockchainCode.ETH,
      confirmedPassword: '',
      hdpath: this.props.initialValues.hdpath,
      mnemonic: props.mnemonic || '',
      password: ''
    };
  }

  public handlePasswordChange = (event: any) => {
    this.setState({
      password: event.target.value
    });
  }

  public handleConfirmedPasswordChange = (event: any) => {
    this.setState({
      confirmedPassword: event.target.value
    });
  }

  public handleSubmit = () => {
    if (this.props.onSubmit) {
      const { blockchain, mnemonic, password, hdpath } = this.state;
      this.props.onSubmit({ blockchain, mnemonic, password, hdpath });
    }
  }

  public handleHdPathChange = (hdpath) => {
    this.setState({
      hdpath
    });
  }

  public handleMnemonicChange = (event: any) => {
    this.setState({
      mnemonic: event.target.value
    });
  }

  public handleChainChange = (value: BlockchainCode) => {
    this.setState({
      blockchain: value
    });
  }

  public render () {
    const {
      onBack, invalid, error, classes, blockchains
    } = this.props;
    const {
      blockchain, password, confirmedPassword, hdpath, mnemonic
    } = this.state;
    const confirmPwdErrorText = (confirmedPassword.length > 0 && password !== confirmedPassword) ? 'Password does not match' : null;
    return (
      <Page title='Import Mnemonic' leftIcon={<Back onClick={onBack}/>}>
        <div>
          <FormRow
            rightColumn={(
              <div style={{ width: '100%' }}>
                <div className={classes.passwordLabel}>Enter a strong password</div>
                <div className={classes.passwordSubLabel}>This password will be required to confirm all account
                  operations.
                </div>
                <div style={{ marginTop: '30px' }}>
                  <Input
                    placeholder='At least 8 characters'
                    type='password'
                    value={password}
                    onChange={this.handlePasswordChange}
                  />
                </div>
              </div>
            )}
          />

          <FormRow
            rightColumn={(
              <Warning fullWidth={true}>
                <WarningHeader>Don&#39;t forget it.</WarningHeader>
                <WarningText>If you forget this password, you will lose access to the account and its
                  funds.</WarningText>
              </Warning>
            )}
          />

          <FormRow
            rightColumn={(
              <Input
                placeholder='Confirm Password'
                type='password'
                onChange={this.handleConfirmedPasswordChange}
                value={confirmedPassword}
                errorText={confirmPwdErrorText}
              />
            )}
          />

          <FormRow
            rightColumn={(
              <div style={{ width: '100%' }}>
                <div className={classes.mnemonicLabel}>HD derivation path</div>
                <div>
                  <HdPath value={hdpath} onChange={this.handleHdPathChange}/>
                </div>
              </div>
            )}
          />

          <FormRow
            rightColumn={(
              <div style={{ width: '100%' }}>
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
            )}
          />

          <FormRow
            rightColumn={(
              <React.Fragment>
                <Button
                  primary={true}
                  label='Continue'
                  disabled={invalid}
                  onClick={this.handleSubmit}
                />
                <ChainSelector onChange={this.handleChainChange} value={blockchain} chains={blockchains}/>
              </React.Fragment>
            )}
          />

          {error && (
            <FormRow
              rightColumn={(
                <Warning>
                  <WarningText>{error}</WarningText>
                </Warning>
              )}
            />
          )}
        </div>
      </Page>
    );
  }
}

export default withStyles(styles)(ImportMnemonic);
