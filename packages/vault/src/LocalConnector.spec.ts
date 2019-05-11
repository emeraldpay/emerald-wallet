import LocalConnector from './LocalConnector';

describe('LocalConnector', () => {
  it('should be created with default logger', () => {
    const conn = new LocalConnector("");
    expect(conn).toBeDefined();
    expect(conn.log).toBeDefined();
  })
});
