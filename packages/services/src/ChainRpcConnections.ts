export default class ChainRpcConnections {
  private connections: Map<any, any> = new Map();

  public add (chainCode: any, connection: any) {
    this.connections.set(chainCode.toLowerCase(), connection);
  }

  public chain (code: any) {
    code = code.toLowerCase();
    if (!this.connections.has(code)) {
      throw new Error(`Unsupported chain: ${code}`);
    }
    return this.connections.get(code);
  }
}
