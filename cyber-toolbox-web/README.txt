# cyber-toolbox-web

Petite boîte à outils de cybersécurité en **HTML, CSS et JavaScript** (sans framework ni dépendance), qui s'exécute **entièrement dans le navigateur** : aucune donnée n'est envoyée sur le réseau.

**Démo en ligne : https://samuelbouzendorffer-icam.github.io/cyber-toolbox-web/**

## Outils

- **Encodages** : Base64 (compatible UTF-8), hexadécimal, URL.
- **Empreinte SHA-256** (API Web Crypto du navigateur).
- **Chiffres classiques** : César et Vigenère.
- **Robustesse d'un mot de passe** : estimation de l'entropie et points faibles, en direct.

## Utilisation en local

Les modules JavaScript ne fonctionnent pas en ouvrant directement le fichier : lancez un petit serveur.

```bash
python3 -m http.server 8000
# puis ouvrir http://localhost:8000
```

## Tests

La logique est séparée de l'interface (`lib.js`) pour être testée sous Node.js (version 20 ou plus récente, sans installation de paquet).

```bash
node --test
```

## Choix de sécurité

- **Politique de sécurité du contenu (CSP)** dans `index.html` : seuls les fichiers du site peuvent s'exécuter, et aucune connexion sortante n'est autorisée.
- **`textContent` plutôt que `innerHTML`** : un texte saisi ne peut jamais être interprété comme du HTML (protection contre le XSS).
- Aucune dépendance externe : pas de risque lié à la chaîne d'approvisionnement.
- Aucun stockage : rien n'est conservé après la fermeture de la page.

## Limites

Les outils sont pédagogiques : César et Vigenère sont cassés depuis des siècles, et l'estimation de robustesse est volontairement simple.

## Pistes d'amélioration

- Ajouter HMAC et d'autres fonctions de hachage (SHA-1 pour comprendre pourquoi il est abandonné, SHA-512).
- Ajouter un décodeur de JWT (lecture seule) et un analyseur d'en-têtes HTTP.
- Écrire des tests d'interface avec Playwright.

## Licence

MIT, voir [LICENSE](LICENSE).

---


