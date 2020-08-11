import TypingDb from '../../../src/database/TypingDb';
import { Suite } from 'mocha';

const expect = chai.expect;
const TEST_DB1_NAME = 'testdb1';

async function deleteDatabase(): Promise<any> {
  return new Promise<any>((resolve, reject) => {
    const dReq = indexedDB.deleteDatabase(TEST_DB1_NAME);
    dReq.onerror = function (event) {
      console.log("Error deleting database.");
    };

    dReq.onsuccess = function (event) {
      console.log("Database deleted successfully");
      resolve();
    };

    dReq.onblocked = function (event: Event) {
      console.log("Database delete blocked");
      console.log(event.returnValue); // should be undefined
      reject(event.returnValue);
    };
  });
}

describe('database.TypingDb unit tests', function (this: Suite) {
  // FIXME Note that if beforeEach fails all subsequent tests in the suite will NOT be run.
  // This is bad and I don't know of any workaround.
  beforeEach(async () => {
    // console.log(`beforeEach: ${this.ctx.currentTest?.parent?.titlePath()}`);
    console.log(`starting test: ${this.ctx.currentTest?.title}`);

    await deleteDatabase();
    console.log('DB deleted');
  });

  afterEach(() => {
    console.log(`ending test: ${this.ctx.currentTest?.title}`);
  });

  after(async () => {
    console.log('after(). Starting ...');
    // Delete the test database after the last test so that the browser indexedDB storage is
    // not polluted by the db once the tests finish.
    await deleteDatabase();
    console.log('after(). Ending');
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
    });
  });

  it('verifies open() fail exception', () => {

  });

  it('closes the db', async () => {
    let tDb: TypingDb | undefined = new TypingDb(TEST_DB1_NAME, 1);
    await tDb.open().then(async () => {
      await tDb?.close().then(() => {
        expect(true).to.be.true;
      });
    });
  });

  it('gets the Library store', async () => {
    let tDb: TypingDb | undefined = new TypingDb(TEST_DB1_NAME, 1);
    await tDb.open().then(() => {
      const lib = tDb?.getLibrary();
      expect(tDb?.db).to.equal(lib?.db);
    });
  });

  it('stores an entry in the library', async () => {
    let tDb: TypingDb | undefined = new TypingDb(TEST_DB1_NAME, 1);
    await tDb.open().
      then(() => {
        const lib = tDb?.getLibrary();
        lib?.addEntry('ent1', 'This is the first text');
        console.log('added entry');
      }).
      then(() => tDb?.getLibrary().loadLibraryTextNames()).
      then((texts) => {
        console.log('Got this:');
        console.log(texts);
        expect(texts).to.deep.equal(['ent1']);
      });
  });

  it('stores two entries in the library', async () => {
    let tDb: TypingDb | undefined = new TypingDb(TEST_DB1_NAME, 1);
    await tDb.open().
      then(() => {
        const lib = tDb?.getLibrary();
        lib?.addEntry('ent1', 'This is the first text');
        console.log('added entry');
      }).
      then(() => {
        const lib = tDb?.getLibrary();
        lib?.addEntry('ent2', 'This is the second text');
        console.log('added entry');
      }).
      then(() => tDb?.getLibrary().loadLibraryTextNames()).
      then((texts) => {
        console.log('Got this:');
        console.log(texts);
        expect(texts).to.deep.equal(['ent1', 'ent2']);
      });
  });

  it('updates an existing entry', () => {

  });

  it('deletes a library entry', () => {
  });

  it('it loads a library text in full', () => {

  });
});
