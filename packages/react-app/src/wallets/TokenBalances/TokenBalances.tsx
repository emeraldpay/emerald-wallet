import { fromBaseUnits } from '@emeraldplatform/core';
import { withStyles } from '@material-ui/core/styles';
import * as React from 'react';

export const styles = {
  symbol: {
  },
  table: {
    fontSize: '16px'
  },
  tableColumn: {},
  tableRow: {
    height: '21.5px'
  }
};

export interface IProps {
  classes: any;
  balances: any[];
}

export const TokenBalances = ({ classes, balances }: IProps) => {
  if (!balances) {
    return null;
  }
  return (
    <table className={classes.table}>
      <tbody>
      { balances.map((token) => (
        <tr className={classes.tableRow} key={token.tokenId}>
          <td className={classes.tableColumn}>
            {fromBaseUnits(token.unitsValue, token.decimals).toString()}
          </td>
          <td className={classes.tableColumn}>
            <span className={classes.symbol}> {token.symbol}</span>
          </td>
        </tr>
      ))}
      </tbody>
    </table>
  );
};

export default withStyles(styles)(TokenBalances);
