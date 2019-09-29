import { Units } from '@emeraldplatform/eth';
import { ButtonGroup, IdentityIcon, Input } from '@emeraldplatform/ui';
import { ArrowRight } from '@emeraldplatform/ui-icons';
import { workflow } from '@emeraldwallet/core';
import { Button } from '@emeraldwallet/ui';
import { Divider, List, ListItem, ListItemText } from '@material-ui/core';
import { withStyles } from '@material-ui/styles';
import * as React from 'react';

const styles = (theme?: any) => ({
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
  },
  fee: {
    color: theme.palette.text.secondary
  }
});

interface IProps {
  tx: workflow.CreateEthereumTx | workflow.CreateERC20Tx;
  fiatCurrency?: any;
  fiatRate?: any;
  onCancel?: any;
  onChangePassword?: any;
  onSubmit?: any;
  useLedger?: any;
  typedData?: any;
  mode?: any;
  classes?: any;
}

interface IState {
  password: string;
}

const HorizontalAddressWithIdentity = (props: { hide: boolean; address: string; }) => {
  if (props.hide) {
    return null;
  }
  return (
    <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'column', justifyContent: 'center' }}>
      <IdentityIcon size={60} id={props.address}/>
      <div style={{ paddingTop: '10px' }}>{props.address}</div>
    </div>
  );
};

const TypedData = (props: { typedData: any; }) => {
  const { typedData } = props;
  if (!typedData) {
    return null;
  }

  const listStyle = {
    cursor: 'default'
  };
  const listProps = {
    disableTouchRipple: true,
    hoverColor: 'transparent',
    autoGenerateNestedIndicator: false,
    initiallyOpen: true
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
          <ListItemText primary='Method to be called' secondary={typedData.get('name')}/>
        </ListItem>
        <ListItem {...listProps} style={listStyle}>
          <ListItemText primary='Params'>
            {getNestedItems()}
          </ListItemText>
        </ListItem>
      </List>
    </div>
  );
};

const getTypedDataOrDeploy = (props: IProps) => {
  if (props.mode === 'contract_function') {
    return (
      <React.Fragment>
        <Divider style={{ marginTop: '35px' }}/>
        <TypedData typedData={props.typedData}/>
        <Divider style={{ marginTop: '35px' }}/>
      </React.Fragment>
    );
  }

  if (props.mode === 'contract_constructor') {
    return (
      <React.Fragment>
        <div>CONTRACT DEPLOY</div>
        <Divider style={{ marginTop: '35px' }}/>
      </React.Fragment>
    );
  }
};

class SignTx extends React.Component<IProps, IState> {
  constructor (props: IProps) {
    super(props);
    this.state = { password: '' };
  }

  public handlePasswordChange = (event: any) => {
    this.setState({ password: event.target.value });
    if (this.props.onChangePassword) {
      this.props.onChangePassword(event.target.value);
    }
  }

  public render () {
    const {
      classes, tx
    } = this.props;
    const {
      onCancel, onSubmit
    } = this.props;
    // const USDValue = Currency.format(Currency.convert(tx.amount, fiatRate, 2), fiatCurrency);
    const hideAccounts = tx.to === '0';
    const display = tx.display();

    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '50px' }}>
          <HorizontalAddressWithIdentity address={tx.from!} hide={hideAccounts}/>
          <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
              {/* <div>{USDValue} USD</div> */}
              <div style={{ fontSize: '28px' }} title={tx.amount.toString(Units.WEI, 0, true)}>
                {display.amount()} {display.amountUnit()}
              </div>
            </div>
            <div style={{ display: hideAccounts ? 'none' : 'flex' }}>
              <ArrowRight/>
            </div>
          </div>
          <HorizontalAddressWithIdentity address={tx.to!} hide={hideAccounts}/>
        </div>
        <div style={{ paddingTop: '35px', display: 'flex', justifyContent: 'center' }}>
        <span className={classes.fee}>
          Plus {display.feeCost()} {display.feeCostUnit()} for {display.fee()} {display.feeUnit()}.
        </span>
        </div>
        {
          getTypedDataOrDeploy(this.props)
        }
        <div style={{ marginTop: '10px' }}>
          {!this.props.useLedger && (
            <div className={classes.formRow}>
              <div className={classes.left}>
                <div className={classes.fieldName}>Password</div>
              </div>
              <div className={classes.right}>
                <Input
                  value={this.state.password}
                  type='password'
                  onChange={this.handlePasswordChange}
                  // style={{ minWidth: '600px' }}
                  placeholder='Enter your Password'
                />
              </div>
            </div>
          )}

          <div className={classes.formRow}>
            <div className={classes.left}/>
            <div className={classes.right} style={{ paddingTop: '10px' }}>
              <ButtonGroup>
                <Button label='Cancel' onClick={onCancel}/>
                <Button primary={true} label='Sign Transaction' onClick={onSubmit}/>
              </ButtonGroup>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default withStyles(styles)(SignTx);
