import * as React from 'react';
import {ButtonGroup, Input, IdentityIcon} from '@emeraldplatform/ui';
import {ArrowRight} from '@emeraldplatform/ui-icons';
//import { required } from 'lib/validators';
import {Divider, List, ListItem, ListItemText} from '@material-ui/core';
import withStyles from '@material-ui/core/styles/withStyles';
import Button from '../../../common/Button';

const styles = (theme?: any) => ({
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
  fee: {
    color: theme.palette.text.secondary,
  }
});


interface Props {
  tx: {
    from: string;
    to: string;
    token: string;
    amount: string;
    gasLimit: string;
  };
  amountWei: any; //TODO Wei object
  txFee?: any;
  fiatCurrency?: any;
  fiatRate?: any;
  value?: any;
  onCancel?: any;
  onChangePassword?: any;
  onSubmit?: any;
  useLedger?: any;
  typedData?: any;
  mode?: any;
  classes?: any;
}

interface State {
  password: string;
}

const HorizontalAddressWithIdentity = (props: { hide: boolean; address: string; }) => {
  if (props.hide) {
    return null;
  }
  return (
    <div style={{
      display: 'flex', alignItems: 'center', flexDirection: 'column', justifyContent: 'center',
    }}>
      <IdentityIcon size={60} id={props.address}/>
      <div style={{paddingTop: '10px'}}>{props.address}</div>
    </div>
  );
};

const TypedData = (props: { typedData: any; }) => {
  const {typedData} = props;
  if (!typedData) {
    return null;
  }

  const listStyle = {
    cursor: 'default',
  };
  const listProps = {
    disableTouchRipple: true,
    hoverColor: 'transparent',
    autoGenerateNestedIndicator: false,
    initiallyOpen: true,
  };
  const getNestedItems = () => {
    return typedData.get('argsDefaults').toJS().map((item: any, i: any) => {
      return (
        <ListItem key={i} {...listProps} style={listStyle}>
          <ListItemText primary={item.name} secondary={item.value}/>
        </ListItem>
      );
    });
  };
  return (
    <div>
      <List>
        <ListItem {...listProps} style={listStyle}>
          <ListItemText primary="Method to be called" secondary={typedData.get('name')}/>
        </ListItem>
        <ListItem {...listProps} style={listStyle}>
          <ListItemText primary="Params">
            {getNestedItems()}
          </ListItemText>
        </ListItem>
      </List>
    </div>
  );
};


const getTypedDataOrDeploy = (props: Props) => {
  if (props.mode === 'contract_function') {
    return (
      <React.Fragment>
        <Divider style={{marginTop: '35px'}}/>
        <TypedData typedData={props.typedData}/>
        <Divider style={{marginTop: '35px'}}/>
      </React.Fragment>
    );
  }

  if (props.mode === 'contract_constructor') {
    return (
      <React.Fragment>
        <div>CONTRACT DEPLOY</div>
        <Divider style={{marginTop: '35px'}}/>
      </React.Fragment>
    );
  }
};

class SignTx extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {password: ''};
  }

  handlePasswordChange = (event: any) => {
    this.setState({password: event.target.value});
    if (this.props.onChangePassword) {
      this.props.onChangePassword(event.target.value);
    }
  };

  render() {
    const {
      value, fiatRate, fiatCurrency, txFee, tx, classes, amountWei
    } = this.props;
    const {
      onCancel, onChangePassword, onSubmit,
    } = this.props;

    // const USDValue = Currency.format(Currency.convert(tx.amount, fiatRate, 2), fiatCurrency);
    const hideAccounts = tx.to === '0';

    return (
      <div>
        <div style={{display: 'flex', justifyContent: 'center', paddingTop: '50px'}}>
          <HorizontalAddressWithIdentity address={tx.from} hide={hideAccounts}/>
          <div style={{
            display: 'flex', alignItems: 'center', flexDirection: 'column', justifyContent: 'space-between',
          }}>
            <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
              {/* <div>{USDValue} USD</div> */}
              <div style={{fontSize: '28px'}} title={amountWei.value().toString() + " Wei"}>{amountWei.getEther(6)} {tx.token}</div>
            </div>
            <div style={{display: hideAccounts ? 'none' : 'flex'}}>
              <ArrowRight/>
            </div>
          </div>
          <HorizontalAddressWithIdentity address={tx.to} hide={hideAccounts}/>
        </div>
        <div style={{paddingTop: '35px', display: 'flex', justifyContent: 'center'}}>
        <span className={classes.fee}>
          Plus {txFee} ETC for {tx.gasLimit} GAS.
        </span>
        </div>
        {
          getTypedDataOrDeploy(this.props)
        }
        <div style={{marginTop: '10px'}}>
          {!this.props.useLedger &&
          (<div className={classes.formRow}>
            <div className={classes.left}>
              <div className={classes.fieldName}>Password</div>
            </div>
            <div className={classes.right}>
              <Input
                // name="password"
                value={this.state.password}
                type="password"
                onChange={this.handlePasswordChange}
                // style={{ minWidth: '600px' }}
                // hintText="Enter your Password"
                // fullWidth={true}
              />
            </div>
          </div>)}

          <div className={classes.formRow}>
            <div className={classes.left}/>
            <div className={classes.right} style={{paddingTop: '10px'}}>
              <ButtonGroup>
                <Button label="Cancel" onClick={onCancel}/>
                <Button primary label="Sign & Send Transaction" onClick={onSubmit}/>
              </ButtonGroup>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const StyledSignTx = withStyles(styles)(SignTx);

export default StyledSignTx;
