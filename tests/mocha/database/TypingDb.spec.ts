import TypingDb from '../../../src/database/TypingDb';
import { Suite } from 'mocha';

const expect = chai.expect;
const TEST_DB1_NAME = 'testdb1';

describe('database.TypingDb unit tests', function (this: Suite) {
  let testdb1_name: string;
  console.log(this);
  // FIXME Note that if beforeEach fails all subsequent tests in the suite will NOT be run.
  // This is bad and I don't know of any workaround.
  beforeEach(() => {
    // console.log(`beforeEach: ${this.ctx.currentTest?.parent?.titlePath()}`);
    console.log(`starting test: ${this.ctx.currentTest?.title}`);
    indexedDB.deleteDatabase(testdb1_name);
  });

  afterEach(() => {
    console.log(`ending test: ${this.ctx.currentTest?.title}`);
  });

  after(() => {
    // Delete the test database after the last test so that the browser indexedDB storage is
    // not polluted by the db once the tests finish.
    indexedDB.deleteDatabase(testdb1_name);
  });

  it('creates a db object', () => {
    let db: TypingDb | undefined = new TypingDb(TEST_DB1_NAME, 1);
    expect(db.dbName).to.equal(TEST_DB1_NAME);
    expect(db.version).to.equal(1);
  });

  it('tests open - verifies the db creation', async () => {
    let tDb: TypingDb | undefined = new TypingDb(TEST_DB1_NAME, 1);
    console.log('in the test open test');
    await tDb.open().then(() => {
      console.log(`Got database with this ${tDb?.db.name}`);
      let storeNames: string[] = [];
      if (tDb?.db?.objectStoreNames) {
        storeNames = Array.from(tDb.db.objectStoreNames);
      }
      console.log(`Contains these stores: ${storeNames}`);
      expect(storeNames.length).to.equal(1);
      expect(storeNames).to.include.all.members(['library']);
      expect(1).to.equal(storeNames);
    });
  });

  it('verifies open() fail exception', () => {

  });

  it('closes the db', () => {
    let tDb: TypingDb | undefined = new TypingDb(TEST_DB1_NAME, 1);
    tDb.open().then(() => {
      tDb?.close().then(() => {
        let storeNames: string[] = [];
        if (tDb?.db?.objectStoreNames) {
          storeNames = Array.from(tDb.db.objectStoreNames);
        }
        console.log(`Contains these stores: ${storeNames}`);
      });

    });
  });

  it('gets the Library store', () => {

  });

  it('is a silly test', () => {
    const foo = 1;
    expect(1).to.equal(foo);
  });
});
