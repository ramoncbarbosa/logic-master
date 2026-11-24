# Logic Master

**Português** · [English](README.en.md) · [Español](README.es.md) · [Français](README.fr.md)

Um quiz para treinar lógica computacional: proposições, tabelas-verdade, fluxogramas, condicionais, laços e teste de mesa.

**Acesse:** https://logic-master-web.ramon-cs-barbosa.workers.dev

Criei o Logic Master como Recurso Educacional Digital para a disciplina de Tópicos Especiais: Educação em Computação (UFPA, 2026.2). 
A ideia é simples: permitir que os alunos pratiquem lógica computacional por meio de quizzes.

## Como funciona para quem estuda

Hoje são quatro quizzes, numa sequência que vai dos fundamentos às tabelas-verdade, às estruturas condicionais e aos laços de repetição. Três deles começam com uma videoaula de apoio, que muda conforme o idioma escolhido.

Você escolhe um quiz, informa nome e e-mail e lê o termo de uso dos dados. As questões aparecem uma por tela. Algumas trazem portas lógicas, tabelas-verdade ou fluxogramas; outras trazem pseudocódigo para você fazer o teste de mesa; há também questões de verdadeiro ou falso e outras com até seis alternativas. Assim que você confirma a resposta, aparece a explicação do raciocínio, certo ou errado.

No final você vê a nota, o tempo, como foi em cada conceito e a revisão completa das questões. Cada quiz tem um ranking público: vale a melhor tentativa de cada pessoa, primeiro por acertos e, no empate, pelo menor tempo. No ranking aparecem só o primeiro nome e a inicial do sobrenome.

A plataforma inteira, incluindo o conteúdo dos quizzes, está em português, inglês, espanhol e francês. O idioma é escolhido automaticamente pelo navegador e pode ser trocado no ícone de idiomas.


## Como funciona para quem ensina

O professor entra numa área própria, com login, onde pode:

- criar e editar quizzes (enunciado, alternativas, imagem, código, vídeo e explicação), com a tradução de cada questão para os outros idiomas;
- ver em gráficos quais questões a turma mais errou e quais alternativas erradas foram mais escolhidas, o que costuma revelar a confusão por trás do erro;
- acompanhar o desempenho por conceito e por dia;
- ver num globo de onde os alunos responderam;
- consultar a lista de participantes e exportar tudo em CSV;
- acompanhar a avaliação de usabilidade (questionário SUS) que os alunos respondem ao final do quiz, com nota média, classificação, gráficos, comentários e exportação em CSV.

## Do que é feito

Tudo roda na Cloudflare, no plano gratuito:

- **api/**: back-end em [Hono](https://hono.dev) num Cloudflare Worker
- **database**: [D1](https://developers.cloudflare.com/d1/) (SQLite).
- **web/**: front-end em React, Vite, Tailwind e [shadcn/ui](https://ui.shadcn.com), servido por outro Worker, que também encaminha as chamadas `/api` para a API.

A API não tem endereço público: só o Worker do site conversa com ela. Por isso não dá para forjar o IP ou a localização de quem responde, para além disso o projeto também tem limite de requisições por IP, bloqueio depois de várias senhas erradas e cabeçalhos de segurança, e os dados pessoais são anonimizados automaticamente depois de 180 dias.

## Rodando na sua máquina

Você vai precisar do Node 22 ou mais novo e do [pnpm](https://pnpm.io).

```bash
pnpm install
cp api/.dev.vars.example api/.dev.vars
cp api/.dev.vars .dev.vars
pnpm db:reset:local
pnpm preview
```

O site abre em http://localhost:8787. O `db:reset:local` cria o banco com os quatro quizzes e uma conta de professor de teste, definida no `.dev.vars`. Na tela de login, o botão **Usar conta de teste** já preenche os dados.

Se for mexer no visual, rode `pnpm dev:api` e `pnpm dev:web` em dois terminais para ter recarregamento automático.

## Usando com a sua turma

O projeto é aberto justamente para que outros professores possam usá-lo e adaptá-lo. Para ter a sua própria versão:

1. Faça um fork deste repositório.
2. Crie o banco na sua conta Cloudflare com `pnpm wrangler d1 create logic-master-db` e coloque o `database_id` gerado em `api/wrangler.jsonc`.
3. Se quiser aceitar só e-mails da sua instituição, coloque o domínio em `ALLOWED_EMAIL_DOMAINS` (no mesmo arquivo). Vazio aceita qualquer e-mail.
4. Aplique o banco e publique:

   ```bash
   pnpm db:migrate:remote
   pnpm --filter api exec wrangler secret put JWT_SECRET
   pnpm run deploy
   ```

5. Crie o seu acesso de professor (a senha é pedida no terminal):

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
