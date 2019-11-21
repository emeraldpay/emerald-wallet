import {
  Account as AddressAvatar, ButtonGroup, IdentityIcon, Page
} from '@emeraldplatform/ui';
import { Back } from '@emeraldplatform/ui-icons';
import { blockchainByName, IAccount } from '@emeraldwallet/core';
import { Button, FormRow, InlineEdit } from '@emeraldwallet/ui';
import { withStyles } from '@material-ui/styles';
import * as QRCode from 'qrcode.react';
import * as React from 'react';
import { WithTranslation, withTranslation } from 'react-i18next';
import Balance from '../../common/Balance';
import ChainTitle from '../../common/ChainTitle';
import AccountActions from '../AccountActions';

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
  account: IAccount;
  goBack?: any;
  editAccount?: any;
  createTx?: any;
  showReceiveDialog?: any;
  txList?: React.ReactElement;
  tokens?: React.ReactElement;
}

type AccountShowProps = IProps & WithTranslation;

export interface IState {
  edit: boolean;
}

export class AccountShow extends React.Component<AccountShowProps, IState> {
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
    const updated = { blockchain: this.props.account.blockchain, ...data };
    this.props.editAccount(updated)
      .then((result: any) => {
        this.setState({ edit: false });
      });
  }

  public cancelEdit = () => {
    this.setState({ edit: false });
  }

  public render () {
    const {
      account, classes, t
    } = this.props;
    const {
      showFiat, goBack, createTx, showReceiveDialog
    } = this.props;
    // TODO: show pending balance too
    // TODO: we convert Wei to TokenUnits here
    const acc = {
      balance: account.balance,
      id: account.id,
      description: account.description,
      name: account.name,
      hdpath: account.hdpath,
      hardware: account.hardware || false,
      blockchain: account.blockchain
    };

    const { coinTicker } = blockchainByName(acc.blockchain).params;
    const renderTitle = () => (<ChainTitle chain={acc.blockchain} text={'Account'} />);
    return (
      <div>
        <Page title={renderTitle()} leftIcon={<Back onClick={goBack}/>}>
          <div style={{ display: 'flex', alignItems: 'center', paddingBottom: '20px' }}>
            <div style={{ flexGrow: 2 }}>
              <FormRow
                leftColumn={<div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <IdentityIcon id={acc.id}/>
                </div>}
                rightColumn={(
                  <React.Fragment>
                    {!this.state.edit && (
                      <AddressAvatar
                        editable={true}
                        address={acc.id}
                        name={acc.name}
                        onEditClick={this.handleEdit}
                        addressProps={{ hideCopy: false }}
                      />
                      )}
                    {this.state.edit && (
                      <InlineEdit
                        placeholder='Account name'
                        initialValue={acc.name}
                        id={acc.id}
                        onSave={this.handleSave}
                        onCancel={this.cancelEdit}
                      />
                      )}
                  </React.Fragment>
                )}
              />
              <FormRow
                rightColumn={
                  acc.balance && (
                    <Balance
                      showFiat={showFiat}
                      coinsStyle={{ fontSize: '20px', lineHeight: '24px' }}
                      balance={acc.balance}
                      decimals={18}
                      symbol={coinTicker}
                    />
                  )}
              />
              <FormRow
                rightColumn={this.props.tokens}
              />
              {acc.hardware
              && <FormRow
                leftColumn={<span>HD Path</span>}
                rightColumn={<div>{acc.hdpath}</div>}
              /> }
              <FormRow
                rightColumn={(
                  <div>
                    <ButtonGroup>
                      <Button
                        primary={true}
                        label='Deposit'
                        onClick={showReceiveDialog}
                      />
                      <Button
                        primary={true}
                        label={t('accounts.show.send')}
                        onClick={createTx}
                      />
                      <AccountActions account={account}/>
                    </ButtonGroup>
                  </div>
                )}
              />
            </div>

            <div className={classes.qrCodeContainer}>
              <QRCode value={acc.id}/>
            </div>
          </div>
        </Page>

        <div className={classes.transContainer}>
          {this.props.txList}
        </div>
      </div>
    );
  }
}

export default withStyles(styles)(withTranslation('translation')(AccountShow));
