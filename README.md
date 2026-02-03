# Eaglercraft Register/Login Auth Example

This repo contains a simple in-memory authentication helper that you can wire into an Eaglercraft server event loop. It enforces:

- Registration with password + password confirmation
- Login with password
- Kick after **3 more failed attempts** (4 total failed attempts)

## Files

- `src/auth.js`: Auth manager with registration + login logic

## Usage Example

```js
const { AuthManager } = require("./src/auth");

const auth = new AuthManager({
  // 1 initial failure + 3 more tries = 4 total failures allowed
  maxFailedAttempts: 4,
  onKick: (username) => {
    console.log(`[KICK] ${username} failed too many logins`);
    // TODO: call your server's disconnect/kick API here
  },
});

// Registration flow
const registerResult = auth.register("Notch", "MySecret123", "MySecret123");
console.log(registerResult.message);

// Login flow
const loginResult = auth.login("Notch", "MySecret123");
console.log(loginResult.message);

// Incorrect login attempts
console.log(auth.login("Notch", "wrong").message);
console.log(auth.login("Notch", "wrong").message);
console.log(auth.login("Notch", "wrong").message);
console.log(auth.login("Notch", "wrong").message); // triggers kick
```

## Wiring Into Your Server

In your Eaglercraft server handler, call `auth.register()` when the player submits the registration form and call `auth.login()` when they submit the login form. If `auth.login()` returns `ok: false` and the message indicates a kick, call your server's disconnect API.
