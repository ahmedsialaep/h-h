import { VITE_STORAGE_SECRET } from "@/config/config";
import CryptoJS from "crypto-js";
import { Storage } from "redux-persist";

const ENCRYPT_KEY = VITE_STORAGE_SECRET;

const encryptedStorage: Storage = {
  getItem: (key: string): Promise<string | null> => {
    return new Promise((resolve) => {
      try {
        const cipher = localStorage.getItem(key);
        if (!cipher) return resolve(null);
        const bytes = CryptoJS.AES.decrypt(cipher, ENCRYPT_KEY);
        const decrypted = bytes.toString(CryptoJS.enc.Utf8);
        resolve(decrypted || null);
      } catch {
        localStorage.removeItem(key); 
        resolve(null);
      }
    });
  },

  setItem: (key: string, value: string): Promise<void> => {
    return new Promise((resolve) => {
      const cipher = CryptoJS.AES.encrypt(value, ENCRYPT_KEY).toString();
      localStorage.setItem(key, cipher);
      resolve();
    });
  },

  removeItem: (key: string): Promise<void> => {
    return new Promise((resolve) => {
      localStorage.removeItem(key);
      resolve();
    });
  },
};

export default encryptedStorage;