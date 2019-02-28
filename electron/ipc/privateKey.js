const { ipcMain } = require('electron'); // eslint-disable-line import/no-extraneous-dependencies
const { EthAccount } = require('@emeraldplatform/eth-account');

module.exports = () => {
  ipcMain.on('get-private-key', (event, {keyfile, passphrase}) => {
    const wallet = EthAccount.fromV3(keyfile, passphrase);
    const privateKey = wallet.getPrivateKeyString();
    event.sender.send('recieve-private-key', privateKey);
  });

  ipcMain.on('get-private-key-to-keyfile', (event, {privateKey, password}) => {
    const keyfile = EthAccount.fromPrivateKey(privateKey).toV3String(password);
    event.sender.send('recieve-private-key-to-keyfile', keyfile);
  });
};
