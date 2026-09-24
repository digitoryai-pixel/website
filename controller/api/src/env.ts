// Load .env before anything reads process.env (ESM evaluates imports in order).
try {
  process.loadEnvFile();
} catch {
  /* no .env file: rely on the real environment */
}
