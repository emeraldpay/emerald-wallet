import screen from '../wallet/screen';

export default (store) => {
  return (next) => {
    return (action) => {
      const returnVal = next(action);
      if (!returnVal) { return returnVal; }

      if (returnVal.catch) {
        returnVal.catch((e) => {
          if (e.stack === 'TypeError: Failed to fetch') {
            // Hack because underlying fetch library issue:
            // https://github.com/github/fetch/issues/201#issuecomment-308213104
            const stack = `${e.stack} \n While processing action: \n ${action.toString()}`;
            e.stack = stack;
            console.error(e);
            return;
          }
          store.dispatch(screen.actions.showError(e));
        });
      }
      return returnVal;
    };
  };
};
