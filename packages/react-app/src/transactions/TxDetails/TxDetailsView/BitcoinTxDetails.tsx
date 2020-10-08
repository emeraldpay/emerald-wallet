import {connect} from "react-redux";
import {Dispatch} from "react";
import * as React from 'react';
import {Box, createStyles, Theme} from "@material-ui/core";
import {IState} from "@emeraldwallet/store";
import {makeStyles} from "@material-ui/core/styles";
import {BitcoinStoredTransaction, amountFactory} from "@emeraldwallet/core";
import {Balance, FormRow, TxRef, Address} from "@emeraldwallet/ui";
import {ClassNameMap} from "@material-ui/core/styles/withStyles";

const useStyles = makeStyles<Theme>((theme) =>
  createStyles({})
);

/**
 *
 */
const Component = (({transaction, classes}: Props & Actions & OwnProps) => {
  const styles = useStyles();
  const balanceFactory = amountFactory(transaction.blockchain);
  const inputs = transaction.inputs.map((input, i) =>
    <FormRow
      key={"input-" + i}
      leftColumn={<div className={classes?.fieldName}>{i == 0 ? "From" : ""}</div>}
      rightColumn={(
        <span>
          <TxRef txid={input.txid} vout={input.vout}/>
          <Balance balance={balanceFactory(input.amount)}/>
        </span>
      )}
    />
  );

  const outputs = transaction.outputs.map((output, i) =>
    <FormRow
      key={"output-" + i}
      leftColumn={<div className={classes?.fieldName}>{i == 0 ? "To" : ""}</div>}
      rightColumn={(
        <span>
          <Address address={output.address}/>
          <Balance balance={balanceFactory(output.amount)}/>
        </span>
      )}
    />
  )

  return <>
    {inputs}
    <br/>
    {outputs}
  </>
})

// State Properties
interface Props {
}

// Actions
interface Actions {
}

// Component properties
interface OwnProps {
  transaction: BitcoinStoredTransaction;
  classes?: Partial<ClassNameMap<ClassKey>>;
}

type ClassKey = 'fieldName' | 'txData';


export default connect(
  (state: IState, ownProps: OwnProps): Props => {
    return {}
  },
  (dispatch: Dispatch<any>, ownProps: OwnProps): Actions => {
    return {}
  }
)((Component));