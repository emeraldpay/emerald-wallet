import CategoryLogger from './CategoryLogger';
import DefaultLogger from './DefaultLogger';
import ILogger from './ILogger';

describe('CategoryLogger', () => {
  it('should work', () => {
    const provider = (): ILogger => new DefaultLogger();

    const logger = new CategoryLogger(provider, 'section');

    logger.info('Some info', { name: 'some obj' });
  });
});
