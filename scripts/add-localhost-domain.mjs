#!/usr/bin/env node
// One-shot: add "localhost" to the Firebase Auth authorized domains for
// cipher-marketing-daveq so the local dashboard (localhost:8766) can sign in.
// Keeps the two deployed domains. Safe to re-run; it sets the exact list below.
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const { GoogleAuth } = require("google-auth-library");
const HERE = dirname(fileURLToPath(import.meta.url));

const DOMAINS = [
  "cipher-marketing-daveq.firebaseapp.com",
  "cipher-marketing-daveq.web.app",
  "localhost",
];

const auth = new GoogleAuth({
  scopes: ["https://www.googleapis.com/auth/cloud-platform"],
  keyFile: join(HERE, "cipher-marketing-key.json"),
});
const client = await auth.getClient();
const url =
  "https://identitytoolkit.googleapis.com/admin/v2/projects/cipher-marketing-daveq/config?updateMask=authorizedDomains";
const r = await client.request({ url, method: "PATCH", data: { authorizedDomains: DOMAINS } });
console.log("authorized domains now:", JSON.stringify(r.data.authorizedDomains));
