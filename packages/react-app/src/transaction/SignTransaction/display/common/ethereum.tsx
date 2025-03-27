import {workflow} from '@emeraldwallet/core';
import {FormLabel, FormRow} from '@emeraldwallet/ui';
import * as React from 'react';
import {Amount} from '../components';
import {Data, DataProvider, Handler} from '../types';
import {CommonDisplay} from './common';
import {Tooltip} from "@mui/material";
import {InfoOutlined} from "@mui/icons-material";

type EthereumData = Data<workflow.AnyEthereumCreateTx>;

const styles = {
  row: {
    alignItems: "baseline",
  },
  info: {
    marginLeft: "10px",
    height: "16px",
  }
}

export abstract class EthereumCommonDisplay extends CommonDisplay {
  readonly data: EthereumData;

  constructor(data: EthereumData, dataProvider: DataProvider, handler: Handler) {
    super(data, dataProvider, handler);

    this.data = data;
  }

  abstract render(): React.ReactElement;

  renderFees(): React.ReactElement {
    const {createTx} = this.data;
    const {getFiatAmount} = this.dataProvider;

    const fees = createTx.getFees();
    const gasLimit = createTx.gas;

    // for a standard ether transfer we know that it would cost exactly 21_000 gas
    // but if the value is set to something different it means it a contract call, and it this case it actually
    // defines just the upper limit.
    let gasLimitIsDefined = false;
    if (gasLimit == 21_000) {
      gasLimitIsDefined = true;
    }

    return (
      <FormRow style={styles.row}>
        <FormLabel top={2}>{gasLimitIsDefined ? "Fee" : "Maximum Fee" }</FormLabel>
        <Amount amount={fees} fiatAmount={getFiatAmount(fees)}/>
        <Tooltip title={
          gasLimitIsDefined ? "Pay for Gas " + gasLimit + " of Gas" : "Pay for Gas Limited to " + gasLimit + " of Gas"
        }>
          <InfoOutlined color={"secondary"} style={styles.info}/>
        </Tooltip>
      </FormRow>
    );
  }
}
