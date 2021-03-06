
export type LibraryText = {
  id: string;
  text: string;
}

export default class Library {
  db: IDBDatabase;

  constructor(db: IDBDatabase) {
    this.db = db;
  }

  public loadLibraryTextNames(): Promise<string[]> {
    return new Promise<string[]>((resolve, reject) => {
      // Read the list of texts
      const txn = this.db.transaction('library');
      const library = txn.objectStore('library');
      const getReq = library.getAll();
      getReq.onsuccess = () => {
        const libraryTexts: string[] = [];
        getReq.result.forEach((t) => {
          libraryTexts.push(t.id);
        });
        console.log(`Current texts=${libraryTexts}`);
        resolve(libraryTexts);
      };

      getReq.onerror = () => {
        reject(new Error('Failed to read texts from library.'
          + ` Will continue without it. Error = ${getReq.error}`));
      };
    });
  }

  public addUpdateEntry(name: string, text: string): Promise<Library> {
    return new Promise<Library>((resolve, reject) => {
      // Read the list of texts
      const txn = this.db.transaction('library', 'readwrite');
      const library = txn.objectStore('library');
      try {
        const getReq = library.put({ id: `${name}`, text: `${text}` });
        txn.oncomplete = () => {
          resolve(this);
        };

        txn.onerror = () => {
          reject(new Error('Failed to save text to library.'
            + ` Will continue without it.Error = ${getReq.error} `));
        };
      } catch (e) {
        reject(new Error(`Library operation failed: ${e} `));
      }
    });
  }

  public loadLibraryTextById(id: string): Promise<LibraryText> {
    return new Promise<LibraryText>((resolve, reject) => {
      // Read the list of texts
      const txn = this.db.transaction('library');
      const library = txn.objectStore('library');
      const getReq = library.get(`${id}`);
      getReq.onsuccess = () => {
        resolve(getReq.result);
      };

      getReq.onerror = () => {
        reject(new Error(`Failed to read text ${id} from library.Error = ${getReq.error} `));
      };
    });
  }

  public deleteEntry(id: string): Promise<undefined> {
    return new Promise<undefined>((resolve, reject) => {
      const txn = this.db.transaction('library', 'readwrite');
      const library = txn.objectStore('library');
      const delReq = library.delete(id);
      delReq.onsuccess = () => {
        resolve();
      };
      delReq.onerror = () => {
        reject(new Error(`Delete of '${id}' failed.Error = ${delReq.error} `));
      };
    });
  }
}
