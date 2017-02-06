export function loadAccountsList() {
    return function (dispatch) {
        dispatch({
            type: 'ACCOUNT/LOADING'
        });
        dispatch({
            type: 'ACCOUNT/SET_LIST',
            accounts: []
        })
    }
}