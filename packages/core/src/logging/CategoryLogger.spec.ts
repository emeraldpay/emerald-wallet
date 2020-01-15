import CategoryLogger from './CategoryLogger';
import DefaultLogger from './DefaultLogger';

describe('CategoryLogger', () => {
  it('should work', () => {
    const logger = new CategoryLogger(new DefaultLogger(), 'section');
    logger.info('Some info', { name: 'some obj' });
  });
});
