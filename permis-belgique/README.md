# Permis B Belgique

Simulateur d'examen théorique du permis B belge, en un seul fichier HTML (`index.html`). Ouvrez-le dans un navigateur, sans installation.

- **Examen blanc** : 50 questions tirées dans tous les thèmes, temps limité par question (15 s, 30 s ou sans limite), 41/50 pour réussir, −1 par erreur et −5 par faute grave.
- **Entraînement par thème** (13 thèmes) et **entraînement rapide** (20 questions), avec correction expliquée après chaque réponse.
- **Révision des erreurs** : les questions ratées sont gardées jusqu'à ce que vous y répondiez correctement.
- Panneaux, feux, carrefours vus du dessus et marquages sont dessinés en SVG.

La progression est enregistrée dans le navigateur (`localStorage`).

Les 236 questions sont originales et ont été rédigées d'après le code de la route belge (AR du 1er décembre 1975). Ce n'est pas la banque officielle des centres d'examen. Pour ajouter une question, ajoutez une entrée au tableau `Q` dans `index.html` :

```js
{t:"vitesse", q:"Question ?", a:["Bonne réponse","Autre","Autre"], r:0, g:1, e:"Explication.", i:{s:"C43", v:"50"}}
```

`t` = thème, `r` = index de la bonne réponse, `g:1` = faute grave, `i` = illustration facultative (`s` panneau, `l` feu, `x` carrefour, `m` marquage, `ag` agent).
