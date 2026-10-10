// Calcule la version de l'application (empreinte des fichiers de public/) et la liste
// des fichiers à mettre en cache, puis les écrit dans public/sw.js.
// Usage : node scripts/stamp-sw.mjs          → met à jour sw.js
//         node scripts/stamp-sw.mjs --check  → échoue si sw.js n'est pas à jour
import {createHash} from "node:crypto";
import {readdir, readFile, writeFile} from "node:fs/promises";
import {join, relative, sep} from "node:path";
import {fileURLToPath} from "node:url";

const root = fileURLToPath(new URL("../public/", import.meta.url));
// Fichiers qui ne servent pas au fonctionnement hors connexion
const EXCLUDE = [/^sw\.js$/, /^_headers$/, /^_redirects$/, /^robots\.txt$/, /^screenshots\//, /^fonts\/LICENSE/, /^index\.html$/];

async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, {withFileTypes: true})) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...await walk(full));
    else out.push(relative(root, full).split(sep).join("/"));
  }
  return out;
}

const files = (await walk(root)).sort();
const hash = createHash("sha256");
for (const f of files) {
  if (f === "sw.js") continue;
  hash.update(f + "\0");
  hash.update(await readFile(join(root, f)));
}
const version = hash.digest("hex").slice(0, 12);
const precache = ["/", ...files.filter(f => !EXCLUDE.some(re => re.test(f))).map(f => "/" + f)];

const swPath = join(root, "sw.js");
const sw = await readFile(swPath, "utf8");
const next = sw
  .replace(/const VERSION = ".*?";/, `const VERSION = "${version}";`)
  .replace(/const PRECACHE = \[[\s\S]*?\];/, `const PRECACHE = ${JSON.stringify(precache, null, 2)};`);

if (process.argv.includes("--check")) {
  if (next !== sw) {
    console.error("public/sw.js n'est pas à jour : lancez `npm run build`.");
    process.exit(1);
  }
  console.log(`sw.js à jour (version ${version}, ${precache.length} fichiers en cache).`);
} else {
  if (next !== sw) await writeFile(swPath, next);
  console.log(`sw.js : version ${version}, ${precache.length} fichiers en cache.`);
}
