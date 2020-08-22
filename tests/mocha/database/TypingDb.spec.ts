/* eslint-disable prefer-arrow-callback,arrow-body-style */
import { assert } from 'chai';
import { Suite } from 'mocha';
import TypingDb from '../../../src/database/TypingDb';

const { expect } = chai;
const TEST_DB1_NAME = 'testdb1';

function deleteDatabase(): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const dReq = indexedDB.deleteDatabase(TEST_DB1_NAME);
    dReq.onerror = function errorHndlr(event) {
      console.log(`Error deleting database. ${event}`);
    };

    dReq.onsuccess = function succHndlr(event) {
      console.log(`Database deleted successfully. ${event}`);
      resolve();
    };

    dReq.onblocked = function blockHndlr(event: Event) {
      console.log(`Database delete blocked. ${event}`);
      console.log(event.returnValue); // should be undefined
      reject(event.returnValue);
    };
  });
}

describe('database.TypingDb unit tests', function typingDbUT(this: Suite) {
  // FIXME Note that if beforeEach fails all subsequent tests in the suite will NOT be run.
  // This is bad and I don't know of any workaround.
  beforeEach(function be(this: Mocha.Context) {
    const testName = this.currentTest?.title;
    return new Promise((resolve, reject) => {
      // console.log(`beforeEach: ${this.ctx.currentTest?.parent?.titlePath()}`);
      console.log(`BEFOREEACH STARTING FOR TEST: ${testName}`);

      deleteDatabase().then(() => {
        console.log('Promise resolved deleting the db');
        console.log(`BEFOREEACH ENDING FOR TEST  : ${testName}`);
        resolve();
      }).catch(() => {
        console.log('Promise rejected trying to delete the db');
        console.log(`BEFOREEACH ENDING FOR TEST  : ${testName}`);
        reject();
      });
    });
  });

  afterEach(function ae(this: Mocha.Context) {
    return new Promise((resolve) => {
      console.log(`AFTEREACH STARTING FOR TEST : ${this.currentTest?.title}`);
      resolve();
      console.log(`AFTEREACH ENDING FOR TEST   : ${this.currentTest?.title}`);
    });
  });

  after(function a() {
    return new Promise((resolve, reject) => {
      console.log('AFTER STARTING ...');
      // Delete the test database after the last test so that the browser indexedDB storage is
      // not polluted by the db once the tests finish.
      deleteDatabase().then(() => {
        console.log('Promise resolved deleting the db');
        resolve();
      }).catch(() => {
        console.log('Promise rejected trying to delete the db');
        reject();
      }).finally(() => {
        console.log('AFTER ENDING ...');
      });
    });
  });

  describe('TypingDb class tests', function typingDbClassTests() {
    it('creates a db object', function t() {
      const db: TypingDb | undefined = new TypingDb(TEST_DB1_NAME, 1);
      expect(db.dbName).to.equal(TEST_DB1_NAME);
      expect(db.version).to.equal(1);
    });

    it('verifies open() fail exception', function t() {
      assert.fail('TBD');
    });

    it('cannot get library from destroyed db', function t() {
      const tDb: TypingDb | undefined = new TypingDb(TEST_DB1_NAME, 1);
      return tDb.close()
        .then((db) => {
          return db.getLibrary()
            .then(() => {
              return db.destroy()
                .then(() => {
                  return db.getLibrary()
                    .catch((reason: Error) => {
                      expect(reason.message).to.equal('Cannot use a destroyed db');
                    });
                });
            });
        });
    });

    it('cannot close destroyed db', function t() {
      const tDb: TypingDb | undefined = new TypingDb(TEST_DB1_NAME, 1);
      return tDb.close()
        .then((db) => {
          return db.getLibrary()
            .then(() => {
              return db.destroy()
                .then(() => {
                  return db.close()
                    .catch((reason: Error) => {
                      expect(reason.message).to.equal('Cannot use a destroyed db');
                    });
                });
            });
        });
    });

    it('cannot destroy destroyed db', function t() {
      const tDb: TypingDb | undefined = new TypingDb(TEST_DB1_NAME, 1);
      return tDb.close()
        .then((db) => {
          return db.getLibrary()
            .then(() => {
              return db.destroy()
                .then(() => {
                  return db.destroy()
                    .catch((reason: Error) => {
                      expect(reason.message).to.equal('Cannot use a destroyed db');
                    });
                });
            });
        });
    });

    it('closes the db', function t() {
      const tDb: TypingDb | undefined = new TypingDb(TEST_DB1_NAME, 1);
      return tDb.close()
        .then(() => {
          /* eslint-disable-next-line no-unused-expressions */
          assert.isOk;
          console.log('Just to seee');
        });
    });

    it('closes the db and then get Library', function t() {
      const tDb: TypingDb = new TypingDb(TEST_DB1_NAME, 1);
      return tDb.close()
        .then((db) => {
          db.getLibrary()
            .then((lib) => {
              // Type erasure basically makes a proper comparison impossible
              // so cannot check for Library class - object will have to do
              expect(typeof lib).to.be.equal('object');
            });
        });
    });
  });

  describe('Library class tests', function libraryClassTests() {
    it('gets the Library store', function t() {
      const tDb: TypingDb | undefined = new TypingDb(TEST_DB1_NAME, 1);
      return tDb.getLibrary()
        .then((lib) => {
          expect(tDb?.db).to.equal(lib?.db);
        });
    });

    it('stores an entry in the library', function t() {
      const tDb: TypingDb | undefined = new TypingDb(TEST_DB1_NAME, 1);
      return tDb.getLibrary()
        .then((lib) => {
          return lib.addUpdateEntry('ent1', 'This is the first text')
            .then((lib2) => {
              return lib2.loadLibraryTextNames()
                .then((texts) => {
                  console.log('Got this:');
                  console.log(texts);
                  expect(texts).to.deep.equal(['ent1']);
                });
            });
        });
    });

    it('stores two entries in the library', function t() {
      const tDb: TypingDb | undefined = new TypingDb(TEST_DB1_NAME, 1);
      return tDb.getLibrary()
        .then((lib) => {
          return lib.addUpdateEntry('ent1', 'This is the first text')
            .then((lib2) => {
              return lib2.addUpdateEntry('ent2', 'This is the second text')
                .then((lib3) => {
                  return lib3.loadLibraryTextNames()
                    .then((texts) => {
                      console.log('Got this:');
                      console.log(texts);
                      expect(texts).to.deep.equal(['ent1', 'ent2']);
                    });
                });
            });
        });
    });

    it('loads a library text in full', function t() {
      const tDb: TypingDb | undefined = new TypingDb(TEST_DB1_NAME, 1);
      return tDb.getLibrary()
        .then((lib) => {
          return lib?.addUpdateEntry('ent1', 'This is the first text')
            .then((lib2) => {
              return lib2.loadLibraryTextById('ent1')
                .then((text) => {
                  expect(text).to.deep.equal({ id: 'ent1', text: 'This is the first text' });
                });
            });
        });
    });

    it('updates an existing entry', function t() {
      const tDb: TypingDb | undefined = new TypingDb(TEST_DB1_NAME, 1);
      return tDb.getLibrary()
        .then((lib) => {
          return lib?.addUpdateEntry('ent1', 'This is the first text')
            .then((lib2) => {
              return lib2.addUpdateEntry('ent1', 'This is the first text rewritten')
                .then((lib3) => {
                  return lib3.loadLibraryTextById('ent1')
                    .then((text) => {
                      console.log(`${text.id} = ${text.text}`);
                      expect(text).to.deep.equal({ id: 'ent1', text: 'This is the first text rewritten' });
                    });
                });
            });
        });
    });

    it('deletes a library entry', function t() {
      const tDb: TypingDb | undefined = new TypingDb(TEST_DB1_NAME, 1);
      return tDb.getLibrary()
        .then((lib) => {
          return lib?.addUpdateEntry('ent1', 'This is the first text')
            .then((lib2) => {
              return lib2.deleteEntry('ent1')
                .then(() => {
                  return lib2.loadLibraryTextById('ent1')
                    .then((text) => {
                      /* eslint-disable-next-line no-unused-expressions */
                      expect(text).to.be.undefined;
                    });
                });
            });
        });
    });

    it('deletes a non-existent library entry', function t() {
      const tDb: TypingDb | undefined = new TypingDb(TEST_DB1_NAME, 1);
      return tDb.getLibrary()
        .then((lib) => {
          return lib.deleteEntry('non-existent')
            .then((u) => {
              /* eslint-disable-next-line no-unused-expressions */
              expect(u).to.be.undefined;
            });
        });
    });
  });
});
