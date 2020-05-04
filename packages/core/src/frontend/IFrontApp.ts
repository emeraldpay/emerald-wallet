export default interface IFrontApp {
  /***
   * Send an asynchronous message to renderer process via `channel`, you can also
   * send arbitrary arguments. Arguments will be serialized in JSON internally and
   * hence no functions or prototype chain will be included.
   */
  send (channel: string, ...args: any[]): void;
}
