import { createLogger } from 'redux-logger';

const ColorHash = require('color-hash');

const colorHash = new ColorHash({
  lightness: [0.2, 0.3, 0.4, 0.5]
});

const LOGGING_MAX_STATE_DEPTH = 5;

const toJs = (state: any, depth: number = 0): any => {
  if (depth >= LOGGING_MAX_STATE_DEPTH) {
    return state;
  }

  depth += 1;

  if (!state) { return state; }
  if (typeof state.toJS === 'function') {
    return state.toJS();
  }
  if (state instanceof Array) {
    return state.map((item) => toJs(item, depth));
  }
  if (state instanceof Map) {
    const o: any = {};
    state.forEach((v, key) => {
      o[key] = toJs(v, depth);
    });
    return o;
  }
  if (state instanceof Object) {
    return Object.keys(state).reduce((o: any, key: string) => {
      o[key] = toJs(state[key], depth);
      return o;
    }, {});
  }

  return state;
};

const logger: any = createLogger({
  stateTransformer: toJs,
  diff: true,
  collapsed: true,
  duration: true,
  timestamp: false,
  colors: {
    title: (action: any) => colorHash.hex(action.type.split('/')[0])
  }
});

export default logger;
