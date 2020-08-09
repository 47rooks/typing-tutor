import TypingDb from '../../../src/database/TypingDb.js';

const expect = chai.expect;

describe('datatbase.TypingDb unit tests', () => {
  // beforeEach(() => {
  // });

  // afterEach(() => {
  // });

  it('creates a db object', () => {
    const db = new TypingDb('testdb1', 1);
    expect(db.dbName).to.equal('testdb1');
    expect(db.version).to.equal(1);
  });
});
