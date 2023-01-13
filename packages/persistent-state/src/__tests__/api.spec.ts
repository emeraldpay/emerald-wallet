import { tempPath } from './_commons';
import { PersistentStateManager } from '../api';

describe('API Access', () => {
  test('open', async () => {
    new PersistentStateManager(tempPath('open'));
  });

  test('open and close', async () => {
    const manager = new PersistentStateManager(tempPath('open'));
    manager.close();
  });
});
