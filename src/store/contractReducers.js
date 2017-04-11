import Immutable from 'immutable';

const initial = Immutable.fromJS({
    contracts: [],
    loading: false,
});

const initialContract = Immutable.Map({
    address: null,
    name: null,
    abi: null,
});

function addContract(state, address, name, abi) {
    return state.update('contracts', (contracts) =>
        contracts.push(initialContract.merge({ address, name, abi }))
    );
}

function onLoading(state, action) {
    switch (action.type) {
        case 'CONTRACT/LOADING':
            return state
                .set('loading', true);
        default:
            return state;
    }
}

function onSetContractList(state, action) {
    switch (action.type) {
        case 'CONTRACT/SET_LIST':
            return state
                .set('contracts',
                    Immutable.fromJS(action.contracts || [])
                )
                .set('loading', false);
        default:
            return state;
    }
}

function onAddContract(state, action) {
    if (action.type === 'CONTRACT/ADD_CONTRACT') {
        return addContract(state, action.address, action.name, action.abi);
    }
    return state;
}

export default function contractReducers(state, action) {
    state = state || initial;
    state = onLoading(state, action);
    state = onSetContractList(state, action);
    state = onAddContract(state, action);
    return state;
}
