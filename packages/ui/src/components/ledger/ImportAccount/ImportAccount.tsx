import * as React from 'react';
import {Page, ButtonGroup} from '@emeraldplatform/ui';
import {AddCircle as AddIcon, Back} from '@emeraldplatform/ui-icons';

import Button from '../../common/Button';
import HdPath from '../../common/HdPath';
import Pager from '../../common/Pager';
import FormRow from '../../common/FormRow';
import AddrList from './AddressList';
import {LedgerAddress} from "./AddressList/types";

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
  onAddSelected?(): void;
  changeBaseHD?(): void;
  setSelectedAddr?(address: string): void;
  accounts?: any;
  addresses?: any;
  balanceRender?: any;
  selected: boolean;
  selectedAddress?: any;
  hdbase: string;
  pagerOffset?: number;
  setPagerOffset?(offset: number): void;
}

class ImportAccount extends React.Component<Props> {
  componentDidMount() {
    if (this.props.onInit) {
      this.props.onInit();
    }
  }

  render() {
    const {
      hdbase, changeBaseHD, selected, selectedAddress, setSelectedAddr, accounts, addresses, balanceRender,
    } = this.props;
    const {onAddSelected, onCancel, onBack} = this.props;

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
              <HdPath value={hdbase} onChange={changeBaseHD}/>
              <div style={{marginLeft: '5px'}}>
                <Pager offset={this.props.pagerOffset} setOffset={this.props.setPagerOffset}/>
              </div>
            </React.Fragment>
          }
        />
        <div style={styles.row}>
          <AddrList
            setSelectedAddr={setSelectedAddr}
            accounts={accounts}
            addresses={newAddresses}
            balanceRender={balanceRender}
          />
        </div>
        <div style={styles.row}>
          <ButtonGroup>
            <Button
              label="Add Selected"
              disabled={!selected}
              primary={true}
              onClick={onAddSelected}
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
