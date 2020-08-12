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

  // FIXME This may have to go. Is there an idea of the stores on the TypingDb object ?
  // It's not the same as the objectStores in the IndexedDB.
  // And if there is what use is it to the callers.
  // it('tests open - verifies the db creation', async () => {
  //   let tDb: TypingDb | undefined = new TypingDb(TEST_DB1_NAME, 1);
  //   console.log('in the test open test');
  //   await tDb.open().then(() => {
  //     console.log(`Got database with this ${tDb?.db.name}`);
  //     let storeNames: string[] = [];
  //     if (tDb?.db?.objectStoreNames) {
  //       storeNames = Array.from(tDb.db.objectStoreNames);
  //     }
  //     console.log(`Contains these stores: ${storeNames}`);
  //     expect(storeNames.length).to.equal(1);
  //     expect(storeNames).to.include.all.members(['library']);
  //   });
  // });

  it('verifies open() fail exception', () => {

  });

  it('closes the db', async () => {
    let tDb: TypingDb | undefined = new TypingDb(TEST_DB1_NAME, 1);
    await tDb.close().then(() => {
      expect(true).to.be.true;
    });
  });

  it('closes the db and then get Library', async () => {
    let tDb: TypingDb = new TypingDb(TEST_DB1_NAME, 1);
    await tDb.close().then((db) => {
      db.getLibrary().
        then((lib) => {
          expect(typeof lib).to.be('Library');
        })
    });
  });

  it('gets the Library store', async () => {
    let tDb: TypingDb | undefined = new TypingDb(TEST_DB1_NAME, 1);
    await tDb.getLibrary().
      then((lib) => {
        expect(tDb?.db).to.equal(lib?.db);
      });
  });

  it('stores an entry in the library', async () => {
    let tDb: TypingDb | undefined = new TypingDb(TEST_DB1_NAME, 1);
    await tDb.getLibrary().
      then((lib) => {
        lib.addUpdateEntry('ent1', 'This is the first text').
          then((lib) => lib.loadLibraryTextNames()).
          then((texts) => {
            console.log('Got this:');
            console.log(texts);
            expect(texts).to.deep.equal(['ent1']);
          });
      });
  });

  it('stores two entries in the library', async () => {
    let tDb: TypingDb | undefined = new TypingDb(TEST_DB1_NAME, 1);
    await tDb.getLibrary().
      then((lib) => {
        lib.addUpdateEntry('ent1', 'This is the first text').
          then((lib) => {
            lib.addUpdateEntry('ent2', 'This is the second text').
              then((lib) => lib.loadLibraryTextNames()).
              then((texts) => {
                console.log('Got this:');
                console.log(texts);
                expect(texts).to.deep.equal(['ent1', 'ent2']);
              });
          });
      });
  });

  it('it loads a library text in full', async () => {
    let tDb: TypingDb | undefined = new TypingDb(TEST_DB1_NAME, 1);
    await tDb.getLibrary().
      then((lib) => {
        lib?.addUpdateEntry('ent1', 'This is the first text').
          then((lib) => lib.loadLibraryTextById('ent1')).
          then((text) => {
            expect(text).to.deep.equal({ id: 'ent1', text: 'This is the first text' });
          });
      });
  });

  it('updates an existing entry', async () => {
    let tDb: TypingDb | undefined = new TypingDb(TEST_DB1_NAME, 1);
    await tDb.getLibrary().
      then((lib) => {
        lib?.addUpdateEntry('ent1', 'This is the first text').
          then((lib) => {
            lib.addUpdateEntry('ent1', 'This is the first text rewritten').
              then((lib) => lib.loadLibraryTextById('ent1')).
              then((text) => {
                expect(text).to.deep.equal({ id: 'ent1', text: 'This is the first text rewritten' });
              });
          });
      });
  });

  it('deletes a library entry', () => {
  });
});

