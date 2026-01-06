
import Dexie, { type EntityTable } from 'dexie';
import { SavedReport } from './types';

const db = new Dexie('DevReportsDB') as Dexie & {
  reports: EntityTable<
    SavedReport,
    'id' // primary key
  >;
};

// Schema declaration:
db.version(1).stores({
  reports: 'id, name, timestamp' // primary key "id", and indices on name and timestamp
});

export { db };
