import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Report, StoredDocument, IncidentTemplate, UserProfile, Message, SharedEvent } from '../types';

interface VerityDB extends DBSchema {
  reports: {
    key: string;
    value: Report;
  };
  documents: {
    key: string;
    value: StoredDocument;
  };
  templates: {
    key: string;
    value: IncidentTemplate;
  };
  profile: {
    key: string;
    value: UserProfile;
  };
  messages: {
    key: string;
    value: Message & { localId: string; synced: boolean };
  };
  sharedEvents: {
    key: string;
    value: SharedEvent & { localId: string; synced: boolean };
  };
  pendingSync: {
    key: string;
    value: {
      id: string;
      type: 'report' | 'document' | 'template' | 'profile' | 'message' | 'sharedEvent';
      data: any;
      timestamp: number;
      retries: number;
    };
  };
}

const DB_NAME = 'veritynow-db';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<VerityDB>> | null = null;

const getDB = () => {
  if (!dbPromise) {
    dbPromise = openDB<VerityDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Reports store
        if (!db.objectStoreNames.contains('reports')) {
          db.createObjectStore('reports', { keyPath: 'id' });
        }
        
        // Documents store
        if (!db.objectStoreNames.contains('documents')) {
          db.createObjectStore('documents', { keyPath: 'id' });
        }
        
        // Templates store
        if (!db.objectStoreNames.contains('templates')) {
          db.createObjectStore('templates', { keyPath: 'id' });
        }
        
        // Profile store (single entry)
        if (!db.objectStoreNames.contains('profile')) {
          db.createObjectStore('profile', { keyPath: 'userId' });
        }
        
        // Messages store
        if (!db.objectStoreNames.contains('messages')) {
          const messagesStore = db.createObjectStore('messages', { keyPath: 'localId' });
          messagesStore.createIndex('synced', 'synced');
          messagesStore.createIndex('timestamp', 'timestamp');
        }
        
        // Shared events store
        if (!db.objectStoreNames.contains('sharedEvents')) {
          const eventsStore = db.createObjectStore('sharedEvents', { keyPath: 'localId' });
          eventsStore.createIndex('synced', 'synced');
          eventsStore.createIndex('timestamp', 'timestamp');
        }
        
        // Pending sync queue
        if (!db.objectStoreNames.contains('pendingSync')) {
          const syncStore = db.createObjectStore('pendingSync', { keyPath: 'id' });
          syncStore.createIndex('timestamp', 'timestamp');
          syncStore.createIndex('retries', 'retries');
        }
      }
    });
  }
  return dbPromise;
};

// === CRUD Operations ===

export const localDB = {
  // Reports
  async saveReport(report: Report): Promise<void> {
    const db = await getDB();
    await db.put('reports', report);
  },
  
  async saveReports(reports: Report[]): Promise<void> {
    const db = await getDB();
    const tx = db.transaction('reports', 'readwrite');
    await Promise.all(reports.map(r => tx.store.put(r)));
    await tx.done;
  },
  
  async getAllReports(): Promise<Report[]> {
    const db = await getDB();
    return db.getAll('reports');
  },
  
  async deleteReport(id: string): Promise<void> {
    const db = await getDB();
    await db.delete('reports', id);
  },
  
  // Documents
  async saveDocument(doc: StoredDocument): Promise<void> {
    const db = await getDB();
    await db.put('documents', doc);
  },
  
  async getAllDocuments(): Promise<StoredDocument[]> {
    const db = await getDB();
    return db.getAll('documents');
  },
  
  async deleteDocument(id: string): Promise<void> {
    const db = await getDB();
    await db.delete('documents', id);
  },
  
  // Templates
  async saveTemplate(template: IncidentTemplate): Promise<void> {
    const db = await getDB();
    await db.put('templates', template);
  },
  
  async getAllTemplates(): Promise<IncidentTemplate[]> {
    const db = await getDB();
    return db.getAll('templates');
  },
  
  async deleteTemplate(id: string): Promise<void> {
    const db = await getDB();
    await db.delete('templates', id);
  },
  
  // Profile
  async saveProfile(profile: UserProfile): Promise<void> {
    const db = await getDB();
    await db.put('profile', profile);
  },
  
  async getProfile(userId: string): Promise<UserProfile | undefined> {
    const db = await getDB();
    return db.get('profile', userId);
  },
  
  // Pending Sync Queue
  async queueSync(type: string, data: any): Promise<string> {
    const db = await getDB();
    const id = `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await db.put('pendingSync', {
      id,
      type,
      data,
      timestamp: Date.now(),
      retries: 0
    });
    return id;
  },
  
  async getPendingSync(): Promise<Array<{id: string; type: string; data: any; timestamp: number; retries: number}>> {
    const db = await getDB();
    return db.getAllFromIndex('pendingSync', 'timestamp');
  },
  
  async completeSync(id: string): Promise<void> {
    const db = await getDB();
    await db.delete('pendingSync', id);
  },
  
  async incrementRetry(id: string): Promise<void> {
    const db = await getDB();
    const item = await db.get('pendingSync', id);
    if (item) {
      item.retries++;
      await db.put('pendingSync', item);
    }
  },
  
  // Clear all data (for logout)
  async clearAll(): Promise<void> {
    const db = await getDB();
    const tx = db.transaction(['reports', 'documents', 'templates', 'profile', 'messages', 'sharedEvents', 'pendingSync'], 'readwrite');
    await Promise.all([
      tx.store('reports').clear(),
      tx.store('documents').clear(),
      tx.store('templates').clear(),
      tx.store('profile').clear(),
      tx.store('messages').clear(),
      tx.store('sharedEvents').clear(),
      tx.store('pendingSync').clear()
    ]);
    await tx.done;
  }
};
