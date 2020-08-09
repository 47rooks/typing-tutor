import Library from './Library';

export default class TypingDb {
  dbName: string;
  version: number;
  db!: IDBDatabase;
  constructor(dbName: string, version: number) {
    this.dbName = dbName;
    this.version = version;
  }

  public open(): void {
    const openRequest = indexedDB.open(this.dbName, 1);

    openRequest.onupgradeneeded = (event) => {
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
        alert('Library database is out of date. Please reload the page');
      };

      this.db = db;
    };

    openRequest.onerror = (event) => {
      console.log(`open failed with ${event}`);
    };

    openRequest.onblocked = () => {
      // FIXME handle blocked case
    };
  }

  public close() {
    this.db.close();
  }

  public getLibrary() {
    return new Library(this.db);
  }
}