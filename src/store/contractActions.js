import { rpc } from '../lib/rpcapi';

export function loadContractList() {
    return (dispatch) => {
        dispatch({
            type: 'CONTRACT/LOADING',
        });
        rpc('emerald_contracts', []).then((json) => {
            dispatch({
                type: 'CONTRACT/SET_LIST',
                contracts: json.result,
            });
            // load Contract details?
        });
    };
}