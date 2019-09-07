import * as React from 'react';
import withStyles from 'react-jss';
import { WithTranslation, withTranslation } from 'react-i18next';
import * as QRCode from 'qrcode.react';
import { Back } from '@emeraldplatform/ui-icons';
import {
  Page, IdentityIcon, ButtonGroup, Account as AddressAvatar
} from '@emeraldplatform/ui';
import { Button, InlineEdit, FormRow } from '@emeraldwallet/ui';
import { blockchainByName } from '@emeraldwallet/core';

import AccountActions from '../AccountActions';
import Balance from '../../common/Balance';

export const styles = {
  transContainer: {
    marginTop: '20px',
  },
  qrCodeContainer: {
    flexBasis: '30%',
    backgroundColor: 'white',
  },
};

export interface Props {
  classes: any;
  showFiat: boolean;
  account: any;
  goBack?: any;
  editAccount?:any;
  createTx?: any;
  showReceiveDialog?: any;
  txList?: React.Component;
  tokens?: React.ReactElement;
}


type AccountShowProps = Props & WithTranslation;

export interface State {
  edit: boolean;
}

export class AccountShow extends React.Component<AccountShowProps, State> {

  constructor(props: AccountShowProps) {
    super(props);
    this.state = {
      edit: false,
    };
  }

  handleEdit = () => {
    this.setState({edit: true});
  };

  handleSave = (data: any) => {
    const updated = {blockchain: this.props.account.get('blockchain'), ...data};
    this.props.editAccount(updated)
      .then((result: any) => {
        this.setState({edit: false});
      });
  };

  cancelEdit = () => {
    this.setState({edit: false});
  };

  render() {
    const {
      account, classes, t,
    } = this.props;
    const {
      showFiat, goBack, createTx, showReceiveDialog,
    } = this.props;
    // TODO: show pending balance too
    // TODO: we convert Wei to TokenUnits here
    const balance = account.get('balance');
    const acc = {
      id: account.get('id'),
      description: account.get('description'),
      name: account.get('name'),
      hdpath: account.get('hdpath'),
      hardware: account.get('hardware', false),
      blockchain: account.get('blockchain'),
    };

    const { coinTicker } = blockchainByName(acc.blockchain).params;

    return (
      <div>
        <Page title="Account" leftIcon={<Back onClick={goBack}/>}>
          <div style={{display: 'flex', alignItems: 'center', paddingBottom: '20px'}}>
            <div style={{flexGrow: 2}}>
              <FormRow
                leftColumn={<div style={{display: 'flex', justifyContent: 'flex-end'}}>
                  <IdentityIcon id={acc.id}/>
                </div>}
                rightColumn={
                  <React.Fragment>
                    {!this.state.edit && <AddressAvatar
                      editable
                      address={acc.id}
                      name={acc.name}
                      onEditClick={this.handleEdit}
                      addressProps={{hideCopy: false}}
                    />}
                    {this.state.edit && <InlineEdit
                      placeholder="Account name"
                      initialValue={acc.name}
                      id={acc.id}
                      onSave={this.handleSave}
                      onCancel={this.cancelEdit}
                    />}
                  </React.Fragment>
                }
              />
              <FormRow
                rightColumn={
                  balance && <Balance
                    showFiat={showFiat}
                    coinsStyle={{fontSize: '20px', lineHeight: '24px'}}
                    balance={balance}
                    decimals={18}
                    symbol={coinTicker}
                  />
                }
              />
              <FormRow
                rightColumn={this.props.tokens}
              />
              {acc.hardware
              && <FormRow
                leftColumn={<span>HD Path</span>}
                rightColumn={acc.hdpath}
              /> }
              <FormRow
                rightColumn={
                  <div>
                    <ButtonGroup>
                      <Button
                        primary
                        label="Deposit"
                        onClick={showReceiveDialog}
                      />
                      <Button
                        primary
                        label={t('accounts.show.send')}
                        onClick={createTx}
                      />
                      <AccountActions account={account}/>
                    </ButtonGroup>
                  </div>
                }
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
