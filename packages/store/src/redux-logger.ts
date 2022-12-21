import ColorHash from 'color-hash';
import { Middleware } from 'redux';
import { createLogger } from 'redux-logger';

const LOGGING_MAX_STATE_DEPTH = 5;

const colorHash = new ColorHash({ lightness: [0.2, 0.3, 0.4, 0.5] });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toJs(state: any, depth = 0): any {
  if (depth >= LOGGING_MAX_STATE_DEPTH) {
    return state;
  }

  depth += 1;

  if (state == null) {
    return state;
  }

  if (typeof state.toJS === 'function') {
    return state.toJS();
  }

  if (state instanceof Array) {
    return state.map((item) => toJs(item, depth));
  }

  if (state instanceof Object) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return Object.keys(state).reduce((carry: any, key: string) => ({ ...carry, [key]: toJs(state[key], depth) }), {});
  }

  if (state instanceof Map) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: any = {};

    state.forEach((value, key) => {
      result[key] = toJs(value, depth);
    });

    return result;
  }

  if (state instanceof Set) {
    return toJs([...state.values()], depth);
  }

  return state;
}

export const reduxLogger: Middleware = createLogger({
  colors: {
    title(action) {
      return colorHash.hex(action.type.split('/')[0]);
    },
  },
  collapsed: true,
  diff: true,
  duration: true,
  stateTransformer: toJs,
  timestamp: false,
});
