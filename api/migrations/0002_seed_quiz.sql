INSERT INTO quizzes (id, slug, title, description, audience, objective, cover_image, license, published) VALUES (
  1,
  'fundamentos-logica-computacional',
  'Fundamentos de Lógica Computacional',
  'Quiz interativo com feedback imediato sobre proposições, conectivos lógicos, tabelas-verdade, fluxogramas, estruturas condicionais e de repetição.',
  'Ensino Médio Técnico / Educação Profissional e 1º período do Ensino Superior em Computação',
  'Avaliar proposições e expressões booleanas, construir o raciocínio de tabelas-verdade e prever a saída de algoritmos simples com decisão e repetição (teste de mesa).',
  NULL,
  'CC BY-SA 4.0',
  1
);

INSERT INTO questions (quiz_id, position, concept, prompt, image_url, image_alt, code, options, correct_index, explanation) VALUES
(1, 1, 'Proposições',
 'Qual das alternativas abaixo é uma proposição lógica?',
 NULL, NULL, NULL,
 '["Que horas são?","Feche a porta!","7 é um número primo.","x + 2"]', 2,
 'Proposição é uma sentença declarativa que pode ser classificada como verdadeira ou falsa, mas não ambas. Perguntas, ordens e expressões abertas (como x + 2) não são proposições.'),

(1, 2, 'Conectivos lógicos',
 'Observe a porta lógica E (AND). Se P = Verdadeiro e Q = Falso, qual é o valor de P ∧ Q?',
 '/img/and-gate.svg', 'Porta lógica AND com entradas P e Q e uma saída', NULL,
 '["Verdadeiro","Falso","Indeterminado","Depende da ordem de P e Q"]', 1,
 'A conjunção (E) só é verdadeira quando TODAS as entradas são verdadeiras. Como Q é falso, P ∧ Q é falso.'),

(1, 3, 'Conectivos lógicos',
 'Observe a porta lógica OU (OR). Se P = Falso e Q = Verdadeiro, qual é o valor de P ∨ Q?',
 '/img/or-gate.svg', 'Porta lógica OR com entradas P e Q e uma saída', NULL,
 '["Verdadeiro","Falso","Indeterminado","Só é verdadeiro se P também for"]', 0,
 'A disjunção (OU) é verdadeira quando PELO MENOS UMA das entradas é verdadeira. Como Q é verdadeiro, P ∨ Q é verdadeiro.'),

(1, 4, 'Negação',
 'Qual é o valor lógico de ¬(V ∧ F)?',
 NULL, NULL, NULL,
 '["Verdadeiro","Falso","Não é possível calcular","V e F ao mesmo tempo"]', 0,
 'Primeiro resolvemos os parênteses: V ∧ F = F. Em seguida aplicamos a negação: ¬F = V.'),

(1, 5, 'Tabela-verdade',
 'A imagem mostra a tabela-verdade de uma expressão com 2 variáveis (4 linhas). Quantas linhas terá a tabela-verdade de uma expressão com 3 variáveis?',
 '/img/truth-table.svg', 'Tabela-verdade das variáveis P e Q com as colunas P E Q e P OU Q', NULL,
 '["3","6","8","9"]', 2,
 'O número de linhas é 2 elevado ao número de variáveis: 2³ = 8 combinações possíveis de V e F.'),

(1, 6, 'Condicional',
 'A proposição condicional P → Q (se P, então Q) é FALSA somente quando:',
 NULL, NULL, NULL,
 '["P é falso e Q é verdadeiro","P é verdadeiro e Q é falso","P e Q são falsos","P e Q são verdadeiros"]', 1,
 'A condicional só é falsa quando a promessa é quebrada: o antecedente (P) acontece e o consequente (Q) não acontece.'),

(1, 7, 'Leis de De Morgan',
 'Pela Lei de De Morgan, a expressão ¬(A ∧ B) é equivalente a:',
 NULL, NULL, NULL,
 '["¬A ∧ ¬B","¬A ∨ ¬B","A ∨ B","¬A ∧ B"]', 1,
 'A negação de uma conjunção é a disjunção das negações: ¬(A ∧ B) ≡ ¬A ∨ ¬B. O E vira OU e cada termo é negado.'),

(1, 8, 'Estrutura condicional',
 'Analise o fluxograma. Se a variável nota receber o valor 6, o que será exibido?',
 '/img/flowchart-decision.svg', 'Fluxograma: início, nota recebe 6, decisão nota maior ou igual a 7; se sim escreva Aprovado, se não escreva Recuperação; fim', NULL,
 '["Aprovado","Recuperação","Aprovado e Recuperação","Nada é exibido"]', 1,
 'A condição 6 >= 7 é falsa, então o fluxo segue pelo caminho NÃO e exibe Recuperação. Apenas um dos caminhos do desvio condicional é executado.'),

(1, 9, 'Estrutura de repetição',
 'Faça o teste de mesa do algoritmo abaixo. Qual valor será exibido?',
 '/img/flowchart-loop.svg', 'Fluxograma de um laço: soma recebe 0, i de 1 até 4, soma recebe soma mais i, ao final escreva soma',
 'soma ← 0
para i de 1 até 4 faça
    soma ← soma + i
fimpara
escreva(soma)',
 '["4","5","10","15"]', 2,
 'O laço executa 4 vezes: soma = 0+1 = 1, 1+2 = 3, 3+3 = 6, 6+4 = 10. O valor exibido é 10.'),

(1, 10, 'Expressões booleanas',
 'Qual é o valor final da variável podeEntrar?',
 NULL, NULL,
 'idade ← 17
temAutorizacao ← verdadeiro
podeEntrar ← (idade >= 18) OU temAutorizacao',
 '["verdadeiro","falso","17","erro de execução"]', 0,
 '(17 >= 18) é falso, mas falso OU verdadeiro = verdadeiro. Basta uma das condições ser verdadeira na disjunção.'),

(1, 11, 'Algoritmos sequenciais',
 'Faça o teste de mesa: quais são os valores finais de a e b?',
 NULL, NULL,
 'a ← 3
b ← 5
a ← a + b
b ← a - b
a ← a - b',
 '["a = 3 e b = 5","a = 8 e b = 3","a = 5 e b = 3","a = 5 e b = 8"]', 2,
 'Passo a passo: a = 3+5 = 8; b = 8-5 = 3; a = 8-3 = 5. O algoritmo troca os valores das variáveis sem usar uma variável auxiliar.'),

(1, 12, 'Algoritmos',
 'O que caracteriza corretamente um algoritmo?',
 NULL, NULL, NULL,
 '["Um programa escrito obrigatoriamente em uma linguagem de programação","Uma sequência finita, ordenada e sem ambiguidade de passos para resolver um problema","Qualquer conjunto de instruções, mesmo que nunca termine","Um desenho de fluxograma"]', 1,
 'Algoritmo é uma sequência finita e bem definida de passos. Ele pode ser representado em linguagem natural, pseudocódigo, fluxograma ou linguagem de programação.');
