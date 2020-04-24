import CategoryLogger from './CategoryLogger';
import DefaultLogger from './DefaultLogger';

describe('CategoryLogger', () => {
  it('should work', () => {
    const provider = () => new DefaultLogger();
    const logger = new CategoryLogger(provider, 'section');
    logger.info('Some info', { name: 'some obj' });
  });
});
