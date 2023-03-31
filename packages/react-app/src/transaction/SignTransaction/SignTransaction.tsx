import { BlockchainCode, workflow } from '@emeraldwallet/core';
import { IState, accounts, blockchains } from '@emeraldwallet/store';
import { ArrowRight, Button, ButtonGroup, FormLabel, FormRow, IdentityIcon, PasswordInput } from '@emeraldwallet/ui';
import { StyleRulesCallback, Theme, WithStyles, createStyles, withStyles } from '@material-ui/core';
import * as React from 'react';
import { connect } from 'react-redux';
import WaitLedger from '../../ledger/WaitLedger';

interface OwnProps {
  passwordError?: string;
  transaction: workflow.CreateEthereumTx | workflow.CreateERC20Tx;
  onChangePassword(password: string): void;
  onSubmit(): void;
  onCancel(): void;
}

interface StateProps {
  isHardware: boolean;
}

interface DispatchProps {
  lookupAddress(blockchain: BlockchainCode, address: string): Promise<string | null>;
}

type Props = OwnProps & StateProps & DispatchProps;

const styles: StyleRulesCallback<Theme, Props> = (theme) =>
  createStyles({
    address: {
      alignItems: 'center',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
    },
    addressField: {
      lineHeight: '1',
      minHeight: '1rem',
      paddingTop: 10,
    },
    addresses: {
      display: 'flex',
      justifyContent: 'center',
    },
    addressesDirection: {
      alignItems: 'center',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
    },
    addressesDirectionAmount: {
      alignItems: 'center',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
    },
    addressesDirectionAmountText: {
      fontSize: '28px',
    },
    addressesDirectionArrow: {
      display: 'flex',
    },
    buttons: {
      display: 'flex',
      justifyContent: 'end',
      paddingTop: 10,
      width: '100%',
    },
    fee: {
      display: 'flex',
      justifyContent: 'center',
      marginBottom: 20,
      marginTop: 10,
    },
    feeText: {
      color: theme.palette.text.secondary,
    },
  });

interface AddressLineProps {
  address?: string;
  name?: string;
}

const AddressLine: React.FC<AddressLineProps & WithStyles<typeof styles>> = ({ classes, address = '', name = '' }) => (
  <div className={classes.address}>
    <IdentityIcon size={50} id={address} />
    <div className={classes.addressField}>{address}</div>
    <div className={classes.addressField}>{name}</div>
  </div>
);

type StyledProps = Props & WithStyles<typeof styles>;

interface State {
  nameByAddress: Record<string, string>;
  password: string;
}

class SignTransaction extends React.Component<StyledProps, State> {
  constructor(props: StyledProps) {
    super(props);

    this.state = {
      nameByAddress: {},
      password: '',
    };
  }

  async componentDidMount(): Promise<void> {
    const {
      transaction: { blockchain, from, to },
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

  handlePasswordChange = (password: string): void => {
    this.setState({ password });

    this.props.onChangePassword(password);
  };

  render(): React.ReactNode {
    const { classes, isHardware, passwordError, transaction, onCancel, onSubmit } = this.props;
    const { nameByAddress, password } = this.state;

    const display = transaction.display();

    return (
      <div>
        <div className={classes.addresses}>
          <AddressLine
            address={transaction.from}
            classes={classes}
            name={transaction.from == null ? undefined : nameByAddress[transaction.from]}
          />
          <div className={classes.addressesDirection}>
            <div className={classes.addressesDirectionAmount}>
              <div className={classes.addressesDirectionAmountText} title={transaction.amount.toString()}>
                {display.amount()} {display.amountUnit()}
              </div>
            </div>
            <div className={classes.addressesDirectionArrow}>
              <ArrowRight />
            </div>
          </div>
          <AddressLine
            address={transaction.to}
            classes={classes}
            name={transaction.to == null ? undefined : nameByAddress[transaction.to]}
          />
        </div>
        <div className={classes.fee}>
          <span className={classes.feeText}>
            Plus {display.feeCost()} {display.feeCostUnit()} for {display.fee()} {display.feeUnit()}.
          </span>
        </div>
        {isHardware ? (
          <WaitLedger fullSize blockchain={transaction.blockchain} onConnected={() => onSubmit()} />
        ) : (
          <FormRow>
            <FormLabel>Password</FormLabel>
            <PasswordInput error={passwordError} onChange={this.handlePasswordChange} />
          </FormRow>
        )}
        <FormRow last>
          <ButtonGroup classes={{ container: classes.buttons }}>
            <Button label="Cancel" onClick={onCancel} />
            {!isHardware && (
              <Button disabled={password.length === 0} primary={true} label="Sign Transaction" onClick={onSubmit} />
            )}
          </ButtonGroup>
        </FormRow>
      </div>
    );
  }
}

export default connect<StateProps, DispatchProps, OwnProps, IState>(
  (state, { transaction: { blockchain, from } }) => {
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
)(withStyles(styles)(SignTransaction));
