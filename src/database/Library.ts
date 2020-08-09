export default class Library {
  db: IDBDatabase;
  constructor(db: IDBDatabase) {
    this.db = db;
  }
  public loadLibraryTexts(): Promise<string[]> {
    this.libraryOperation((db: IDBDatabase) => {
      // Read the list of texts
      const txn = db.transaction('library');
      const library = txn.objectStore('library');
      const getReq = library.getAll();
      getReq.onsuccess = () => {
        this.libraryTexts = [];
        getReq.result.forEach((t) => {
          this.libraryTexts.push(t.id);
        });
        db.close();
        console.log(`Current texts=${this.libraryTexts}`);
      };

      getReq.onerror = () => {
        alert(`Failed to read texts from library. Will continue without it. Error = ${getReq.error}`);
        db.close();
      };
    });
  }

}