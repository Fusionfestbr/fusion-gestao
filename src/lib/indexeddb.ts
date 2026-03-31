import { Sale } from '../store/mockData';

const DB_NAME = 'fusion-gestao-offline';
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('sales')) {
        db.createObjectStore('sales', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('pendingSync')) {
        db.createObjectStore('pendingSync', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

export async function saveSalesOffline(sales: Sale[]): Promise<void> {
  const db = await openDB();
  const tx = db.transaction('sales', 'readwrite');
  const store = tx.objectStore('sales');
  
  for (const sale of sales) {
    store.put(sale);
  }
  
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getOfflineSales(): Promise<Sale[]> {
  const db = await openDB();
  const tx = db.transaction('sales', 'readonly');
  const store = tx.objectStore('sales');
  
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

export async function addPendingSync(sale: Omit<Sale, 'id' | 'profit'>): Promise<void> {
  const db = await openDB();
  const tx = db.transaction('pendingSync', 'readwrite');
  const store = tx.objectStore('pendingSync');
  
  store.add({ ...sale, createdAt: new Date().toISOString() });
  
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getPendingSync(): Promise<unknown[]> {
  const db = await openDB();
  const tx = db.transaction('pendingSync', 'readonly');
  const store = tx.objectStore('pendingSync');
  
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

export async function clearPendingSync(): Promise<void> {
  const db = await openDB();
  const tx = db.transaction('pendingSync', 'readwrite');
  const store = tx.objectStore('pendingSync');
  store.clear();
  
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export function isOnline(): boolean {
  return navigator.onLine;
}