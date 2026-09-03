import { config } from "dotenv";
import path from "path";

// The server's package.json lives at apps/server, but .env lives at the
// monorepo root — three levels up from this compiled/running file's
// location. Loading it here, as the very first import in index.ts, ensures
// every other module (which may read process.env at import time, like
// lib/email.ts constructing its Resend client) sees the values already set.
config({ path: path.resolve(__dirname, "../../../.env") });
