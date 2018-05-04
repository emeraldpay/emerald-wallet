import Immutable from 'immutable';
import ActionTypes from './actionTypes';

const initial = Immutable.fromJS({
  addressBook: [],
  loading: false,
});

const initialContact = Immutable.Map({
  name: null,
  address: null,
  description: null,
});

function addAddress(state, address) {
  return state.update('addressBook', (addresses) =>
    addresses.push(initialContact.merge(address))
  );
}

function updateAddress(state, id, f) {
  return state.update('addressBook', (addresses) => {
    const pos = addresses.findKey((addr) => addr.get('id') === id);
    if (pos >= 0) {
      return addresses.update(pos, f);
    }
    return addresses;
  });
}

function onLoading(state, action) {
  switch (action.type) {
    case ActionTypes.LOADING:
      return state
        .set('loading', true);
    default:
      return state;
  }
}

function onSetAddressBook(state, action) {
  switch (action.type) {
    case ActionTypes.SET_BOOK:
      return state
        .set('addressBook',
          Immutable.fromJS(action.addressBook || [])
        )
        .set('loading', false);
    default:
      return state;
  }
}

function onAddAddress(state, action) {
  if (action.type === ActionTypes.ADD_ADDRESS) {
    return addAddress(state, {
      address: action.address,
      name: action.name,
      description: action.description,
    });
  }
  return state;
}

function onUpdateAddress(state, action) {
  if (action.type === ActionTypes.UPDATE_ADDRESS) {
    return updateAddress(state, action.addressId, (addr) =>
      addr.merge({
        name: action.name,
        id: action.addressId,
        description: action.description,
      })
    );
  }
  return state;
}

function onDeleteAddress(state, action) {
  if (action.type === ActionTypes.DELETE_ADDRESS) {
    return state.update('addressBook', (addresses) => {
      const pos = addresses.findKey((addr) => addr.get('address') === action.address);
      return addresses.delete(pos);
    });
  }
  return state;
}

export default function reducer(state, action) {
  state = state || initial;
  state = onLoading(state, action);
  state = onSetAddressBook(state, action);
  state = onAddAddress(state, action);
  state = onUpdateAddress(state, action);
  state = onDeleteAddress(state, action);
  return state;
}
