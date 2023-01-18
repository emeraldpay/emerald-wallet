import { BlockchainCode, workflow } from '@emeraldwallet/core';
import { IState, accounts, blockchains } from '@emeraldwallet/store';
import { ArrowRight, Button, ButtonGroup, IdentityIcon, PasswordInput } from '@emeraldwallet/ui';
import { Divider, List, ListItem, ListItemText, StyleRules, Theme } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import * as React from 'react';
import { connect } from 'react-redux';

const styles = (theme: Theme): StyleRules => ({
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
  end: {
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'end',
    marginLeft: '14.75px',
    marginRight: '14.75px',
    width: '100%',
  },
  fee: {
    color: theme.palette.text.secondary,
  },
});

interface OwnProps {
  tx: workflow.CreateEthereumTx | workflow.CreateERC20Tx;
  fiatCurrency?: any;
  fiatRate?: any;
  onCancel?: any;
  onChangePassword?: any;
  onSubmit?: any;
  typedData?: any;
  mode?: any;
  classes?: any;
  passwordError?: string;
}

interface StateProps {
  isHardware: boolean;
}

interface DispatchProps {
  lookupAddress(blockchain: BlockchainCode, address: string): Promise<string | null>;
}

type Props = OwnProps & StateProps & DispatchProps;

interface State {
  nameByAddress: Record<string, string>;
  password: string;
}

const HorizontalAddressWithIdentity = (props: { hide: boolean; address: string; name?: string }) => {
  if (props.hide) {
    return null;
  }
  return (
    <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'column', justifyContent: 'center' }}>
      <IdentityIcon size={60} id={props.address} />
      <div style={{ paddingTop: '10px' }}>{props.address}</div>
      <div style={{ paddingTop: '10px' }}>{props.name == null ? <>&nbsp;</> : props.name}</div>
    </div>
  );
};

const TypedData = (props: { typedData: any }) => {
  const { typedData } = props;
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
    return typedData
      .get('argsDefaults')
      .toJS()
      .map((item: any, i: any) => {
        return (
          <ListItem key={i} {...listProps} style={listStyle}>
            <ListItemText primary={item.name} secondary={item.value} />
          </ListItem>
        );
      });
  };
  return (
    <div>
      <List>
        <ListItem {...listProps} style={listStyle}>
          <ListItemText primary="Method to be called" secondary={typedData.get('name')} />
        </ListItem>
        <ListItem {...listProps} style={listStyle}>
          <ListItemText primary="Params">{getNestedItems()}</ListItemText>
        </ListItem>
      </List>
    </div>
  );
};

const getTypedDataOrDeploy = (props: Props) => {
  if (props.mode === 'contract_function') {
    return (
      <React.Fragment>
        <Divider style={{ marginTop: '35px' }} />
        <TypedData typedData={props.typedData} />
        <Divider style={{ marginTop: '35px' }} />
      </React.Fragment>
    );
  }

  if (props.mode === 'contract_constructor') {
    return (
      <React.Fragment>
        <div>CONTRACT DEPLOY</div>
        <Divider style={{ marginTop: '35px' }} />
      </React.Fragment>
    );
  }
};

class SignTx extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      nameByAddress: {},
      password: '',
    };
  }

  async componentDidMount() {
    const {
      tx: { blockchain, from, to },
      lookupAddress,
    } = this.props;

    const nameByAddress: Record<string, string> = {};

    if (from != null) {
      const name = await lookupAddress(blockchain, from);

      if (name != null) {
        nameByAddress[from] = name;
      }
    }

    if (to != null) {
      const name = await lookupAddress(blockchain, to);

      if (name != null) {
        nameByAddress[to] = name;
      }
    }

    this.setState({ nameByAddress });
  }

  public handlePasswordChange = (password: string) => {
    this.setState({ password });

    if (this.props.onChangePassword) {
      this.props.onChangePassword(password);
    }
  };

  public render() {
    const { classes, tx, onCancel, onSubmit } = this.props;
    const { nameByAddress } = this.state;
    // const USDValue = Currency.format(Currency.convert(tx.amount, fiatRate, 2), fiatCurrency);
    const hideAccounts = tx.to === '0';
    const display = tx.display();

    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '50px' }}>
          <HorizontalAddressWithIdentity address={tx.from!} hide={hideAccounts} name={nameByAddress[tx.from!]} />
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
              {/* <div>{USDValue} USD</div> */}
              <div style={{ fontSize: '28px' }} title={tx.amount.toString()}>
                {display.amount()} {display.amountUnit()}
              </div>
            </div>
            <div style={{ display: hideAccounts ? 'none' : 'flex' }}>
              <ArrowRight />
            </div>
          </div>
          <HorizontalAddressWithIdentity address={tx.to!} hide={hideAccounts} name={nameByAddress[tx.to!]} />
        </div>
        <div style={{ paddingTop: '35px', display: 'flex', justifyContent: 'center' }}>
          <span className={classes.fee}>
            Plus {display.feeCost()} {display.feeCostUnit()} for {display.fee()} {display.feeUnit()}.
          </span>
        </div>
        {getTypedDataOrDeploy(this.props)}
        <div style={{ marginTop: '10px' }}>
          {!this.props.isHardware && (
            <div className={classes.formRow}>
              <div className={classes.left}>
                <div className={classes.fieldName}>Password</div>
              </div>
              <div className={classes.right}>
                <PasswordInput error={this.props.passwordError} onChange={this.handlePasswordChange} />
              </div>
            </div>
          )}
          <div className={classes.formRow}>
            <div className={classes.end} style={{ paddingTop: '10px' }}>
              <ButtonGroup>
                <Button label="Cancel" onClick={onCancel} />
                <Button
                  disabled={!this.props.isHardware && this.state.password.length === 0}
                  primary={true}
                  label="Sign Transaction"
                  onClick={onSubmit}
                />
              </ButtonGroup>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default connect<StateProps, DispatchProps, OwnProps, IState>(
  (state, { tx: { blockchain, from } }) => {
    let isHardware = false;

    if (from != null) {
      const entry = accounts.selectors.findAccountByAddress(state, from, blockchain);

      if (entry != null) {
        const wallet = accounts.selectors.findWalletByEntryId(state, entry.id);

        if (wallet != null) {
          const [account] = wallet.reserved ?? [];

          if (account != null) {
            isHardware = accounts.selectors.isHardwareSeed(state, { type: 'id', value: account.seedId });
          }
        }
      }
    }

    return { isHardware };
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (dispatch: any) => ({
    lookupAddress(blockchain, address) {
      return dispatch(blockchains.actions.lookupAddress(blockchain, address));
    },
  }),
)(withStyles(styles)(SignTx));
