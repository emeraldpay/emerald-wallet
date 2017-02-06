import 'whatwg-fetch'

const url = "http://localhost:8545";
const headers = {
    'Content-Type': 'application/json'
};

export function loadAccountsList() {
    return function (dispatch) {
        dispatch({
            type: 'ACCOUNT/LOADING'
        });
        const data = {
            "jsonrpc": "2.0",
            "method": "eth_accounts",
            "params": [],
            "id": 1
        };
        fetch(url, {method: 'POST', headers: headers, body: JSON.stringify(data)})
            .then((response) => response.json())
            .then((json) => {
                dispatch({
                    type: 'ACCOUNT/SET_LIST',
                    accounts: json.result
                })
            });
    }
}