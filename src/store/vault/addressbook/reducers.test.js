import reducer from './reducers';

describe('Addressbook/reducers', () => {
  it('should delete contact on ADDRESS/DELETE_ADDRESS', () => {
    let state = reducer(null, {
      type: 'ADDRESS/ADD_ADDRESS',
      name: 'name1',
      address: '0x123',
      description: 'desc1',
    });
    console.log(state.toJS());
    expect(state.get('addressBook').toJS()).toHaveLength(1);

    state = reducer(state, {
      type: 'ADDRESS/DELETE_ADDRESS',
      address: '0x123',
    });

    expect(state.get('addressBook').toJS()).toHaveLength(0);
  });
});
