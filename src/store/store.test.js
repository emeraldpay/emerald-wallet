import { createStore } from './store';

describe('store', () => {
  it('should create store with dependecy', () => {
    const store = createStore(null);
    expect(store).toBeDefined();
  });
});
