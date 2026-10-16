/** Carrega o ficheiro .env (se existir) para os scripts de linha de comandos. */
try { (process as unknown as { loadEnvFile?: (p: string) => void }).loadEnvFile?.(".env"); } catch { /* sem .env: usa o ambiente */ }
