// Vérifie la banque de questions : thèmes, réponses, explications, doublons et illustrations.
import {THEMES, QUESTIONS} from "../public/js/questions.js";
import {illus} from "../public/js/illustrations.js";

const errors = [];
const themeIds = new Set(THEMES.map(t => t.id));
const seen = new Set();
const perTheme = {};
let graves = 0;

QUESTIONS.forEach((q, n) => {
  const where = `#${n + 1} « ${q.q.slice(0, 60)} »`;
  if (!themeIds.has(q.t)) errors.push(`${where} : thème inconnu « ${q.t} »`);
  if (!Array.isArray(q.a) || q.a.length < 2 || q.a.length > 3) errors.push(`${where} : il faut 2 ou 3 réponses`);
  if (!(Number.isInteger(q.r) && q.r >= 0 && q.r < q.a.length)) errors.push(`${where} : index de bonne réponse invalide`);
  if (new Set(q.a).size !== q.a.length) errors.push(`${where} : réponses en double`);
  if (!q.e || q.e.length < 10) errors.push(`${where} : explication manquante`);
  if (q.g !== undefined && q.g !== 1) errors.push(`${where} : g doit valoir 1 ou être absent`);
  if (q.i && !illus(q.i)) errors.push(`${where} : illustration inconnue ${JSON.stringify(q.i)}`);
  const key = q.q + "|" + JSON.stringify(q.i || 0);
  if (seen.has(key)) errors.push(`${where} : question en double`);
  seen.add(key);
  // Les réponses chiffrées sont affichées dans l'ordre : elles doivent être croissantes
  if (q.a.every(a => /^\d/.test(a))) {
    const v = q.a.map(a => parseFloat(a.replace(/\s/g, "").replace(",", ".")));
    if (v.some((x, i) => i && x < v[i - 1])) errors.push(`${where} : réponses chiffrées à mettre dans l'ordre croissant`);
  }
  perTheme[q.t] = (perTheme[q.t] || 0) + 1;
  if (q.g) graves++;
});

for (const t of THEMES) {
  if (!perTheme[t.id]) errors.push(`Thème « ${t.name} » sans question`);
  if (t.icon && !t.icon.s && !t.icon.g) errors.push(`Thème « ${t.name} » : icône invalide`);
}

if (errors.length) {
  console.error(errors.join("\n"));
  console.error(`\n${errors.length} problème(s).`);
  process.exit(1);
}
console.log(`${QUESTIONS.length} questions OK (${graves} fautes graves) :`);
for (const t of THEMES) console.log(`  ${String(perTheme[t.id]).padStart(3)}  ${t.name}`);
