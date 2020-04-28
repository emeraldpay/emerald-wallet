import { Page } from '@emeraldplatform/ui';
import { Back, MoreVertical, Pen3 as EditIcon } from '@emeraldplatform/ui-icons';
import { PageTitle } from '@emeraldplatform/ui/lib/components/Page';
import { Account, Wallet } from '@emeraldwallet/core';
import { Button, FormRow, InlineEdit } from '@emeraldwallet/ui';
import { Grid, IconButton, Typography } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { AccountBalanceWalletOutlined as WalletIcon } from '@material-ui/icons';

import * as React from 'react';
import { WithTranslation, withTranslation } from 'react-i18next';
import WalletMenu from '../WalletList/WalletMenu';
import EthereumAccountItem from './EthereumAccountItem';

export const styles = {
};

export interface IProps {
  classes: any;
  showFiat: boolean;
  wallet: Wallet;
  goBack?: any;
  updateWallet?: any;
  createTx?: any;
  showReceiveDialog?: any;
  txList?: React.ReactElement;
}

type WalletDetailsProps = IProps & WithTranslation;

export interface IState {
  edit: boolean;
}

export class WalletShow extends React.Component<WalletDetailsProps, IState> {
  constructor (props: WalletDetailsProps) {
    super(props);
    this.state = {
      edit: false
    };
  }

  public handleEdit = () => {
    this.setState({ edit: true });
  }

  public handleSave = (data: any) => {
    if (this.props.updateWallet) {
      const walletData = {
        id: data.id,
        name: data.value
      };
      this.props.updateWallet(walletData);
    }
    this.setState({ edit: false });
  }

  public cancelEdit = () => {
    this.setState({ edit: false });
  }

  public render () {
    const {
      wallet, t, showFiat, goBack, createTx
    } = this.props;

    const { edit } = this.state;
    // TODO: show pending balance too

    const walletName = wallet.name || '';

    const renderTitle = () => (
      <PageTitle>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ display: 'flex', paddingRight: '5px' }}>
            <WalletIcon />
          </div>
          <div style={{ width: '100%' }}>
            {edit && (
              <InlineEdit
                placeholder='Wallet name'
                initialValue={walletName}
                id={wallet.id}
                onSave={this.handleSave}
                onCancel={this.cancelEdit}
              />
            )}
            {!edit && (
              <React.Fragment>
                {walletName} <IconButton onClick={this.handleEdit}><EditIcon /></IconButton>
              </React.Fragment>
            )}
          </div>
        </div>
      </PageTitle>
    );

    return (
      <Page
        title={renderTitle()}
        leftIcon={<Back onClick={goBack}/>}
        rightIcon={<WalletMenu walletId={wallet.id}/>}
      >
        <Grid container={true} direction={'column'}>
          <Grid item={true} xs={12}>
            {wallet.accounts.map(
              (account: Account) => (
                <EthereumAccountItem
                  walletId={wallet.id}
                  account={account}
                  key={account.id}
                />
              )
            )}
          </Grid>
        </Grid>
      </Page>
    );
  }
}

export default withStyles(styles)(withTranslation('translation')(WalletShow));
