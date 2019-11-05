import { ButtonGroup, Page } from '@emeraldplatform/ui';
import { AddCircle as AddIcon, Back } from '@emeraldplatform/ui-icons';
import { Blockchain, BlockchainCode, IApi } from '@emeraldwallet/core';
import {
  Button, ChainSelector, FormRow, HdPath, Pager
} from '@emeraldwallet/ui';
import * as React from 'react';

import AddrList from './AddressList';
import { LedgerAddress } from './AddressList/types';

const styles = {
  row: {
    marginLeft: '14.75px',
    marginRight: '14.75px'
  }
};

interface IImportAccProps {
  accounts?: any;
  addresses?: any;
  selected: boolean;
  selectedAddress?: any;
  hdbase: string;
  pagerOffset?: number;
  blockchains: Blockchain[];
  api: IApi;
  onInit? (): void;
  onBack? (): void;
  onCancel? (): void;
  onAddSelected? (blockchain: string): void;
  changeBaseHD? (): void;
  setSelectedAddr? (address: string): void;
  setPagerOffset? (offset: number): void;
}

interface IState {
  blockchain: BlockchainCode;
}

class ImportAccount extends React.Component<IImportAccProps, IState> {

  constructor (props: Readonly<IImportAccProps>) {
    super(props);
    const blockchain = props.blockchains.length > 0 ? props.blockchains[0].params.code : BlockchainCode.ETH;
    this.state = { blockchain };
  }

  public componentDidMount () {
    if (this.props.onInit) {
      this.props.onInit();
    }
  }

  public chainSelected (blockchain: BlockchainCode) {
    this.setState({
      blockchain
    });
  }

  public handleAddSelected = () => {
    if (this.props.onAddSelected) {
      this.props.onAddSelected(this.state.blockchain);
    }
  }

  public render () {
    const {
      hdbase, changeBaseHD, selected, selectedAddress, setSelectedAddr, accounts, addresses
    } = this.props;
    const { onCancel, onBack, blockchains, api } = this.props;
    const { blockchain } = this.state;

    // mark each address whether it selected or not
    const newAddresses = addresses.map((a: LedgerAddress) => ({ ...a, selected: a.address === selectedAddress }));

    return (
      <Page title='Import Ledger hardware account' leftIcon={<Back onClick={onBack}/>}>
        <FormRow
          rightColumn={(
            <ChainSelector chains={blockchains} value={blockchain} onChange={this.chainSelected.bind(this)}/>
          )}
        />
        <FormRow
          leftColumn={
            <div style={{ fontSize: '16px', textAlign: 'right' }}>HD derivation path</div>
          }
          rightColumn={
            <React.Fragment>
              <HdPath value={hdbase} onChange={changeBaseHD}/>
              <div style={{ marginLeft: '5px' }}>
                <Pager offset={this.props.pagerOffset} setOffset={this.props.setPagerOffset}/>
              </div>
            </React.Fragment>
          }
        />
        <div style={styles.row}>
          <AddrList
            blockchain={blockchain}
            setSelectedAddr={setSelectedAddr}
            accounts={accounts}
            addresses={newAddresses}
            api={api}
          />
        </div>
        <div style={styles.row}>
          <ButtonGroup>
            <Button
              label='Add Selected'
              disabled={!selected}
              primary={true}
              onClick={this.handleAddSelected}
              icon={<AddIcon/>}
            />
            <Button
              label='Cancel'
              onClick={onCancel}
            />
          </ButtonGroup>
        </div>
      </Page>
    );
  }
}

export default ImportAccount;
