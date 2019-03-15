require('es6-promise').polyfill();

class RemoteGeth {
  constructor(host, port) {
    this.host = host;
    this.port = port;
  }

  getHost() {
    return this.host;
  }

  getPort() {
    return this.port;
  }
}

class NoneGeth {

}

module.exports = {
  NoneGeth,
  RemoteGeth,
};
