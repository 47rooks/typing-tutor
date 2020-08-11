import Library from './Library';

export default class TypingDb {
  dbName: string;

  version: number;

  db!: IDBDatabase;

  constructor(dbName: string, version: number) {
    this.dbName = dbName;
    this.version = version;
  }

  public open(): Promise<boolean> {
    return new Promise((resolve, reject) => {
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

  public close(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      try {
        this.db.close();
        resolve();
      } catch (e) {
        reject(e);
      }
    });
  }

  public getLibrary() {
    return new Library(this.db);
  }
}
