// require('es6-promise').polyfill();
// const { NodeChecker } = require('@emeraldplatform/eth-node');
// const log = require('./logger');
//
// function check(url, serverConnect) {
//   const checker = new NodeChecker(serverConnect.connectEth(url));
//   return checker.check();
// }
//
// function waitRpc(url, serverConnect) {
//   const checker = new NodeChecker(serverConnect.connectEth(url));
//   return new Promise((resolve, reject) => {
//     const retry = (n) => {
//       checker.exists().then((clientVersion) => resolve(clientVersion)).catch(() => {
//         if (n > 0) {
//           log.debug(`RPC ${url} not exists, going retry after 1000 ms`);
//           setTimeout(() => retry(n - 1), 1000);
//         } else {
//           reject(new Error('Not Connected'));
//         }
//       });
//     };
//     retry(30);
//   });
// }
//
// module.exports = {
//   check,
//   waitRpc,
// };
