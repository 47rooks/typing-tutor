import Library from './Library';

export default class TypingDb {
  dbName: string;

  version: number;

  db!: IDBDatabase;

  destroyed: boolean;

  constructor(dbName: string, version: number) {
    this.dbName = dbName;
    this.version = version;
    this.destroyed = false;
  }

  private open(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (this.destroyed) {
        reject(new Error('Cannot use a destroyed db'));
        return;
      }
      const openRequest = indexedDB.open(this.dbName, 1);

      openRequest.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        // FIXME Handle upgrade case
        console.log('initialization required');
        const db = openRequest.result;
        switch (event.oldVersion) {
          case 0:
            // Create DB for first time
            // Create 'library' object store
            db.createObjectStore('library', { keyPath: 'id' });
            break;
          case 1:
            // At v1 - for now do nothing
            break;
          default:
          // do nothing
        }
      };

      openRequest.onsuccess = () => {
        const db = openRequest.result;

        db.onversionchange = () => {
          db.close();
          // alert('Library database is out of date. Please reload the page');
          reject();
        };

        this.db = db;
        resolve(true);
      };

      openRequest.onerror = (event: Event) => {
        // console.log(`open failed with ${event}`);
        reject(event);
      };

      openRequest.onblocked = () => {
        // FIXME handle blocked case
      };
    });
  }

  public close(): Promise<TypingDb> {
    return new Promise((resolve, reject) => {
      if (this.destroyed) {
        reject(new Error('Cannot use a destroyed db'));
        return;
      }

      try {
        if (this.db) {
          this.db.close();
        }
        resolve(this);
      } catch (e) {
        reject(e);
      }
    });
  }

  public destroy(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.destroyed) {
        reject(new Error('Cannot use a destroyed db'));
        return;
      }

      if (this.dbName) {
        const dReq = indexedDB.deleteDatabase(this.dbName);
        /* eslint-disable-next-line @typescript-eslint/no-this-alias */
        const me = this;
        dReq.onerror = function errorHndlr(event) {
          console.log(`Error deleting database. ${event}`);
        };

        dReq.onsuccess = function successHndlr(event) {
          console.log(`destroy() Database deleted successfully. ${event}`);
          me.destroyed = true;
          resolve();
        };

        dReq.onblocked = function blockHndlr(event: Event) {
          console.log('Database delete blocked');
          console.log(event.returnValue); // should be undefined
          reject(new Error(`db deletion blocked. Error=${event.returnValue}`));
        };
      } else {
        resolve();
      }
    });
  }

  public getLibrary(): Promise<Library> {
    return new Promise<Library>((resolve, reject) => {
      if (this.destroyed) {
        reject(new Error('Cannot use a destroyed db'));
        return;
      }

      if (this.db === undefined) {
        this.open()
          .then(() => {
            console.log(`open done returning db = ${this.db}`);
            resolve(new Library(this.db));
          })
          .catch(() => {
            reject(new Error('Could not open the library'));
          });
      } else {
        console.log(`non-null returning db = ${this.db}`);
        resolve(new Library(this.db));
      }
    });
  }
}
