# Logic Master

[Português](README.md) · [English](README.en.md) · [Español](README.es.md) · **Français**

Un quiz pour s’entraîner à la logique informatique : propositions, tables de vérité, organigrammes, conditions, boucles et exécution pas à pas.

**Essayez-le :** https://logic-master-web.ramon-cs-barbosa.workers.dev

J’ai créé Logic Master comme Ressource Éducative Numérique pour le cours Sujets spéciaux : Enseignement de l’informatique (UFPA, 2026.2).
L’idée est simple : permettre aux élèves de s’entraîner à la logique informatique grâce à des quiz.

## Comment ça marche pour les élèves

Il y a quatre quiz, dans une progression qui va des fondamentaux aux tables de vérité, aux structures conditionnelles et aux boucles. Trois d’entre eux commencent par une vidéo d’accompagnement, qui change selon la langue choisie.

Vous choisissez un quiz, indiquez votre nom et votre e-mail, puis lisez les conditions d’utilisation des données. Les questions s’affichent une par écran. Certaines montrent des portes logiques, des tables de vérité ou des organigrammes ; d’autres proposent du pseudocode à exécuter pas à pas ; il y a aussi des questions vrai ou faux et d’autres avec jusqu’à six réponses. Dès que vous validez votre réponse, l’explication du raisonnement s’affiche, que vous ayez raison ou non.

À la fin, vous voyez votre score, votre temps, vos résultats par notion et la révision complète des questions. Chaque quiz a un classement public : c’est la meilleure tentative de chaque personne qui compte, d’abord selon le nombre de bonnes réponses puis, en cas d’égalité, selon le temps le plus court. Le classement n’affiche que le prénom et l’initiale du nom.

Toute la plateforme, y compris le contenu des quiz, est disponible en portugais, anglais, espagnol et français. La langue est choisie automatiquement selon le navigateur et peut être changée avec l’icône des langues.

## Comment ça marche pour les enseignants

L’enseignant dispose de son propre espace, avec connexion, où il peut :

- créer et modifier des quiz (énoncé, réponses, image, code, vidéo et explication), avec la traduction de chaque question dans les autres langues ;
- voir sur des graphiques les questions les plus ratées par la classe et les mauvaises réponses les plus choisies, ce qui révèle souvent la confusion derrière l’erreur ;
- suivre les résultats par notion et par jour ;
- voir sur un globe d’où les élèves ont répondu ;
- consulter la liste des participants et tout exporter en CSV ;
- suivre l’évaluation de l’utilisabilité (questionnaire SUS) à laquelle les élèves répondent à la fin du quiz, avec score moyen, classement, graphiques, commentaires et export CSV.

## De quoi c’est fait

Tout fonctionne sur Cloudflare, avec l’offre gratuite :

- **api/** : back-end avec [Hono](https://hono.dev) sur un Cloudflare Worker
- **base de données** : [D1](https://developers.cloudflare.com/d1/) (SQLite).
- **web/** : front-end avec React, Vite, Tailwind et [shadcn/ui](https://ui.shadcn.com), servi par un autre Worker, qui transmet aussi les appels `/api` à l’API.

L’API n’a pas d’adresse publique : seul le Worker du site communique avec elle. Il est donc impossible de falsifier l’IP ou la localisation de la personne qui répond. De plus, le projet limite les requêtes par IP, bloque l’accès après plusieurs mots de passe erronés, utilise des en-têtes de sécurité, et les données personnelles sont anonymisées automatiquement après 180 jours.

## Le lancer sur votre machine

Il vous faut Node 22 ou plus récent et [pnpm](https://pnpm.io).

```bash
pnpm install
cp api/.dev.vars.example api/.dev.vars
cp api/.dev.vars .dev.vars
pnpm db:reset:local
pnpm preview
```

Le site s’ouvre sur http://localhost:8787. `db:reset:local` crée la base de données avec les quatre quiz et un compte enseignant de test, défini dans `.dev.vars`. Sur l’écran de connexion, le bouton **Utiliser le compte de test** remplit les identifiants pour vous.

Si vous travaillez sur l’interface, lancez `pnpm dev:api` et `pnpm dev:web` dans deux terminaux pour avoir le rechargement automatique.

## L’utiliser avec votre classe

Le projet est ouvert justement pour que d’autres enseignants puissent l’utiliser et l’adapter. Pour avoir votre propre version :

1. Faites un fork de ce dépôt.
2. Créez la base de données sur votre compte Cloudflare avec `pnpm wrangler d1 create logic-master-db` et placez le `database_id` généré dans `api/wrangler.jsonc`.
3. Si vous voulez n’accepter que les e-mails de votre établissement, indiquez le domaine dans `ALLOWED_EMAIL_DOMAINS` (dans le même fichier). Vide, n’importe quel e-mail est accepté.
4. Préparez la base de données et publiez :

   ```bash
   pnpm db:migrate:remote
   pnpm --filter api exec wrangler secret put JWT_SECRET
   pnpm run deploy
   ```

5. Créez votre accès enseignant (le mot de passe est demandé dans le terminal) :

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
