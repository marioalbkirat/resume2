import { Content } from "@/types/resume/Content";
import { Distribution } from "@/types/resume/Distribution";
import { ResumeStyle } from "@/types/resume/ResumeStyle";
import { Section } from "@/types/resume/Section";
import { Settings } from "@/types/resume/Settings";

export interface StoredResumeData {
  sections: Section[];
  settings: Settings;
  style: ResumeStyle;
  distribution: Distribution;
  content: Record<string, Content>;
  mode?: "preview" | "edit";
  updatedAt?: string;
}

interface StoredRecord<T> { id: string; data: T; updatedAt: string }

export class IndexedDBService {
  private dbName: string;
  private storeName: string;
  private db: IDBDatabase | null = null;

  constructor(dbName = "ResumeBuilderDB", storeName = "resumeData") {
    this.dbName = dbName;
    this.storeName = storeName;
  }

  async init(): Promise<IDBDatabase> {
    if (typeof indexedDB === "undefined") throw new Error("IndexedDB is only available in the browser");
    if (this.db) return this.db;
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => { this.db = request.result; resolve(this.db); };
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(this.storeName)) db.createObjectStore(this.storeName, { keyPath: "id" });
      };
    });
  }

  private async store(mode: IDBTransactionMode): Promise<IDBObjectStore> {
    const db = await this.init();
    return db.transaction([this.storeName], mode).objectStore(this.storeName);
  }

  async saveData<T>(key: string, data: T): Promise<void> {
    const store = await this.store("readwrite");
    return new Promise((resolve, reject) => {
      const request = store.put({ id: key, data, updatedAt: new Date().toISOString() });
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getData<T = unknown>(key: string): Promise<T | null> {
    const store = await this.store("readonly");
    return new Promise((resolve, reject) => {
      const request = store.get(key);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve((request.result as StoredRecord<T> | undefined)?.data ?? null);
    });
  }

  saveResumeData(key: string, data: StoredResumeData) { return this.saveData<StoredResumeData>(key, data); }
  getResumeData(key: string) { return this.getData<StoredResumeData>(key); }

  async deleteData(key: string): Promise<void> {
    const store = await this.store("readwrite");
    return new Promise((resolve, reject) => {
      const request = store.delete(key);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getAllData<T = unknown>(): Promise<Array<StoredRecord<T>>> {
    const store = await this.store("readonly");
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result as Array<StoredRecord<T>>);
    });
  }

  async clearAll(): Promise<void> {
    const store = await this.store("readwrite");
    return new Promise((resolve, reject) => {
      const request = store.clear();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }
}

export const dbService = new IndexedDBService();
