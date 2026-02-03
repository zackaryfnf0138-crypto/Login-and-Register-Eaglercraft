const crypto = require("crypto");

class AuthManager {
  constructor({ maxFailedAttempts = 4, onKick } = {}) {
    this.maxFailedAttempts = maxFailedAttempts;
    this.onKick = onKick || (() => {});
    this.accounts = new Map();
    this.failedAttempts = new Map();
  }

  hashPassword(password) {
    return crypto.createHash("sha256").update(password).digest("hex");
  }

  register(username, password, passwordConfirm) {
    if (!username || !password || !passwordConfirm) {
      return { ok: false, message: "Username and both password fields are required." };
    }

    if (password !== passwordConfirm) {
      return { ok: false, message: "Passwords do not match." };
    }

    if (this.accounts.has(username)) {
      return { ok: false, message: "That username is already registered." };
    }

    const passwordHash = this.hashPassword(password);
    this.accounts.set(username, { passwordHash });
    this.failedAttempts.delete(username);

    return { ok: true, message: "Registration complete. Please log in." };
  }

  login(username, password) {
    if (!this.accounts.has(username)) {
      return { ok: false, message: "Account not found. Please register first." };
    }

    const { passwordHash } = this.accounts.get(username);
    const incomingHash = this.hashPassword(password);

    if (incomingHash === passwordHash) {
      this.failedAttempts.delete(username);
      return { ok: true, message: "Login successful." };
    }

    const attempts = (this.failedAttempts.get(username) || 0) + 1;
    this.failedAttempts.set(username, attempts);

    const remaining = Math.max(this.maxFailedAttempts - attempts, 0);

    if (attempts >= this.maxFailedAttempts) {
      this.onKick(username);
      return { ok: false, message: "Too many failed attempts. Kicked." };
    }

    return {
      ok: false,
      message: `Incorrect password. You have ${remaining} more attempt${remaining === 1 ? "" : "s"}.`,
    };
  }
}

module.exports = { AuthManager };
