import * as React from 'react';
import {withStyles} from '@material-ui/styles';

export const styles = {
  table: {
    fontSize: '14px',
  },
  tableRow: {
    height: '21.5px',
  },
  tableColumn: {
  },
  symbol: {
    fontWeight: 500,
  },
};

export type Balances = Array<{
  address: string;
  symbol: string;
  balance: {
    value: string | number;
    decimals: number;
  }
}>;

export interface Props {
  classes: any;
  balances: Balances;
}

export const TokenBalances = ({ classes, balances }: Props) => {
  if (!balances) {
    return null;
  }
  return (
    <table className={ classes.table }>
      <tbody>
        { balances.map((token) => (
          <tr className={ classes.tableRow } key={ token.address } >
            <td className={ classes.tableColumn }>
              { token.balance.value }
            </td>
            <td className={ classes.tableColumn }>
              <span className={ classes.symbol }> { token.symbol }</span>
            </td>
          </tr>))
        }
      </tbody>
    </table>);
};

export default withStyles(styles)(TokenBalances);
