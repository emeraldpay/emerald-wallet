import React from 'react';

const styles = {
  table: {
    fontSize: '14px',
  },

  tableRow: {
    height: '21.5px',
  },

  symbol: {
    fontWeight: '500',
  },
};

const TokenBalances = ({ balances }) => {
  if (!balances) {
    return null;
  }
  return (
    <table style={ styles.table }>
      <tbody>
        { balances.map((token) => (
          <tr style={ styles.tableRow } key={ token.get('address') } >
            <td style={ styles.tableColumn }>
              { token.get('balance').getDecimalized() }
            </td>
            <td>
              <span style={ styles.symbol }> { token.get('symbol') }</span>
            </td>
          </tr>))
        }
      </tbody>
    </table>);
};

export default TokenBalances;
