# Logic Master

[Português](README.md) · [English](README.en.md) · [Español](README.es.md) · **Français**

Un quiz pour s’entraîner à la logique informatique : propositions, tables de vérité, organigrammes, conditions, boucles et exécution pas à pas.

**Essayez-le :** https://logic-master-web.ramon-cs-barbosa.workers.dev

J’ai créé Logic Master comme Ressource Éducative Numérique pour le cours Sujets spéciaux : Enseignement de l’informatique (UFPA, 2026.2).
L’idée est simple : permettre aux élèves de s’entraîner à la logique informatique grâce à des quiz.

## Comment ça marche pour les élèves

Il y a quatre quiz, dans une progression qui va des fondamentaux aux tables de vérité, aux structures conditionnelles et aux boucles. Chaque quiz peut aussi être téléchargé en JSON ou ouvert dans une version imprimable avec corrigé commenté, et propose un bloc **Comment citer** avec la référence prête à l’emploi.

Vous choisissez un quiz et vous entraînez sans inscription. Les réponses et le résultat restent sur la page. Les questions s’affichent une par écran. Certaines montrent des portes logiques, des tables de vérité ou des organigrammes ; d’autres proposent du pseudocode à exécuter pas à pas ; il y a aussi des questions vrai ou faux et d’autres avec jusqu’à six réponses. Dès que vous validez votre réponse, l’explication du raisonnement s’affiche, que vous ayez raison ou non.

À la fin, vous voyez le score, le temps, les résultats par notion et la révision complète. Vous pouvez ensuite répondre volontairement au SUS, sans identification ni lien avec vos réponses au quiz.

Toute la plateforme, y compris le contenu des quiz, est disponible en portugais, anglais, espagnol et français. La langue est choisie automatiquement selon le navigateur et peut être changée avec l’icône des langues.

## Comment ça marche pour les enseignants

L’enseignant dispose de son propre espace, avec connexion, où il peut :

- créer et modifier des quiz (énoncé, réponses, image, code, vidéo et explication), avec la traduction de chaque question dans les autres langues ;
- importer et exporter des quiz en JSON, pour transférer le contenu d’une installation à une autre ;
- consulter les évaluations volontaires d’utilisabilité (SUS), avec moyenne, médiane, distribution des scores et export CSV, sans identification des élèves.

## De quoi c’est fait

Tout fonctionne sur Cloudflare, avec l’offre gratuite :

- **api/** : back-end avec [Hono](https://hono.dev) sur un Cloudflare Worker
- **base de données** : [D1](https://developers.cloudflare.com/d1/) (SQLite).
- **web/** : front-end avec React, Vite, Tailwind et [shadcn/ui](https://ui.shadcn.com), servi par un autre Worker, qui transmet aussi les appels `/api` à l’API.

L’API est accessible par le Worker du site. Le quiz ne conserve aucune tentative et n’identifie pas les élèves. Seuls les dix scores SUS, le score calculé, le quiz évalué et la date sans heure sont conservés ; la routine quotidienne supprime les évaluations après 180 jours. L’administration utilise une connexion, une limitation des requêtes et un blocage temporaire après des mots de passe incorrects.

## Où se trouve le contenu

Le contenu des quiz se trouve dans [`content/quizzes/`](content/quizzes), un fichier JSON par quiz, dans le même format que le bouton **Télécharger le quiz**. Les migrations créent seulement les tables ; la base de données est remplie à partir de ces fichiers avec `pnpm content:seed` (local) ou `pnpm content:seed --remote` (production). La commande n’ajoute que les quiz absents de la base, elle peut donc être lancée plusieurs fois.

Les images des questions se trouvent dans `web/public/img` et ont été créées pour ce projet, sous la même licence.

## Le lancer sur votre machine

Il vous faut Node 22 ou plus récent et [pnpm](https://pnpm.io).

```bash
pnpm install
cp api/.dev.vars.example api/.dev.vars
cp api/.dev.vars .dev.vars
pnpm db:reset:local
pnpm preview
```

Le site s’ouvre sur http://localhost:8787. `db:reset:local` crée la base de données avec les quatre quiz de `content/quizzes` et un compte enseignant de test, défini dans `.dev.vars`. Sur l’écran de connexion, le bouton **Utiliser le compte de test** remplit les identifiants pour vous.

Si vous travaillez sur l’interface, lancez `pnpm dev:api` et `pnpm dev:web` dans deux terminaux pour avoir le rechargement automatique.

## L’utiliser avec votre classe

Le projet est ouvert justement pour que d’autres enseignants puissent l’utiliser et l’adapter. Pour avoir votre propre version :

1. Faites un fork de ce dépôt.
2. Créez la base de données sur votre compte Cloudflare avec `pnpm wrangler d1 create logic-master-db` et placez le `database_id` généré dans `api/wrangler.jsonc`.
3. Préparez la base de données et publiez :

   ```bash
   pnpm db:migrate:remote
   pnpm content:seed --remote
   pnpm --filter api exec wrangler secret put JWT_SECRET
   pnpm run deploy
   ```

4. Créez votre accès enseignant (le mot de passe est demandé dans le terminal) :

   ```bash
   pnpm professor --email vous@votreetablissement.edu --name "Votre Nom" --remote
   ```

Il ne reste plus qu’à vous connecter à l’espace enseignant et à créer vos quiz.

## Licence

L’ensemble du projet, aussi bien le contenu pédagogique (questions, explications et images) que le code source, est placé sous licence [Creative Commons Attribution - Pas d’Utilisation Commerciale - Partage dans les Mêmes Conditions 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/deed.fr) (CC BY-NC-SA 4.0).

En pratique, cela signifie que vous pouvez :

- utiliser le quiz avec vos classes, en présentiel ou à distance ;
- copier, adapter les questions et créer votre propre version ;
- le partager avec d’autres enseignants.

En échange, je ne demande que trois choses :

- **citez la source**, avec un lien vers ce dépôt ;
- **pas d’usage commercial** : ne vendez pas le matériel, ne faites pas payer son accès et ne l’intégrez pas à un produit payant ;
- **gardez la même licence** pour vos adaptations, afin qu’elles restent ouvertes à tous.

Le texte complet se trouve dans le fichier [LICENSE.fr](LICENSE.fr).

Vous avez trouvé une erreur dans une question ou vous avez une idée ? Ouvrez une issue, je serai ravi de la voir.
