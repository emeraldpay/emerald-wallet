import Immutable from 'immutable';

const initial = Immutable.fromJS({
  contracts: [],
  loading: false,
});

const initialContract = Immutable.Map({
  address: null,
  name: null,
  abi: null,
  version: null,
  options: [],
  txhash: null,
});

function addContract(state, address, name, abi, version, options, txhash) {
  return state.update('contracts', (contracts) =>
    contracts.push(initialContract.merge({ address, name, abi, version, options, txhash }))
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
    return addContract(state,
      action.address,
      action.name,
      action.abi,
      action.version,
      action.options,
      action.txhash);
  }
  return state;
}

function updateContract(state, txhash, f) {
  return state.update('contracts', (contracts) => {
    const pos = contracts.findKey((contract) => contract.get('txhash') === txhash);
    if (pos >= 0) {
      return contracts.update(pos, f);
    }
    return contracts;
  });
}

function onUpdateContract(state, action) {
  if (action.type === 'CONTRACT/UPDATE_CONTRACT') {
    return updateContract(state, action.tx.hash, (contract) =>
      contract.set('address', action.address)
    );
  }
  return state;
}

export default function contractReducers(state, action) {
  state = state || initial;
  state = onLoading(state, action);
  state = onSetContractList(state, action);
  state = onAddContract(state, action);
  state = onUpdateContract(state, action);
  return state;
}
