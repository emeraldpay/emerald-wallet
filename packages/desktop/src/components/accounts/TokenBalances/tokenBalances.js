import React from 'react';
import withStyles from 'react-jss';

const styles2 = {
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

const TokenBalances = ({ classes, balances }) => {
  if (!balances) {
    return null;
  }
  return (
    <table className={ classes.table }>
      <tbody>
        { balances.map((token) => (
          <tr className={ classes.tableRow } key={ token.get('address') } >
            <td className={ classes.tableColumn }>
              { token.get('balance').getDecimalized() }
            </td>
            <td className={ classes.tableColumn }>
              <span className={ classes.symbol }> { token.get('symbol') }</span>
            </td>
          </tr>))
        }
      </tbody>
    </table>);
};

export default withStyles(styles2)(TokenBalances);
