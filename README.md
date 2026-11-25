# Logic Master

**Português** · [English](README.en.md) · [Español](README.es.md) · [Français](README.fr.md)

Um quiz para treinar lógica computacional: proposições, tabelas-verdade, fluxogramas, condicionais, laços e teste de mesa.

**Acesse:** https://logic-master-web.ramon-cs-barbosa.workers.dev

Criei o Logic Master como Recurso Educacional Digital para a disciplina de Tópicos Especiais: Educação em Computação (UFPA, 2026.2). 
A ideia é simples: permitir que os alunos pratiquem lógica computacional por meio de quizzes.

## Como funciona para quem estuda

Hoje são quatro quizzes, numa sequência que vai dos fundamentos às tabelas-verdade, às estruturas condicionais e aos laços de repetição. Cada quiz também pode ser baixado em JSON ou aberto numa versão para impressão, com gabarito comentado, e traz um bloco **Como citar** com a referência pronta.

Você escolhe um quiz e pratica sem cadastro. As respostas e o resultado ficam apenas na página. As questões aparecem uma por tela. Algumas trazem portas lógicas, tabelas-verdade ou fluxogramas; outras trazem pseudocódigo para você fazer o teste de mesa; há também questões de verdadeiro ou falso e outras com até seis alternativas. Assim que você confirma a resposta, aparece a explicação do raciocínio, certo ou errado.

No final você vê a nota, o tempo, como foi em cada conceito e a revisão completa das questões. Depois, pode responder voluntariamente ao SUS, sem identificação nem vínculo com as respostas do quiz.

A plataforma inteira, incluindo o conteúdo dos quizzes, está em português, inglês, espanhol e francês. O idioma é escolhido automaticamente pelo navegador e pode ser trocado no ícone de idiomas.


## Como funciona para quem ensina

O professor entra numa área própria, com login, onde pode:

- criar e editar quizzes (enunciado, alternativas, imagem, código, vídeo e explicação), com a tradução de cada questão para os outros idiomas;
- importar e exportar quizzes em JSON, para levar o conteúdo de uma instalação para outra;
- acompanhar as avaliações voluntárias de usabilidade (SUS), com média, mediana, distribuição das notas e exportação em CSV, sem dados de identificação dos estudantes.

## Do que é feito

Tudo roda na Cloudflare, no plano gratuito:

- **api/**: back-end em [Hono](https://hono.dev) num Cloudflare Worker
- **database**: [D1](https://developers.cloudflare.com/d1/) (SQLite).
- **web/**: front-end em React, Vite, Tailwind e [shadcn/ui](https://ui.shadcn.com), servido por outro Worker, que também encaminha as chamadas `/api` para a API.

A API é acessada pelo Worker do site. O quiz não grava tentativas nem identifica estudantes. A aplicação armazena somente as dez respostas do SUS, a pontuação, o quiz avaliado e a data, sem horário; essas avaliações são excluídas pela rotina diária após 180 dias. O acesso administrativo usa login, limite de requisições e bloqueio temporário após senhas incorretas.

## Onde fica o conteúdo

O conteúdo dos quizzes fica em [`content/quizzes/`](content/quizzes), um arquivo JSON por quiz, no mesmo formato do botão **Baixar quiz**. As migrations criam só as tabelas; o banco é preenchido a partir desses arquivos com `pnpm content:seed` (local) ou `pnpm content:seed --remote` (produção). O comando só adiciona os quizzes que ainda não existem no banco, então pode ser rodado mais de uma vez.

As imagens das questões ficam em `web/public/img` e foram feitas para este projeto, sob a mesma licença.

## Rodando na sua máquina

Você vai precisar do Node 22 ou mais novo e do [pnpm](https://pnpm.io).

```bash
pnpm install
cp api/.dev.vars.example api/.dev.vars
cp api/.dev.vars .dev.vars
pnpm db:reset:local
pnpm preview
```

O site abre em http://localhost:8787. O `db:reset:local` cria o banco com os quatro quizzes de `content/quizzes` e uma conta de professor de teste, definida no `.dev.vars`. Na tela de login, o botão **Usar conta de teste** já preenche os dados.

Se for mexer no visual, rode `pnpm dev:api` e `pnpm dev:web` em dois terminais para ter recarregamento automático.

## Usando com a sua turma

O projeto é aberto justamente para que outros professores possam usá-lo e adaptá-lo. Para ter a sua própria versão:

1. Faça um fork deste repositório.
2. Crie o banco na sua conta Cloudflare com `pnpm wrangler d1 create logic-master-db` e coloque o `database_id` gerado em `api/wrangler.jsonc`.
3. Aplique o banco e publique:

   ```bash
   pnpm db:migrate:remote
   pnpm content:seed --remote
   pnpm --filter api exec wrangler secret put JWT_SECRET
   pnpm run deploy
   ```

4. Crie o seu acesso de professor (a senha é pedida no terminal):

   ```bash
   pnpm professor --email voce@suainstituicao.edu.br --name "Seu Nome" --remote
   ```

Depois é só entrar na área do professor e montar os seus quizzes.

## Licença

Todo o projeto, tanto o conteúdo educacional (questões, explicações e imagens) quanto o código-fonte, está sob [Creative Commons Atribuição-NãoComercial-CompartilhaIgual 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/deed.pt-br) (CC BY-NC-SA 4.0).

Na prática, isso quer dizer que você pode:

- usar o quiz com as suas turmas, em sala ou a distância;
- copiar, adaptar as questões e criar a sua própria versão;
- compartilhar com outros professores.

Em troca, só peço três coisas:

- **cite a fonte**, com um link para este repositório;
- **não use para fins comerciais**: nada de vender o material, cobrar por acesso a ele ou colocá-lo dentro de um produto pago;
- **mantenha a mesma licença** nas suas adaptações, para que elas continuem abertas para todo mundo.

O texto completo está no arquivo [LICENSE](LICENSE).

Encontrou um erro numa questão ou tem uma ideia? Abra uma issue, que eu vou adorar ver.
