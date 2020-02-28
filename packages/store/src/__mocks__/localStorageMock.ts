const localStorageMock = (function () {
  let store: {[key: string]: any} = {};
  return {
    getItem (key: string) {
      return store[key];
    },
    setItem (key: string, value: any) {
      store[key] = value.toString();
    },
    clear () {
      store = {};
    },
    removeItem (key: string) {
      delete store[key];
    }
  };
}());

Object.defineProperty(window, 'localStorage', { value: localStorageMock });
