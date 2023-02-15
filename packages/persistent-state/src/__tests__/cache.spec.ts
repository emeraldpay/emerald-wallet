import { tempPath } from './_commons';
import { PersistentStateManager } from '../api';

describe('Cache', () => {
  let manager: PersistentStateManager;

  beforeEach(() => {
    manager = new PersistentStateManager(tempPath('cache'));
  });

  afterEach(() => {
    manager.close();
  });

  test('get nothing', async () => {
    const act = await manager.cache.get('test');

    expect(act).toBeNull();
  });

  test('set and get value without ttl', async () => {
    await manager.cache.put("test", "hello world");
    const act = await manager.cache.get('test');

    expect(act).toBe("hello world");
  });

  test('set and get value with ttl', async () => {
    await manager.cache.put("test", "hello world", 60);
    const act = await manager.cache.get('test');

    expect(act).toBe("hello world");
  });

  test('set and evict value', async () => {
    await manager.cache.put("test", "hello world");
    await manager.cache.evict("test")
    const act = await manager.cache.get('test');

    expect(act).toBeNull();
  });

})
