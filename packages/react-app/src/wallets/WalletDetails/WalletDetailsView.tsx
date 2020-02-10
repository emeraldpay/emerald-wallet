import {
  Account as AddressAvatar, ButtonGroup, IdentityIcon, Page
} from '@emeraldplatform/ui';
import { Back } from '@emeraldplatform/ui-icons';
import { PageTitle } from '@emeraldplatform/ui/lib/components/Page';
import { Account, Wallet } from '@emeraldwallet/core';
import { Button, FormRow, InlineEdit } from '@emeraldwallet/ui';
import { Grid, IconButton, Typography } from '@material-ui/core';
import { AccountBalanceWalletOutlined as WalletIcon } from '@material-ui/icons';
import EditIcon from '@material-ui/icons/Edit';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import { withStyles } from '@material-ui/styles';
import * as QRCode from 'qrcode.react';
import * as React from 'react';
import { WithTranslation, withTranslation } from 'react-i18next';
import Balance from '../../common/Balance';
import ChainTitle from '../../common/ChainTitle';
import WalletSummary from '../WalletSummary';
import EthereumAccountItem from './EthereumAccountItem';

export const styles = {
  transContainer: {
    marginTop: '20px'
  },
  qrCodeContainer: {
    flexBasis: '30%',
    backgroundColor: 'white'
  }
};

export interface IProps {
  classes: any;
  showFiat: boolean;
  wallet: Wallet;
  goBack?: any;
  editAccount?: any;
  createTx?: any;
  showReceiveDialog?: any;
  txList?: React.ReactElement;
}

type AccountShowProps = IProps & WithTranslation;

export interface IState {
  edit: boolean;
}

export class WalletShow extends React.Component<AccountShowProps, IState> {
  constructor (props: AccountShowProps) {
    super(props);
    this.state = {
      edit: false
    };
  }

  public handleEdit = () => {
    this.setState({ edit: true });
  }

  public handleSave = (data: any) => {
    console.warn('UNIMPLEMENTED');
    // const updated = { blockchain: this.props.account.blockchain, ...data };
    // this.props.editAccount(updated)
    //   .then((result: any) => {
    //     this.setState({ edit: false });
    //   });
  }

  public cancelEdit = () => {
    this.setState({ edit: false });
  }

  public render () {
    const {
      wallet, classes, t
    } = this.props;
    const {
      showFiat, goBack, createTx, showReceiveDialog
    } = this.props;
    // TODO: show pending balance too
    // TODO: we convert Wei to TokenUnits here
    // const acc = {
    //   balance: account.balance,
    //   id: account.id,
    //   description: account.description,
    //   name: account.name,
    //   hdpath: account.hdpath,
    //   hardware: account.hardware || false,
    //   blockchain: account.blockchain
    // };

    // const { coinTicker } = blockchainByName(acc.blockchain).params;
    // const renderTitle = () => (<ChainTitle chain={acc.blockchain} text={'Account'} />);
    const renderTitle = () => (
      <PageTitle>
        <Grid container={true} alignItems={'center'}>
          <Grid item={true} container={true}>
            <WalletIcon />
          </Grid>
          <Grid item={true}>
            {wallet.name || ''}
          </Grid>
        </Grid>
      </PageTitle>
    );

    // <IconButton aria-label="details">
    // </IconButton>

    return (
      <div>
        <Page
          title={renderTitle()}
          leftIcon={<Back onClick={goBack}/>}
          rightIcon={<MoreVertIcon />}
        >
          <Grid container={true} direction={'column'}>
            <Grid item={true} xs={12}>
              {wallet.accounts.map(
                (account: Account) => (<EthereumAccountItem walletId={wallet.id} account={account} key={account.id}/>)
              )}
            </Grid>
          </Grid>
        </Page>

        <div className={classes.transContainer}>
          {this.props.txList}
        </div>
      </div>
    );
  }
}

export default withStyles(styles)(withTranslation('translation')(WalletShow));
