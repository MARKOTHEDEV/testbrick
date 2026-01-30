import CryptoJS from "crypto-js";
import type { StateStorage } from "zustand/middleware";

// Use environment variable for the secret key in production
// For now, generate a unique key per browser session combined with a static salt
const getEncryptionKey = (): string => {
  const staticSalt = import.meta.env.VITE_ENCRYPTION_SALT || "tb-default-salt-change-in-prod";

  // Get or create a session-specific component
  let sessionKey = sessionStorage.getItem("_sk");
  if (!sessionKey) {
    sessionKey = CryptoJS.lib.WordArray.random(16).toString();
    sessionStorage.setItem("_sk", sessionKey);
  }

  return `${staticSalt}-${sessionKey}`;
};

const encrypt = (data: string): string => {
  const key = getEncryptionKey();
  return CryptoJS.AES.encrypt(data, key).toString();
};

const decrypt = (encryptedData: string): string | null => {
  try {
    const key = getEncryptionKey();
    const bytes = CryptoJS.AES.decrypt(encryptedData, key);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return decrypted || null;
  } catch {
    return null;
  }
};

export const encryptedStorage: StateStorage = {
  getItem: (name: string): string | null => {
    const encrypted = localStorage.getItem(name);
    if (!encrypted) return null;

    const decrypted = decrypt(encrypted);
    if (!decrypted) {
      // If decryption fails, clear the corrupted data
      localStorage.removeItem(name);
      return null;
    }

    return decrypted;
  },

  setItem: (name: string, value: string): void => {
    const encrypted = encrypt(value);
    localStorage.setItem(name, encrypted);
  },

  removeItem: (name: string): void => {
    localStorage.removeItem(name);
  },
};
