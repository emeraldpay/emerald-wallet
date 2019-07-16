import * as React from 'react';
import {Page, ButtonGroup} from '@emeraldplatform/ui';
import {AddCircle as AddIcon, Back} from '@emeraldplatform/ui-icons';

import Button from '../../common/Button';
import HdPath from '../../common/HdPath';
import Pager from '../../common/Pager';
import FormRow from '../../common/FormRow';
import AddrList from './AddressList';
import {LedgerAddress} from "./AddressList/types";
import ChainSelector from "../../common/ChainSelector";
import {Blockchain} from "@emeraldwallet/core";
import {IApi} from "@emeraldwallet/core";

const styles = {
  row: {
    marginLeft: '14.75px',
    marginRight: '14.75px',
  },
};

interface Props {
  onInit?(): void;
  onBack?(): void;
  onCancel?(): void;
  onAddSelected?(blockchain: string): void;
  changeBaseHD?(): void;
  setSelectedAddr?(address: string): void;
  accounts?: any;
  addresses?: any;
  selected: boolean;
  selectedAddress?: any;
  hdbase: string;
  pagerOffset?: number;
  blockchains: Blockchain[]
  setPagerOffset?(offset: number): void;
  api: IApi
}

interface State {
  blockchain?: string
}

class ImportAccount extends React.Component<Props, State> {

  constructor(props: Readonly<Props>) {
    super(props);
    const blockchain = props.blockchains.length > 0 ? props.blockchains[0].params.code : 'ETH';
    this.state = {blockchain: blockchain};
  }

  componentDidMount() {
    if (this.props.onInit) {
      this.props.onInit();
    }
  }

  chainSelected(blockchain: string) {
    this.setState({
      blockchain: blockchain
    });
  }

  addSelected() {
    this.props.onAddSelected(this.state.blockchain.toLowerCase());
  }

  render() {
    const {
      hdbase, changeBaseHD, selected, selectedAddress, setSelectedAddr, accounts, addresses,
    } = this.props;
    const {onAddSelected, onCancel, onBack, blockchains, api } = this.props;
    const { blockchain } = this.state;

    // mark each address whether it selected or not
    const newAddresses = addresses.map((a: LedgerAddress) => ({...a, selected: a.address === selectedAddress}));

    return (
      <Page title="Import Ledger hardware account" leftIcon={<Back onClick={onBack}/>}>
        <FormRow
          leftColumn={
            <div style={{fontSize: '16px', textAlign: 'right'}}>HD derivation path</div>
          }
          rightColumn={
            <React.Fragment>
              <ChainSelector chains={blockchains} value={blockchain} onChange={this.chainSelected.bind(this)}/>
              <HdPath value={hdbase} onChange={changeBaseHD}/>
              <div style={{marginLeft: '5px'}}>
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
              label="Add Selected"
              disabled={!selected}
              primary={true}
              onClick={this.addSelected.bind(this)}
              icon={<AddIcon/>}
            />
            <Button
              label="Cancel"
              onClick={onCancel}
            />
          </ButtonGroup>
        </div>
      </Page>
    );
  }
}

export default ImportAccount;
