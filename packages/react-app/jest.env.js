/**
 * FIXME This class extends default JSDOM class to fix problem with different implementation of Uint8Array.
 */

const { default: JSDOMEnvironment } = require('jest-environment-jsdom');

module.exports = class extends JSDOMEnvironment {
  constructor(config, options) {
    super(config, options);

    this.global.Uint8Array = global.Uint8Array;
  }
};
