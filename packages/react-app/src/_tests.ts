import {IState} from "@emeraldwallet/store";

// USE:
//
// const wrapper = mount(
//       <Provider store={createTestStore()}>
//         ...
//       </Provider>
// );
//

export function createTestStore(state?: Partial<IState>): any {
  return {
    dispatch() {
    },
    subscribe() {
      return () => {
      };
    },
    replaceReducer() {
    },
    getState() {
      return state || {}
    }
  }
}