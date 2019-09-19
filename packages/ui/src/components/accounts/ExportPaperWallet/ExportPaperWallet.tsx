import { Page } from '@emeraldplatform/ui';
import { Back } from '@emeraldplatform/ui-icons';
import { withStyles } from '@material-ui/styles';
import * as React from 'react';
import Button from '../../common/Button';
import PasswordInput from '../../common/PasswordInput';

export const styles = {
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
    width: '320px',
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

export interface Props {
  classes: any;
  onBack?: any;
  onSubmit?: any;
  accountId: string;
}

interface State {
  password?: any;
}

export class ExportPaperWallet extends React.Component<Props, State> {
  constructor (props: Props) {
    super(props);
    this.state = {};
  }

  public handleSubmit = () => {
    if (this.props.onSubmit) {
      this.props.onSubmit(this.state.password);
    }
  }

  public handlePasswordChange = (newPassword) => {
    this.setState({
      password: newPassword
    });
  }

  public render () {
    const {
      accountId, onBack, classes
    } = this.props;
    const {
      password
    } = this.state;

    return (
      <Page title='Print Paper Wallet' leftIcon={<Back onClick={onBack}/>} >
        <div className={classes.formRow}>
          <div className={classes.left}/>
          <div className={classes.right}>
            {accountId}
          </div>
        </div>
        <div className={classes.formRow}>
          <div className={classes.left}/>
          <div className={classes.right}>
            <div style={{ width: '100%' }}>
              <div className={classes.passwordLabel}>Enter a password</div>
              <div className={classes.passwordSubLabel}>
                Password needs for confirm all wallet operations.</div>
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
            <Button primary={true} label='EXPORT' onClick={this.handleSubmit} />
          </div>
        </div>
      </Page>
    );
  }
}

export default withStyles(styles)(ExportPaperWallet);
