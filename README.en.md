# Logic Master

[Português](README.md) · **English** · [Español](README.es.md) · [Français](README.fr.md)

A quiz for practicing computational logic: propositions, truth tables, flowcharts, conditionals, loops and desk checking.

**Try it:** https://logic-master-web.ramon-cs-barbosa.workers.dev

I built Logic Master as a Digital Educational Resource for the course Special Topics: Computing Education (UFPA, 2026.2).
The idea is simple: let students practice computational logic through quizzes.

## How it works for students

There are four quizzes, in a sequence that goes from the fundamentals to truth tables, conditional structures and loops. Each quiz can also be downloaded as JSON or opened in a printable version with an answer key, and it has a **How to cite** block with a ready-made reference.

You choose a quiz and practice without registering. Answers and results stay on the page. Questions appear one per screen. Some show logic gates, truth tables or flowcharts; others show pseudocode for you to desk-check; there are also true-or-false questions and others with up to six options. As soon as you confirm your answer, the explanation of the reasoning appears, whether you got it right or not.

At the end you see your score, time, performance by concept and a full review. You can then voluntarily answer the SUS survey without identification or links to your quiz answers.

The whole platform, including the quiz content, is available in Portuguese, English, Spanish and French. The language is picked automatically from the browser and can be changed with the language icon.

## How it works for teachers

Teachers have their own area, with login, where they can:

- create and edit quizzes (prompt, options, image, code, video and explanation), with the translation of each question into the other languages;
- import and export quizzes as JSON, to move content from one installation to another;
- consult voluntary usability evaluations (SUS), with mean, median, score distribution and CSV export, without student identification data.

## What it is made of

Everything runs on Cloudflare, on the free plan:

- **api/**: back end with [Hono](https://hono.dev) on a Cloudflare Worker
- **database**: [D1](https://developers.cloudflare.com/d1/) (SQLite).
- **web/**: front end with React, Vite, Tailwind and [shadcn/ui](https://ui.shadcn.com), served by another Worker, which also forwards `/api` calls to the API.

The API is accessed through the site’s Worker. The quiz does not store attempts or identify students. The application stores only the ten SUS ratings, score, evaluated quiz and date without a time; the daily retention routine deletes surveys after 180 days. Administration uses login, rate limiting and temporary lockout after incorrect passwords.

## Where the content lives

The quiz content lives in [`content/quizzes/`](content/quizzes), one JSON file per quiz, in the same format as the **Download quiz** button. Migrations only create the tables; the database is filled from these files with `pnpm content:seed` (local) or `pnpm content:seed --remote` (production). The command only adds quizzes that are not in the database yet, so it is safe to run more than once.

The question images live in `web/public/img` and were made for this project, under the same license.

## Running it locally

You will need Node 22 or newer and [pnpm](https://pnpm.io).

```bash
pnpm install
cp api/.dev.vars.example api/.dev.vars
cp api/.dev.vars .dev.vars
pnpm db:reset:local
pnpm preview
```

The site opens at http://localhost:8787. `db:reset:local` creates the database with the four quizzes from `content/quizzes` and a test teacher account, defined in `.dev.vars`. On the login screen, the **Use test account** button fills in the credentials for you.

If you are working on the UI, run `pnpm dev:api` and `pnpm dev:web` in two terminals to get hot reload.

## Using it with your class

The project is open precisely so that other teachers can use and adapt it. To get your own version:

1. Fork this repository.
2. Create the database in your Cloudflare account with `pnpm wrangler d1 create logic-master-db` and put the generated `database_id` in `api/wrangler.jsonc`.
3. Set up the database and deploy:

   ```bash
   pnpm db:migrate:remote
   pnpm content:seed --remote
   pnpm --filter api exec wrangler secret put JWT_SECRET
   pnpm run deploy
   ```

4. Create your teacher account (the password is asked in the terminal):

   ```bash
   pnpm professor --email you@yourinstitution.edu --name "Your Name" --remote
   ```

Then just sign in to the teacher area and build your quizzes.

## License

The whole project, both the educational content (questions, explanations and images) and the source code, is licensed under [Creative Commons Attribution-NonCommercial-ShareAlike 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/deed.en) (CC BY-NC-SA 4.0).

In practice, this means you can:

- use the quiz with your classes, in person or online;
- copy and adapt the questions and create your own version;
- share it with other teachers.

In return, I only ask for three things:

- **credit the source**, with a link to this repository;
- **do not use it for commercial purposes**: no selling the material, charging for access to it or putting it inside a paid product;
- **keep the same license** on your adaptations, so they stay open for everyone.

The full text is in the [LICENSE.en](LICENSE.en) file.

Found a mistake in a question or have an idea? Open an issue, I would love to see it.
