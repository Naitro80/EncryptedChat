/**
 * CipherChat — Encryption Module
 * Uses the Web Crypto API (built into all modern browsers).
 * Algorithm: AES-256-GCM with PBKDF2 key derivation.
 * No external dependencies.
 */

const CipherCrypto = (() => {
  const SALT = new TextEncoder().encode("CipherChat-v1-salt-8f3k2j9x");
  const IV_LENGTH = 12; // GCM standard

  /**
   * Derives a 256-bit AES-GCM key from a password string.
   * Uses PBKDF2 with 100,000 iterations.
   */
  async function deriveKey(password) {
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(password),
      "PBKDF2",
      false,
      ["deriveKey"]
    );
    return crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: SALT,
        iterations: 100000,
        hash: "SHA-256"
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"]
    );
  }

  /**
   * Encrypts a plaintext string with the given key.
   * Returns a base64-encoded string: [12-byte IV][ciphertext]
   */
  async function encrypt(plaintext, key) {
    const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
    const encoded = new TextEncoder().encode(plaintext);
    const ciphertext = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      key,
      encoded
    );
    // Combine IV + ciphertext into one buffer
    const combined = new Uint8Array(iv.byteLength + ciphertext.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(ciphertext), iv.byteLength);
    return btoa(String.fromCharCode(...combined));
  }

  /**
   * Decrypts a base64-encoded string (produced by encrypt) with the given key.
   * Returns the original plaintext string, or null if decryption fails.
   */
  async function decrypt(base64, key) {
    try {
      const combined = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
      const iv = combined.slice(0, IV_LENGTH);
      const ciphertext = combined.slice(IV_LENGTH);
      const decrypted = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv },
        key,
        ciphertext
      );
      return new TextDecoder().decode(decrypted);
    } catch {
      return null; // Wrong key or corrupted data
    }
  }

  return { deriveKey, encrypt, decrypt };
})();
