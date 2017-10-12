import React from 'react';

import styles from './tokenBalances.scss';

const TokenBalances = ({ balances }) => {
    if (!balances) {
        return null;
    }
    return (
        <table className={ styles.table }>
            <tbody>
            { balances.map((token) => (
                <tr className={ styles.tableRow } key={ token.get('address') } >
                    <td className={ styles.tableColumn }>
                        { token.get('balance').getDecimalized() }
                    </td>
                    <td className={ styles.tableColumn }>
                        <span className={ styles.symbol }> { token.get('symbol') }</span>
                    </td>
                </tr>))
            }
            </tbody>
        </table>);
};

export default TokenBalances;
