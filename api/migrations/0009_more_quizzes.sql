INSERT INTO quizzes (owner_id, slug, title, description, audience, objective, video_url, license, published)
VALUES ((SELECT id FROM owners ORDER BY id LIMIT 1), 'tabelas-verdade-conectivos', 'Tabelas-verdade e conectivos', 'Assista ao vídeo de apoio e teste o que você sabe sobre conjunção, disjunção, negação, bicondicional, tautologias e expressões compostas.', 'Ensino Médio Técnico e 1º período de Computação', 'Calcular o valor lógico de expressões compostas e reconhecer equivalências usando tabelas-verdade.', 'https://www.youtube.com/watch?v=e6-IGzF3-h0', 'CC BY-NC-SA 4.0', 1);

INSERT INTO quiz_translations (quiz_id, locale, title, description, audience, objective)
SELECT id, 'en', 'Truth tables and connectives', 'Watch the support video and test what you know about conjunction, disjunction, negation, biconditional, tautologies and compound expressions.', 'Technical high school and first-year Computing students', 'Compute the logical value of compound expressions and recognize equivalences using truth tables.' FROM quizzes WHERE slug = 'tabelas-verdade-conectivos';

INSERT INTO quiz_translations (quiz_id, locale, title, description, audience, objective)
SELECT id, 'es', 'Tablas de verdad y conectores', 'Mira el video de apoyo y pon a prueba lo que sabes sobre conjunción, disyunción, negación, bicondicional, tautologías y expresiones compuestas.', 'Educación media técnica y primer semestre de Computación', 'Calcular el valor lógico de expresiones compuestas y reconocer equivalencias usando tablas de verdad.' FROM quizzes WHERE slug = 'tabelas-verdade-conectivos';

INSERT INTO quiz_translations (quiz_id, locale, title, description, audience, objective)
SELECT id, 'fr', 'Tables de vérité et connecteurs', 'Regardez la vidéo d’accompagnement et testez vos connaissances sur la conjonction, la disjonction, la négation, le biconditionnel, les tautologies et les expressions composées.', 'Lycée technique et première année d’informatique', 'Calculer la valeur logique d’expressions composées et reconnaître des équivalences à l’aide de tables de vérité.' FROM quizzes WHERE slug = 'tabelas-verdade-conectivos';

INSERT INTO questions (quiz_id, position, prompt, concept, image_url, image_alt, code, options, correct_index, explanation)
SELECT id, 1, 'Verdadeiro ou falso: a disjunção P ∨ Q só é falsa quando P e Q são falsos.', 'Disjunção', NULL, NULL, NULL, '["Verdadeiro", "Falso"]', 0, 'Verdadeiro. A disjunção (OU) precisa de apenas uma parte verdadeira; por isso, ela só é falsa quando as duas são falsas.'
FROM quizzes WHERE slug = 'tabelas-verdade-conectivos';

INSERT INTO question_translations (question_id, locale, prompt, concept, options, explanation, image_url, image_alt, code)
SELECT qq.id, 'en', 'True or false: the disjunction P ∨ Q is false only when both P and Q are false.', 'Disjunction', '["True", "False"]', 'True. A disjunction (OR) needs only one true part, so it is false only when both parts are false.', NULL, NULL, NULL
FROM questions qq JOIN quizzes z ON z.id = qq.quiz_id WHERE z.slug = 'tabelas-verdade-conectivos' AND qq.position = 1;

INSERT INTO question_translations (question_id, locale, prompt, concept, options, explanation, image_url, image_alt, code)
SELECT qq.id, 'es', 'Verdadero o falso: la disyunción P ∨ Q solo es falsa cuando P y Q son falsos.', 'Disyunción', '["Verdadero", "Falso"]', 'Verdadero. La disyunción (O) necesita solo una parte verdadera; por eso solo es falsa cuando ambas son falsas.', NULL, NULL, NULL
FROM questions qq JOIN quizzes z ON z.id = qq.quiz_id WHERE z.slug = 'tabelas-verdade-conectivos' AND qq.position = 1;

INSERT INTO question_translations (question_id, locale, prompt, concept, options, explanation, image_url, image_alt, code)
SELECT qq.id, 'fr', 'Vrai ou faux : la disjonction P ∨ Q n’est fausse que lorsque P et Q sont faux.', 'Disjonction', '["Vrai", "Faux"]', 'Vrai. La disjonction (OU) n’a besoin que d’une partie vraie ; elle n’est donc fausse que lorsque les deux le sont.', NULL, NULL, NULL
FROM questions qq JOIN quizzes z ON z.id = qq.quiz_id WHERE z.slug = 'tabelas-verdade-conectivos' AND qq.position = 1;

INSERT INTO questions (quiz_id, position, prompt, concept, image_url, image_alt, code, options, correct_index, explanation)
SELECT id, 2, 'Observe a tabela-verdade. Em quantas linhas a coluna P ∧ Q é verdadeira?', 'Tabela-verdade', '/img/truth-table.svg', 'Tabela-verdade das variáveis P e Q com as colunas P E Q e P OU Q', NULL, '["0", "1", "2", "3", "4"]', 1, 'Somente na primeira linha (P = V e Q = V) a conjunção é verdadeira. Nas outras três, pelo menos uma das entradas é falsa.'
FROM quizzes WHERE slug = 'tabelas-verdade-conectivos';

INSERT INTO question_translations (question_id, locale, prompt, concept, options, explanation, image_url, image_alt, code)
SELECT qq.id, 'en', 'Look at the truth table. In how many rows is the P ∧ Q column true?', 'Truth table', '["0", "1", "2", "3", "4"]', 'Only in the first row (P = T and Q = T) is the conjunction true. In the other three, at least one input is false.', '/img/en/truth-table.svg', 'Truth table of variables P and Q with the columns P AND Q and P OR Q', NULL
FROM questions qq JOIN quizzes z ON z.id = qq.quiz_id WHERE z.slug = 'tabelas-verdade-conectivos' AND qq.position = 2;

INSERT INTO question_translations (question_id, locale, prompt, concept, options, explanation, image_url, image_alt, code)
SELECT qq.id, 'es', 'Observa la tabla de verdad. ¿En cuántas filas la columna P ∧ Q es verdadera?', 'Tabla de verdad', '["0", "1", "2", "3", "4"]', 'Solo en la primera fila (P = V y Q = V) la conjunción es verdadera. En las otras tres, al menos una entrada es falsa.', '/img/es/truth-table.svg', 'Tabla de verdad de las variables P y Q con las columnas P Y Q y P O Q', NULL
FROM questions qq JOIN quizzes z ON z.id = qq.quiz_id WHERE z.slug = 'tabelas-verdade-conectivos' AND qq.position = 2;

INSERT INTO question_translations (question_id, locale, prompt, concept, options, explanation, image_url, image_alt, code)
SELECT qq.id, 'fr', 'Observez la table de vérité. Dans combien de lignes la colonne P ∧ Q est-elle vraie ?', 'Table de vérité', '["0", "1", "2", "3", "4"]', 'Seulement à la première ligne (P = V et Q = V) la conjonction est vraie. Dans les trois autres, au moins une entrée est fausse.', '/img/fr/truth-table.svg', 'Table de vérité des variables P et Q avec les colonnes P ET Q et P OU Q', NULL
FROM questions qq JOIN quizzes z ON z.id = qq.quiz_id WHERE z.slug = 'tabelas-verdade-conectivos' AND qq.position = 2;

INSERT INTO questions (quiz_id, position, prompt, concept, image_url, image_alt, code, options, correct_index, explanation)
SELECT id, 3, 'A imagem mostra a porta NÃO (NOT). Se a entrada P for verdadeira, qual é a saída ¬P?', 'Negação', '/img/not-gate.svg', 'Porta lógica NOT com entrada P e saída ¬P', NULL, '["Verdadeira", "Falsa", "Igual a P", "Depende de outra entrada"]', 1, 'A negação inverte o valor lógico: se P é verdadeira, ¬P é falsa. A porta NÃO tem uma única entrada.'
FROM quizzes WHERE slug = 'tabelas-verdade-conectivos';

INSERT INTO question_translations (question_id, locale, prompt, concept, options, explanation, image_url, image_alt, code)
SELECT qq.id, 'en', 'The image shows the NOT gate. If input P is true, what is the output ¬P?', 'Negation', '["True", "False", "Same as P", "It depends on another input"]', 'Negation inverts the logical value: if P is true, ¬P is false. The NOT gate has a single input.', '/img/en/not-gate.svg', 'NOT logic gate with input P and output ¬P', NULL
FROM questions qq JOIN quizzes z ON z.id = qq.quiz_id WHERE z.slug = 'tabelas-verdade-conectivos' AND qq.position = 3;

INSERT INTO question_translations (question_id, locale, prompt, concept, options, explanation, image_url, image_alt, code)
SELECT qq.id, 'es', 'La imagen muestra la compuerta NO (NOT). Si la entrada P es verdadera, ¿cuál es la salida ¬P?', 'Negación', '["Verdadera", "Falsa", "Igual a P", "Depende de otra entrada"]', 'La negación invierte el valor lógico: si P es verdadera, ¬P es falsa. La compuerta NO tiene una sola entrada.', '/img/es/not-gate.svg', 'Compuerta lógica NOT con entrada P y salida ¬P', NULL
FROM questions qq JOIN quizzes z ON z.id = qq.quiz_id WHERE z.slug = 'tabelas-verdade-conectivos' AND qq.position = 3;

INSERT INTO question_translations (question_id, locale, prompt, concept, options, explanation, image_url, image_alt, code)
SELECT qq.id, 'fr', 'L’image montre la porte NON (NOT). Si l’entrée P est vraie, quelle est la sortie ¬P ?', 'Négation', '["Vraie", "Fausse", "Identique à P", "Cela dépend d’une autre entrée"]', 'La négation inverse la valeur logique : si P est vraie, ¬P est fausse. La porte NON n’a qu’une seule entrée.', '/img/fr/not-gate.svg', 'Porte logique NOT avec l’entrée P et la sortie ¬P', NULL
FROM questions qq JOIN quizzes z ON z.id = qq.quiz_id WHERE z.slug = 'tabelas-verdade-conectivos' AND qq.position = 3;

INSERT INTO questions (quiz_id, position, prompt, concept, image_url, image_alt, code, options, correct_index, explanation)
SELECT id, 4, 'A bicondicional P ↔ Q (P se e somente se Q) é verdadeira quando:', 'Bicondicional', NULL, NULL, NULL, '["P e Q têm o mesmo valor lógico", "P é verdadeiro e Q é falso", "Pelo menos um deles é verdadeiro", "P e Q são sempre falsos"]', 0, 'A bicondicional é verdadeira quando os dois lados concordam: ambos verdadeiros ou ambos falsos.'
FROM quizzes WHERE slug = 'tabelas-verdade-conectivos';

INSERT INTO question_translations (question_id, locale, prompt, concept, options, explanation, image_url, image_alt, code)
SELECT qq.id, 'en', 'The biconditional P ↔ Q (P if and only if Q) is true when:', 'Biconditional', '["P and Q have the same logical value", "P is true and Q is false", "At least one of them is true", "P and Q are always false"]', 'The biconditional is true when both sides agree: both true or both false.', NULL, NULL, NULL
FROM questions qq JOIN quizzes z ON z.id = qq.quiz_id WHERE z.slug = 'tabelas-verdade-conectivos' AND qq.position = 4;

INSERT INTO question_translations (question_id, locale, prompt, concept, options, explanation, image_url, image_alt, code)
SELECT qq.id, 'es', 'La bicondicional P ↔ Q (P si y solo si Q) es verdadera cuando:', 'Bicondicional', '["P y Q tienen el mismo valor lógico", "P es verdadero y Q es falso", "Al menos uno de ellos es verdadero", "P y Q son siempre falsos"]', 'La bicondicional es verdadera cuando ambos lados coinciden: los dos verdaderos o los dos falsos.', NULL, NULL, NULL
FROM questions qq JOIN quizzes z ON z.id = qq.quiz_id WHERE z.slug = 'tabelas-verdade-conectivos' AND qq.position = 4;

INSERT INTO question_translations (question_id, locale, prompt, concept, options, explanation, image_url, image_alt, code)
SELECT qq.id, 'fr', 'Le biconditionnel P ↔ Q (P si et seulement si Q) est vrai lorsque :', 'Biconditionnel', '["P et Q ont la même valeur logique", "P est vrai et Q est faux", "Au moins l’un des deux est vrai", "P et Q sont toujours faux"]', 'Le biconditionnel est vrai lorsque les deux côtés concordent : tous deux vrais ou tous deux faux.', NULL, NULL, NULL
FROM questions qq JOIN quizzes z ON z.id = qq.quiz_id WHERE z.slug = 'tabelas-verdade-conectivos' AND qq.position = 4;

INSERT INTO questions (quiz_id, position, prompt, concept, image_url, image_alt, code, options, correct_index, explanation)
SELECT id, 5, 'Com P = V, Q = F e R = V, qual é o valor de (P ∧ Q) ∨ R?', 'Expressões compostas', NULL, NULL, NULL, '["Verdadeiro", "Falso", "Indefinido", "Depende da ordem das variáveis", "Verdadeiro e falso ao mesmo tempo", "Nenhuma das anteriores"]', 0, 'Primeiro os parênteses: P ∧ Q = V ∧ F = F. Depois a disjunção: F ∨ R = F ∨ V = V.'
FROM quizzes WHERE slug = 'tabelas-verdade-conectivos';

INSERT INTO question_translations (question_id, locale, prompt, concept, options, explanation, image_url, image_alt, code)
SELECT qq.id, 'en', 'With P = T, Q = F and R = T, what is the value of (P ∧ Q) ∨ R?', 'Compound expressions', '["True", "False", "Undefined", "It depends on the order of the variables", "True and false at the same time", "None of the above"]', 'Parentheses first: P ∧ Q = T ∧ F = F. Then the disjunction: F ∨ R = F ∨ T = T.', NULL, NULL, NULL
FROM questions qq JOIN quizzes z ON z.id = qq.quiz_id WHERE z.slug = 'tabelas-verdade-conectivos' AND qq.position = 5;

INSERT INTO question_translations (question_id, locale, prompt, concept, options, explanation, image_url, image_alt, code)
SELECT qq.id, 'es', 'Con P = V, Q = F y R = V, ¿cuál es el valor de (P ∧ Q) ∨ R?', 'Expresiones compuestas', '["Verdadero", "Falso", "Indefinido", "Depende del orden de las variables", "Verdadero y falso al mismo tiempo", "Ninguna de las anteriores"]', 'Primero los paréntesis: P ∧ Q = V ∧ F = F. Luego la disyunción: F ∨ R = F ∨ V = V.', NULL, NULL, NULL
FROM questions qq JOIN quizzes z ON z.id = qq.quiz_id WHERE z.slug = 'tabelas-verdade-conectivos' AND qq.position = 5;

INSERT INTO question_translations (question_id, locale, prompt, concept, options, explanation, image_url, image_alt, code)
SELECT qq.id, 'fr', 'Avec P = V, Q = F et R = V, quelle est la valeur de (P ∧ Q) ∨ R ?', 'Expressions composées', '["Vrai", "Faux", "Indéfini", "Cela dépend de l’ordre des variables", "Vrai et faux en même temps", "Aucune des réponses précédentes"]', 'D’abord les parenthèses : P ∧ Q = V ∧ F = F. Ensuite la disjonction : F ∨ R = F ∨ V = V.', NULL, NULL, NULL
FROM questions qq JOIN quizzes z ON z.id = qq.quiz_id WHERE z.slug = 'tabelas-verdade-conectivos' AND qq.position = 5;

INSERT INTO questions (quiz_id, position, prompt, concept, image_url, image_alt, code, options, correct_index, explanation)
SELECT id, 6, 'Uma tautologia é uma proposição que:', 'Tautologia', NULL, NULL, NULL, '["É sempre verdadeira, para quaisquer valores das variáveis", "É sempre falsa", "Pode ser verdadeira ou falsa, dependendo dos valores"]', 0, 'Tautologia é sempre verdadeira, como P ∨ ¬P. A sempre falsa é a contradição; a que varia é a contingência.'
FROM quizzes WHERE slug = 'tabelas-verdade-conectivos';

INSERT INTO question_translations (question_id, locale, prompt, concept, options, explanation, image_url, image_alt, code)
SELECT qq.id, 'en', 'A tautology is a proposition that:', 'Tautology', '["Is always true, for any values of the variables", "Is always false", "Can be true or false depending on the values"]', 'A tautology is always true, like P ∨ ¬P. The always-false one is a contradiction; the one that varies is a contingency.', NULL, NULL, NULL
FROM questions qq JOIN quizzes z ON z.id = qq.quiz_id WHERE z.slug = 'tabelas-verdade-conectivos' AND qq.position = 6;

INSERT INTO question_translations (question_id, locale, prompt, concept, options, explanation, image_url, image_alt, code)
SELECT qq.id, 'es', 'Una tautología es una proposición que:', 'Tautología', '["Es siempre verdadera, para cualquier valor de las variables", "Es siempre falsa", "Puede ser verdadera o falsa según los valores"]', 'Una tautología es siempre verdadera, como P ∨ ¬P. La siempre falsa es la contradicción; la que varía es la contingencia.', NULL, NULL, NULL
FROM questions qq JOIN quizzes z ON z.id = qq.quiz_id WHERE z.slug = 'tabelas-verdade-conectivos' AND qq.position = 6;

INSERT INTO question_translations (question_id, locale, prompt, concept, options, explanation, image_url, image_alt, code)
SELECT qq.id, 'fr', 'Une tautologie est une proposition qui :', 'Tautologie', '["Est toujours vraie, quelles que soient les valeurs des variables", "Est toujours fausse", "Peut être vraie ou fausse selon les valeurs"]', 'Une tautologie est toujours vraie, comme P ∨ ¬P. Celle qui est toujours fausse est une contradiction ; celle qui varie est une contingence.', NULL, NULL, NULL
FROM questions qq JOIN quizzes z ON z.id = qq.quiz_id WHERE z.slug = 'tabelas-verdade-conectivos' AND qq.position = 6;

INSERT INTO questions (quiz_id, position, prompt, concept, image_url, image_alt, code, options, correct_index, explanation)
SELECT id, 7, 'Verdadeiro ou falso: ¬(P ∨ Q) é equivalente a ¬P ∧ ¬Q.', 'Leis de De Morgan', NULL, NULL, NULL, '["Verdadeiro", "Falso"]', 0, 'Verdadeiro. Pela Lei de De Morgan, negar uma disjunção resulta na conjunção das negações.'
FROM quizzes WHERE slug = 'tabelas-verdade-conectivos';

INSERT INTO question_translations (question_id, locale, prompt, concept, options, explanation, image_url, image_alt, code)
SELECT qq.id, 'en', 'True or false: ¬(P ∨ Q) is equivalent to ¬P ∧ ¬Q.', 'De Morgan’s laws', '["True", "False"]', 'True. By De Morgan’s law, negating a disjunction gives the conjunction of the negations.', NULL, NULL, NULL
FROM questions qq JOIN quizzes z ON z.id = qq.quiz_id WHERE z.slug = 'tabelas-verdade-conectivos' AND qq.position = 7;

INSERT INTO question_translations (question_id, locale, prompt, concept, options, explanation, image_url, image_alt, code)
SELECT qq.id, 'es', 'Verdadero o falso: ¬(P ∨ Q) es equivalente a ¬P ∧ ¬Q.', 'Leyes de De Morgan', '["Verdadero", "Falso"]', 'Verdadero. Por la ley de De Morgan, negar una disyunción da la conjunción de las negaciones.', NULL, NULL, NULL
FROM questions qq JOIN quizzes z ON z.id = qq.quiz_id WHERE z.slug = 'tabelas-verdade-conectivos' AND qq.position = 7;

INSERT INTO question_translations (question_id, locale, prompt, concept, options, explanation, image_url, image_alt, code)
SELECT qq.id, 'fr', 'Vrai ou faux : ¬(P ∨ Q) est équivalent à ¬P ∧ ¬Q.', 'Lois de De Morgan', '["Vrai", "Faux"]', 'Vrai. D’après la loi de De Morgan, nier une disjonction donne la conjonction des négations.', NULL, NULL, NULL
FROM questions qq JOIN quizzes z ON z.id = qq.quiz_id WHERE z.slug = 'tabelas-verdade-conectivos' AND qq.position = 7;

INSERT INTO quizzes (owner_id, slug, title, description, audience, objective, video_url, license, published)
VALUES ((SELECT id FROM owners ORDER BY id LIMIT 1), 'estruturas-condicionais', 'Estruturas condicionais na prática', 'Depois do vídeo do Curso em Vídeo, pratique se/senão, condições encadeadas e aninhadas, escolha/caso e operadores lógicos com fluxogramas e pseudocódigo.', 'Ensino Médio Técnico e 1º período de Computação', 'Prever o caminho de execução de algoritmos com desvios condicionais simples, encadeados, aninhados e de múltipla escolha.', 'https://www.youtube.com/watch?v=_g05aHdBAEY', 'CC BY-NC-SA 4.0', 1);

INSERT INTO quiz_translations (quiz_id, locale, title, description, audience, objective)
SELECT id, 'en', 'Conditional structures in practice', 'After the support video, practice if/else, chained and nested conditions, switch/case and logical operators with flowcharts and pseudocode.', 'Technical high school and first-year Computing students', 'Predict the execution path of algorithms with simple, chained, nested and multiple-choice conditional branches.' FROM quizzes WHERE slug = 'estruturas-condicionais';

INSERT INTO quiz_translations (quiz_id, locale, title, description, audience, objective)
SELECT id, 'es', 'Estructuras condicionales en la práctica', 'Después del video de apoyo, practica si/si no, condiciones encadenadas y anidadas, según/caso y operadores lógicos con diagramas de flujo y pseudocódigo.', 'Educación media técnica y primer semestre de Computación', 'Predecir el camino de ejecución de algoritmos con desvíos condicionales simples, encadenados, anidados y de selección múltiple.' FROM quizzes WHERE slug = 'estruturas-condicionais';

INSERT INTO quiz_translations (quiz_id, locale, title, description, audience, objective)
SELECT id, 'fr', 'Structures conditionnelles en pratique', 'Après la vidéo d’accompagnement, entraînez-vous avec si/sinon, les conditions enchaînées et imbriquées, selon/cas et les opérateurs logiques à l’aide d’organigrammes et de pseudocode.', 'Lycée technique et première année d’informatique', 'Prévoir le chemin d’exécution d’algorithmes avec des branchements conditionnels simples, enchaînés, imbriqués et à choix multiple.' FROM quizzes WHERE slug = 'estruturas-condicionais';

INSERT INTO questions (quiz_id, position, prompt, concept, image_url, image_alt, code, options, correct_index, explanation)
SELECT id, 1, 'O que será exibido?', 'Condicional encadeada', NULL, NULL, 'idade ← 16
se idade >= 18 então
    escreva("Pode votar e dirigir")
senão se idade >= 16 então
    escreva("Pode votar")
senão
    escreva("Ainda não pode votar")
fimse', '["Pode votar e dirigir", "Pode votar", "Ainda não pode votar", "Nada é exibido"]', 1, 'A primeira condição (16 >= 18) é falsa; a segunda (16 >= 16) é verdadeira, então aparece "Pode votar" e o restante é ignorado.'
FROM quizzes WHERE slug = 'estruturas-condicionais';

INSERT INTO question_translations (question_id, locale, prompt, concept, options, explanation, image_url, image_alt, code)
SELECT qq.id, 'en', 'What will be displayed?', 'Chained conditional', '["Can vote and drive", "Can vote", "Cannot vote yet", "Nothing is displayed"]', 'The first condition (16 >= 18) is false; the second (16 >= 16) is true, so "Can vote" appears and the rest is skipped.', NULL, NULL, 'age ← 16
if age >= 18 then
    write("Can vote and drive")
else if age >= 16 then
    write("Can vote")
else
    write("Cannot vote yet")
end if'
FROM questions qq JOIN quizzes z ON z.id = qq.quiz_id WHERE z.slug = 'estruturas-condicionais' AND qq.position = 1;

INSERT INTO question_translations (question_id, locale, prompt, concept, options, explanation, image_url, image_alt, code)
SELECT qq.id, 'es', '¿Qué se mostrará?', 'Condicional encadenada', '["Puede votar y conducir", "Puede votar", "Todavía no puede votar", "No se muestra nada"]', 'La primera condición (16 >= 18) es falsa; la segunda (16 >= 16) es verdadera, así que aparece "Puede votar" y el resto se ignora.', NULL, NULL, 'edad ← 16
si edad >= 18 entonces
    escribir("Puede votar y conducir")
si no, si edad >= 16 entonces
    escribir("Puede votar")
si no
    escribir("Todavía no puede votar")
fin si'
FROM questions qq JOIN quizzes z ON z.id = qq.quiz_id WHERE z.slug = 'estruturas-condicionais' AND qq.position = 1;

INSERT INTO question_translations (question_id, locale, prompt, concept, options, explanation, image_url, image_alt, code)
SELECT qq.id, 'fr', 'Qu’est-ce qui sera affiché ?', 'Conditions enchaînées', '["Peut voter et conduire", "Peut voter", "Ne peut pas encore voter", "Rien n’est affiché"]', 'La première condition (16 >= 18) est fausse ; la deuxième (16 >= 16) est vraie, donc « Peut voter » s’affiche et le reste est ignoré.', NULL, NULL, 'age ← 16
si age >= 18 alors
    écrire("Peut voter et conduire")
sinon si age >= 16 alors
    écrire("Peut voter")
sinon
    écrire("Ne peut pas encore voter")
fin si'
FROM questions qq JOIN quizzes z ON z.id = qq.quiz_id WHERE z.slug = 'estruturas-condicionais' AND qq.position = 1;

INSERT INTO questions (quiz_id, position, prompt, concept, image_url, image_alt, code, options, correct_index, explanation)
SELECT id, 2, 'Siga o fluxograma com média 8. Qual mensagem aparece?', 'Decisão aninhada', '/img/flowchart-nested.svg', 'Fluxograma de decisão aninhada: media recebe 8; se media maior ou igual a 7, testa se maior ou igual a 9 para escrever Excelente ou Aprovado; senão Reprovado', NULL, '["Excelente", "Aprovado", "Reprovado"]', 1, '8 >= 7 é verdadeiro, então entramos na segunda decisão. 8 >= 9 é falso, logo a mensagem é "Aprovado".'
FROM quizzes WHERE slug = 'estruturas-condicionais';

INSERT INTO question_translations (question_id, locale, prompt, concept, options, explanation, image_url, image_alt, code)
SELECT qq.id, 'en', 'Follow the flowchart with an average of 8. Which message appears?', 'Nested decision', '["Excellent", "Passed", "Failed"]', '8 >= 7 is true, so we enter the second decision. 8 >= 9 is false, so the message is "Passed".', '/img/en/flowchart-nested.svg', 'Nested decision flowchart: average receives 8; if at least 7, check whether at least 9 to write Excellent or Passed; otherwise Failed', NULL
FROM questions qq JOIN quizzes z ON z.id = qq.quiz_id WHERE z.slug = 'estruturas-condicionais' AND qq.position = 2;

INSERT INTO question_translations (question_id, locale, prompt, concept, options, explanation, image_url, image_alt, code)
SELECT qq.id, 'es', 'Sigue el diagrama de flujo con promedio 8. ¿Qué mensaje aparece?', 'Decisión anidada', '["Excelente", "Aprobado", "Reprobado"]', '8 >= 7 es verdadero, así que entramos en la segunda decisión. 8 >= 9 es falso, por lo tanto el mensaje es "Aprobado".', '/img/es/flowchart-nested.svg', 'Diagrama de decisión anidada: promedio recibe 8; si es al menos 7, verifica si es al menos 9 para escribir Excelente o Aprobado; si no, Reprobado', NULL
FROM questions qq JOIN quizzes z ON z.id = qq.quiz_id WHERE z.slug = 'estruturas-condicionais' AND qq.position = 2;

INSERT INTO question_translations (question_id, locale, prompt, concept, options, explanation, image_url, image_alt, code)
SELECT qq.id, 'fr', 'Suivez l’organigramme avec une moyenne de 8. Quel message apparaît ?', 'Décision imbriquée', '["Excellent", "Admis", "Ajourné"]', '8 >= 7 est vrai, on entre donc dans la deuxième décision. 8 >= 9 est faux, le message est « Admis ».', '/img/fr/flowchart-nested.svg', 'Organigramme de décision imbriquée : moyenne reçoit 8 ; si au moins 7, on teste si au moins 9 pour écrire Excellent ou Admis ; sinon Ajourné', NULL
FROM questions qq JOIN quizzes z ON z.id = qq.quiz_id WHERE z.slug = 'estruturas-condicionais' AND qq.position = 2;

INSERT INTO questions (quiz_id, position, prompt, concept, image_url, image_alt, code, options, correct_index, explanation)
SELECT id, 3, 'Verdadeiro ou falso: numa estrutura se...senão, os dois blocos podem ser executados na mesma execução.', 'Estrutura condicional', NULL, NULL, NULL, '["Verdadeiro", "Falso"]', 1, 'Falso. Ou a condição é verdadeira e roda o bloco do "se", ou é falsa e roda o bloco do "senão". Nunca os dois.'
FROM quizzes WHERE slug = 'estruturas-condicionais';

INSERT INTO question_translations (question_id, locale, prompt, concept, options, explanation, image_url, image_alt, code)
SELECT qq.id, 'en', 'True or false: in an if...else structure, both blocks can run in the same execution.', 'Conditional structure', '["True", "False"]', 'False. Either the condition is true and the "if" block runs, or it is false and the "else" block runs. Never both.', NULL, NULL, NULL
FROM questions qq JOIN quizzes z ON z.id = qq.quiz_id WHERE z.slug = 'estruturas-condicionais' AND qq.position = 3;

INSERT INTO question_translations (question_id, locale, prompt, concept, options, explanation, image_url, image_alt, code)
SELECT qq.id, 'es', 'Verdadero o falso: en una estructura si...si no, los dos bloques pueden ejecutarse en la misma ejecución.', 'Estructura condicional', '["Verdadero", "Falso"]', 'Falso. O la condición es verdadera y se ejecuta el bloque "si", o es falsa y se ejecuta el bloque "si no". Nunca los dos.', NULL, NULL, NULL
FROM questions qq JOIN quizzes z ON z.id = qq.quiz_id WHERE z.slug = 'estruturas-condicionais' AND qq.position = 3;

INSERT INTO question_translations (question_id, locale, prompt, concept, options, explanation, image_url, image_alt, code)
SELECT qq.id, 'fr', 'Vrai ou faux : dans une structure si...sinon, les deux blocs peuvent s’exécuter lors de la même exécution.', 'Structure conditionnelle', '["Vrai", "Faux"]', 'Faux. Soit la condition est vraie et le bloc « si » s’exécute, soit elle est fausse et c’est le bloc « sinon ». Jamais les deux.', NULL, NULL, NULL
FROM questions qq JOIN quizzes z ON z.id = qq.quiz_id WHERE z.slug = 'estruturas-condicionais' AND qq.position = 3;

INSERT INTO questions (quiz_id, position, prompt, concept, image_url, image_alt, code, options, correct_index, explanation)
SELECT id, 4, 'Qual será a saída do algoritmo?', 'Escolha/caso', NULL, NULL, 'dia ← 3
escolha dia
    caso 1: escreva("Domingo")
    caso 2: escreva("Segunda")
    caso 3: escreva("Terça")
    outrocaso: escreva("Dia inválido")
fimescolha', '["Domingo", "Segunda", "Terça", "Dia inválido", "Nada é exibido"]', 2, 'O valor de dia é 3, então o fluxo entra no "caso 3" e escreve "Terça". O "outrocaso" só roda quando nenhum caso corresponde.'
FROM quizzes WHERE slug = 'estruturas-condicionais';

INSERT INTO question_translations (question_id, locale, prompt, concept, options, explanation, image_url, image_alt, code)
SELECT qq.id, 'en', 'What will the algorithm output?', 'Switch/case', '["Sunday", "Monday", "Tuesday", "Invalid day", "Nothing is displayed"]', 'The value of day is 3, so the flow enters "case 3" and writes "Tuesday". The "otherwise" branch only runs when no case matches.', NULL, NULL, 'day ← 3
switch day
    case 1: write("Sunday")
    case 2: write("Monday")
    case 3: write("Tuesday")
    otherwise: write("Invalid day")
end switch'
FROM questions qq JOIN quizzes z ON z.id = qq.quiz_id WHERE z.slug = 'estruturas-condicionais' AND qq.position = 4;

INSERT INTO question_translations (question_id, locale, prompt, concept, options, explanation, image_url, image_alt, code)
SELECT qq.id, 'es', '¿Cuál será la salida del algoritmo?', 'Según/caso', '["Domingo", "Lunes", "Martes", "Día no válido", "No se muestra nada"]', 'El valor de dia es 3, así que el flujo entra en el "caso 3" y escribe "Martes". El "de otro modo" solo se ejecuta cuando ningún caso coincide.', NULL, NULL, 'dia ← 3
según dia
    caso 1: escribir("Domingo")
    caso 2: escribir("Lunes")
    caso 3: escribir("Martes")
    de otro modo: escribir("Día no válido")
fin según'
FROM questions qq JOIN quizzes z ON z.id = qq.quiz_id WHERE z.slug = 'estruturas-condicionais' AND qq.position = 4;

INSERT INTO question_translations (question_id, locale, prompt, concept, options, explanation, image_url, image_alt, code)
SELECT qq.id, 'fr', 'Quelle sera la sortie de l’algorithme ?', 'Selon/cas', '["Dimanche", "Lundi", "Mardi", "Jour invalide", "Rien n’est affiché"]', 'La valeur de jour est 3, le flux entre donc dans « cas 3 » et écrit « Mardi ». La branche « autrement » ne s’exécute que si aucun cas ne correspond.', NULL, NULL, 'jour ← 3
selon jour
    cas 1 : écrire("Dimanche")
    cas 2 : écrire("Lundi")
    cas 3 : écrire("Mardi")
    autrement : écrire("Jour invalide")
fin selon'
FROM questions qq JOIN quizzes z ON z.id = qq.quiz_id WHERE z.slug = 'estruturas-condicionais' AND qq.position = 4;

INSERT INTO questions (quiz_id, position, prompt, concept, image_url, image_alt, code, options, correct_index, explanation)
SELECT id, 5, 'Qual condição verifica corretamente se x está entre 10 e 20, incluindo os extremos?', 'Operadores lógicos', NULL, NULL, NULL, '["x >= 10 E x <= 20", "x >= 10 OU x <= 20", "x > 10 E x < 20", "NÃO (x >= 10)"]', 0, 'Precisamos das duas condições ao mesmo tempo, por isso o E. Com OU, qualquer número passaria; com > e < os extremos 10 e 20 ficariam de fora.'
FROM quizzes WHERE slug = 'estruturas-condicionais';

INSERT INTO question_translations (question_id, locale, prompt, concept, options, explanation, image_url, image_alt, code)
SELECT qq.id, 'en', 'Which condition correctly checks whether x is between 10 and 20, inclusive?', 'Logical operators', '["x >= 10 AND x <= 20", "x >= 10 OR x <= 20", "x > 10 AND x < 20", "NOT (x >= 10)"]', 'Both conditions must hold at the same time, hence AND. With OR any number would pass; with > and < the limits 10 and 20 would be left out.', NULL, NULL, NULL
FROM questions qq JOIN quizzes z ON z.id = qq.quiz_id WHERE z.slug = 'estruturas-condicionais' AND qq.position = 5;

INSERT INTO question_translations (question_id, locale, prompt, concept, options, explanation, image_url, image_alt, code)
SELECT qq.id, 'es', '¿Qué condición verifica correctamente si x está entre 10 y 20, incluidos los extremos?', 'Operadores lógicos', '["x >= 10 Y x <= 20", "x >= 10 O x <= 20", "x > 10 Y x < 20", "NO (x >= 10)"]', 'Necesitamos las dos condiciones al mismo tiempo, por eso Y. Con O pasaría cualquier número; con > y < los extremos 10 y 20 quedarían fuera.', NULL, NULL, NULL
FROM questions qq JOIN quizzes z ON z.id = qq.quiz_id WHERE z.slug = 'estruturas-condicionais' AND qq.position = 5;

INSERT INTO question_translations (question_id, locale, prompt, concept, options, explanation, image_url, image_alt, code)
SELECT qq.id, 'fr', 'Quelle condition vérifie correctement que x est entre 10 et 20, bornes comprises ?', 'Opérateurs logiques', '["x >= 10 ET x <= 20", "x >= 10 OU x <= 20", "x > 10 ET x < 20", "NON (x >= 10)"]', 'Les deux conditions doivent être vraies en même temps, d’où le ET. Avec OU, n’importe quel nombre passerait ; avec > et <, les bornes 10 et 20 seraient exclues.', NULL, NULL, NULL
FROM questions qq JOIN quizzes z ON z.id = qq.quiz_id WHERE z.slug = 'estruturas-condicionais' AND qq.position = 5;

INSERT INTO questions (quiz_id, position, prompt, concept, image_url, image_alt, code, options, correct_index, explanation)
SELECT id, 6, 'Faça o teste de mesa: qual valor será exibido?', 'Teste de mesa', NULL, NULL, 'a ← 5
b ← 9
se a > b então
    maior ← a
senão
    maior ← b
fimse
escreva(maior)', '["5", "9", "14", "a", "b", "erro de execução"]', 1, 'Como 5 > 9 é falso, executa o senão: maior ← b, ou seja, 9. O algoritmo encontra o maior entre dois números.'
FROM quizzes WHERE slug = 'estruturas-condicionais';

INSERT INTO question_translations (question_id, locale, prompt, concept, options, explanation, image_url, image_alt, code)
SELECT qq.id, 'en', 'Desk-check it: what value will be displayed?', 'Desk checking', '["5", "9", "14", "a", "b", "runtime error"]', 'Since 5 > 9 is false, the else branch runs: largest ← b, that is, 9. The algorithm finds the larger of two numbers.', NULL, NULL, 'a ← 5
b ← 9
if a > b then
    largest ← a
else
    largest ← b
end if
write(largest)'
FROM questions qq JOIN quizzes z ON z.id = qq.quiz_id WHERE z.slug = 'estruturas-condicionais' AND qq.position = 6;

INSERT INTO question_translations (question_id, locale, prompt, concept, options, explanation, image_url, image_alt, code)
SELECT qq.id, 'es', 'Haz la prueba de escritorio: ¿qué valor se mostrará?', 'Prueba de escritorio', '["5", "9", "14", "a", "b", "error de ejecución"]', 'Como 5 > 9 es falso, se ejecuta el si no: mayor ← b, es decir, 9. El algoritmo encuentra el mayor de dos números.', NULL, NULL, 'a ← 5
b ← 9
si a > b entonces
    mayor ← a
si no
    mayor ← b
fin si
escribir(mayor)'
FROM questions qq JOIN quizzes z ON z.id = qq.quiz_id WHERE z.slug = 'estruturas-condicionais' AND qq.position = 6;

INSERT INTO question_translations (question_id, locale, prompt, concept, options, explanation, image_url, image_alt, code)
SELECT qq.id, 'fr', 'Exécutez pas à pas : quelle valeur sera affichée ?', 'Exécution pas à pas', '["5", "9", "14", "a", "b", "erreur d’exécution"]', 'Comme 5 > 9 est faux, la branche sinon s’exécute : plusGrand ← b, soit 9. L’algorithme trouve le plus grand de deux nombres.', NULL, NULL, 'a ← 5
b ← 9
si a > b alors
    plusGrand ← a
sinon
    plusGrand ← b
fin si
écrire(plusGrand)'
FROM questions qq JOIN quizzes z ON z.id = qq.quiz_id WHERE z.slug = 'estruturas-condicionais' AND qq.position = 6;

INSERT INTO quizzes (owner_id, slug, title, description, audience, objective, video_url, license, published)
VALUES ((SELECT id FROM owners ORDER BY id LIMIT 1), 'estruturas-de-repeticao', 'Laços de repetição e teste de mesa', 'Com o apoio do vídeo do Curso em Vídeo, treine enquanto, para com passo, repita...até, acumuladores, laços aninhados e laço infinito.', 'Ensino Médio Técnico e 1º período de Computação', 'Simular a execução de laços de repetição, contando iterações e acompanhando variáveis passo a passo.', 'https://www.youtube.com/watch?v=U5PnCt58Q68', 'CC BY-NC-SA 4.0', 1);

INSERT INTO quiz_translations (quiz_id, locale, title, description, audience, objective)
SELECT id, 'en', 'Loops and desk checking', 'With the support video, practice while, for with step, repeat...until, accumulators, nested loops and infinite loops.', 'Technical high school and first-year Computing students', 'Simulate the execution of loops, counting iterations and tracking variables step by step.' FROM quizzes WHERE slug = 'estruturas-de-repeticao';

INSERT INTO quiz_translations (quiz_id, locale, title, description, audience, objective)
SELECT id, 'es', 'Bucles y prueba de escritorio', 'Con el video de apoyo, practica mientras, para con paso, repetir...hasta que, acumuladores, bucles anidados y bucle infinito.', 'Educación media técnica y primer semestre de Computación', 'Simular la ejecución de bucles, contando iteraciones y siguiendo las variables paso a paso.' FROM quizzes WHERE slug = 'estruturas-de-repeticao';

INSERT INTO quiz_translations (quiz_id, locale, title, description, audience, objective)
SELECT id, 'fr', 'Boucles et exécution pas à pas', 'Avec la vidéo d’accompagnement, entraînez-vous avec tant que, pour avec pas, répéter...jusqu’à, les accumulateurs, les boucles imbriquées et la boucle infinie.', 'Lycée technique et première année d’informatique', 'Simuler l’exécution de boucles en comptant les itérations et en suivant les variables pas à pas.' FROM quizzes WHERE slug = 'estruturas-de-repeticao';

INSERT INTO questions (quiz_id, position, prompt, concept, image_url, image_alt, code, options, correct_index, explanation)
SELECT id, 1, 'Acompanhe o fluxograma e o pseudocódigo. Quais valores são exibidos, na ordem?', 'Enquanto', '/img/flowchart-while.svg', 'Fluxograma do laço enquanto: contador recebe 3; enquanto contador maior que 0, escreve contador e diminui 1', 'contador ← 3
enquanto contador > 0 faça
    escreva(contador)
    contador ← contador - 1
fimenquanto', '["3 2 1", "3 2 1 0", "2 1 0", "1 2 3"]', 0, 'Exibe 3, 2 e 1. Quando contador vale 0, a condição 0 > 0 é falsa e o laço termina antes de escrever.'
FROM quizzes WHERE slug = 'estruturas-de-repeticao';

INSERT INTO question_translations (question_id, locale, prompt, concept, options, explanation, image_url, image_alt, code)
SELECT qq.id, 'en', 'Follow the flowchart and the pseudocode. Which values are displayed, in order?', 'While', '["3 2 1", "3 2 1 0", "2 1 0", "1 2 3"]', 'It writes 3, 2 and 1. When counter is 0, the condition 0 > 0 is false and the loop ends before writing.', '/img/en/flowchart-while.svg', 'While loop flowchart: counter receives 3; while counter is greater than 0, write counter and subtract 1', 'counter ← 3
while counter > 0 do
    write(counter)
    counter ← counter - 1
end while'
FROM questions qq JOIN quizzes z ON z.id = qq.quiz_id WHERE z.slug = 'estruturas-de-repeticao' AND qq.position = 1;

INSERT INTO question_translations (question_id, locale, prompt, concept, options, explanation, image_url, image_alt, code)
SELECT qq.id, 'es', 'Sigue el diagrama de flujo y el pseudocódigo. ¿Qué valores se muestran, en orden?', 'Mientras', '["3 2 1", "3 2 1 0", "2 1 0", "1 2 3"]', 'Muestra 3, 2 y 1. Cuando contador vale 0, la condición 0 > 0 es falsa y el bucle termina antes de escribir.', '/img/es/flowchart-while.svg', 'Diagrama del bucle mientras: contador recibe 3; mientras contador sea mayor que 0, escribe contador y resta 1', 'contador ← 3
mientras contador > 0 hacer
    escribir(contador)
    contador ← contador - 1
fin mientras'
FROM questions qq JOIN quizzes z ON z.id = qq.quiz_id WHERE z.slug = 'estruturas-de-repeticao' AND qq.position = 1;

INSERT INTO question_translations (question_id, locale, prompt, concept, options, explanation, image_url, image_alt, code)
SELECT qq.id, 'fr', 'Suivez l’organigramme et le pseudocode. Quelles valeurs sont affichées, dans l’ordre ?', 'Tant que', '["3 2 1", "3 2 1 0", "2 1 0", "1 2 3"]', 'Il affiche 3, 2 et 1. Quand compteur vaut 0, la condition 0 > 0 est fausse et la boucle s’arrête avant d’écrire.', '/img/fr/flowchart-while.svg', 'Organigramme de la boucle tant que : compteur reçoit 3 ; tant que compteur est supérieur à 0, on écrit compteur et on retire 1', 'compteur ← 3
tant que compteur > 0 faire
    écrire(compteur)
    compteur ← compteur - 1
fin tant que'
FROM questions qq JOIN quizzes z ON z.id = qq.quiz_id WHERE z.slug = 'estruturas-de-repeticao' AND qq.position = 1;

INSERT INTO questions (quiz_id, position, prompt, concept, image_url, image_alt, code, options, correct_index, explanation)
SELECT id, 2, 'Quantas vezes o laço executa (valor exibido)?', 'Para com passo', NULL, NULL, 'total ← 0
para i de 1 até 10 passo 2 faça
    total ← total + 1
fimpara
escreva(total)', '["2", "4", "5", "6", "10"]', 2, 'Com passo 2, i assume 1, 3, 5, 7 e 9. São 5 repetições, então total termina em 5.'
FROM quizzes WHERE slug = 'estruturas-de-repeticao';

INSERT INTO question_translations (question_id, locale, prompt, concept, options, explanation, image_url, image_alt, code)
SELECT qq.id, 'en', 'How many times does the loop run (value displayed)?', 'For with step', '["2", "4", "5", "6", "10"]', 'With step 2, i takes 1, 3, 5, 7 and 9. That is 5 repetitions, so total ends at 5.', NULL, NULL, 'total ← 0
for i from 1 to 10 step 2 do
    total ← total + 1
end for
write(total)'
FROM questions qq JOIN quizzes z ON z.id = qq.quiz_id WHERE z.slug = 'estruturas-de-repeticao' AND qq.position = 2;

INSERT INTO question_translations (question_id, locale, prompt, concept, options, explanation, image_url, image_alt, code)
SELECT qq.id, 'es', '¿Cuántas veces se ejecuta el bucle (valor mostrado)?', 'Para con paso', '["2", "4", "5", "6", "10"]', 'Con paso 2, i toma 1, 3, 5, 7 y 9. Son 5 repeticiones, así que total termina en 5.', NULL, NULL, 'total ← 0
para i desde 1 hasta 10 con paso 2 hacer
    total ← total + 1
fin para
escribir(total)'
FROM questions qq JOIN quizzes z ON z.id = qq.quiz_id WHERE z.slug = 'estruturas-de-repeticao' AND qq.position = 2;

INSERT INTO question_translations (question_id, locale, prompt, concept, options, explanation, image_url, image_alt, code)
SELECT qq.id, 'fr', 'Combien de fois la boucle s’exécute-t-elle (valeur affichée) ?', 'Pour avec pas', '["2", "4", "5", "6", "10"]', 'Avec un pas de 2, i prend 1, 3, 5, 7 et 9. Cela fait 5 répétitions, donc total vaut 5 à la fin.', NULL, NULL, 'total ← 0
pour i de 1 à 10 pas 2 faire
    total ← total + 1
fin pour
écrire(total)'
FROM questions qq JOIN quizzes z ON z.id = qq.quiz_id WHERE z.slug = 'estruturas-de-repeticao' AND qq.position = 2;

INSERT INTO questions (quiz_id, position, prompt, concept, image_url, image_alt, code, options, correct_index, explanation)
SELECT id, 3, 'Verdadeiro ou falso: um laço enquanto cuja condição nunca se torna falsa gera um laço infinito.', 'Laço infinito', NULL, NULL, NULL, '["Verdadeiro", "Falso"]', 0, 'Verdadeiro. Se nada dentro do laço altera a condição para falsa (por exemplo, esquecer de decrementar o contador), ele nunca termina.'
FROM quizzes WHERE slug = 'estruturas-de-repeticao';

INSERT INTO question_translations (question_id, locale, prompt, concept, options, explanation, image_url, image_alt, code)
SELECT qq.id, 'en', 'True or false: a while loop whose condition never becomes false creates an infinite loop.', 'Infinite loop', '["True", "False"]', 'True. If nothing inside the loop makes the condition false (for example, forgetting to decrement the counter), it never ends.', NULL, NULL, NULL
FROM questions qq JOIN quizzes z ON z.id = qq.quiz_id WHERE z.slug = 'estruturas-de-repeticao' AND qq.position = 3;

INSERT INTO question_translations (question_id, locale, prompt, concept, options, explanation, image_url, image_alt, code)
SELECT qq.id, 'es', 'Verdadero o falso: un bucle mientras cuya condición nunca se vuelve falsa genera un bucle infinito.', 'Bucle infinito', '["Verdadero", "Falso"]', 'Verdadero. Si nada dentro del bucle vuelve falsa la condición (por ejemplo, olvidar decrementar el contador), nunca termina.', NULL, NULL, NULL
FROM questions qq JOIN quizzes z ON z.id = qq.quiz_id WHERE z.slug = 'estruturas-de-repeticao' AND qq.position = 3;

INSERT INTO question_translations (question_id, locale, prompt, concept, options, explanation, image_url, image_alt, code)
SELECT qq.id, 'fr', 'Vrai ou faux : une boucle tant que dont la condition ne devient jamais fausse crée une boucle infinie.', 'Boucle infinie', '["Vrai", "Faux"]', 'Vrai. Si rien dans la boucle ne rend la condition fausse (par exemple, oublier de décrémenter le compteur), elle ne s’arrête jamais.', NULL, NULL, NULL
FROM questions qq JOIN quizzes z ON z.id = qq.quiz_id WHERE z.slug = 'estruturas-de-repeticao' AND qq.position = 3;

INSERT INTO questions (quiz_id, position, prompt, concept, image_url, image_alt, code, options, correct_index, explanation)
SELECT id, 4, 'Qual valor será exibido?', 'Repita...até', NULL, NULL, 'x ← 10
repita
    x ← x - 3
até x < 0
escreva(x)', '["1", "-2", "-1", "0"]', 1, 'x vale 10, 7, 4, 1 e -2. Só depois de chegar a -2 a condição x < 0 fica verdadeira e o laço para. O repita sempre executa pelo menos uma vez.'
FROM quizzes WHERE slug = 'estruturas-de-repeticao';

INSERT INTO question_translations (question_id, locale, prompt, concept, options, explanation, image_url, image_alt, code)
SELECT qq.id, 'en', 'What value will be displayed?', 'Repeat...until', '["1", "-2", "-1", "0"]', 'x goes 10, 7, 4, 1 and -2. Only at -2 does the condition x < 0 become true and the loop stops. Repeat always runs at least once.', NULL, NULL, 'x ← 10
repeat
    x ← x - 3
until x < 0
write(x)'
FROM questions qq JOIN quizzes z ON z.id = qq.quiz_id WHERE z.slug = 'estruturas-de-repeticao' AND qq.position = 4;

INSERT INTO question_translations (question_id, locale, prompt, concept, options, explanation, image_url, image_alt, code)
SELECT qq.id, 'es', '¿Qué valor se mostrará?', 'Repetir...hasta que', '["1", "-2", "-1", "0"]', 'x vale 10, 7, 4, 1 y -2. Solo al llegar a -2 la condición x < 0 es verdadera y el bucle se detiene. Repetir siempre se ejecuta al menos una vez.', NULL, NULL, 'x ← 10
repetir
    x ← x - 3
hasta que x < 0
escribir(x)'
FROM questions qq JOIN quizzes z ON z.id = qq.quiz_id WHERE z.slug = 'estruturas-de-repeticao' AND qq.position = 4;

INSERT INTO question_translations (question_id, locale, prompt, concept, options, explanation, image_url, image_alt, code)
SELECT qq.id, 'fr', 'Quelle valeur sera affichée ?', 'Répéter...jusqu’à', '["1", "-2", "-1", "0"]', 'x vaut 10, 7, 4, 1 puis -2. Ce n’est qu’à -2 que la condition x < 0 devient vraie et que la boucle s’arrête. Répéter s’exécute toujours au moins une fois.', NULL, NULL, 'x ← 10
répéter
    x ← x - 3
jusqu’à x < 0
écrire(x)'
FROM questions qq JOIN quizzes z ON z.id = qq.quiz_id WHERE z.slug = 'estruturas-de-repeticao' AND qq.position = 4;

INSERT INTO questions (quiz_id, position, prompt, concept, image_url, image_alt, code, options, correct_index, explanation)
SELECT id, 5, 'No fluxograma, se a condição mudar para i ≤ 5, qual valor será exibido?', 'Acumulador', '/img/flowchart-loop.svg', 'Fluxograma de repetição: soma recebe 0, i de 1 até o limite, soma recebe soma mais i, ao final escreva soma', NULL, '["10", "12", "15", "20", "21", "5"]', 2, 'A soma acumula 1 + 2 + 3 + 4 + 5 = 15. A variável soma é um acumulador: guarda o resultado parcial a cada volta.'
FROM quizzes WHERE slug = 'estruturas-de-repeticao';

INSERT INTO question_translations (question_id, locale, prompt, concept, options, explanation, image_url, image_alt, code)
SELECT qq.id, 'en', 'In the flowchart, if the condition changes to i ≤ 5, what value will be displayed?', 'Accumulator', '["10", "12", "15", "20", "21", "5"]', 'The sum accumulates 1 + 2 + 3 + 4 + 5 = 15. The variable sum is an accumulator: it keeps the partial result on each pass.', '/img/en/flowchart-loop.svg', 'Loop flowchart: sum receives 0, i from 1 to the limit, sum receives sum plus i, at the end write sum', NULL
FROM questions qq JOIN quizzes z ON z.id = qq.quiz_id WHERE z.slug = 'estruturas-de-repeticao' AND qq.position = 5;

INSERT INTO question_translations (question_id, locale, prompt, concept, options, explanation, image_url, image_alt, code)
SELECT qq.id, 'es', 'En el diagrama de flujo, si la condición cambia a i ≤ 5, ¿qué valor se mostrará?', 'Acumulador', '["10", "12", "15", "20", "21", "5"]', 'La suma acumula 1 + 2 + 3 + 4 + 5 = 15. La variable suma es un acumulador: guarda el resultado parcial en cada vuelta.', '/img/es/flowchart-loop.svg', 'Diagrama de repetición: suma recibe 0, i desde 1 hasta el límite, suma recibe suma más i, al final escribir suma', NULL
FROM questions qq JOIN quizzes z ON z.id = qq.quiz_id WHERE z.slug = 'estruturas-de-repeticao' AND qq.position = 5;

INSERT INTO question_translations (question_id, locale, prompt, concept, options, explanation, image_url, image_alt, code)
SELECT qq.id, 'fr', 'Dans l’organigramme, si la condition devient i ≤ 5, quelle valeur sera affichée ?', 'Accumulateur', '["10", "12", "15", "20", "21", "5"]', 'La somme accumule 1 + 2 + 3 + 4 + 5 = 15. La variable somme est un accumulateur : elle garde le résultat partiel à chaque tour.', '/img/fr/flowchart-loop.svg', 'Organigramme de boucle : somme reçoit 0, i de 1 jusqu’à la limite, somme reçoit somme plus i, à la fin écrire somme', NULL
FROM questions qq JOIN quizzes z ON z.id = qq.quiz_id WHERE z.slug = 'estruturas-de-repeticao' AND qq.position = 5;

INSERT INTO questions (quiz_id, position, prompt, concept, image_url, image_alt, code, options, correct_index, explanation)
SELECT id, 6, 'Quantas vezes a instrução interna é executada (valor exibido)?', 'Laços aninhados', NULL, NULL, 'cont ← 0
para i de 1 até 3 faça
    para j de 1 até 2 faça
        cont ← cont + 1
    fimpara
fimpara
escreva(cont)', '["5", "6", "9"]', 1, 'O laço externo roda 3 vezes e, a cada volta, o interno roda 2 vezes: 3 × 2 = 6.'
FROM quizzes WHERE slug = 'estruturas-de-repeticao';

INSERT INTO question_translations (question_id, locale, prompt, concept, options, explanation, image_url, image_alt, code)
SELECT qq.id, 'en', 'How many times does the inner instruction run (value displayed)?', 'Nested loops', '["5", "6", "9"]', 'The outer loop runs 3 times and, on each pass, the inner loop runs 2 times: 3 × 2 = 6.', NULL, NULL, 'count ← 0
for i from 1 to 3 do
    for j from 1 to 2 do
        count ← count + 1
    end for
end for
write(count)'
FROM questions qq JOIN quizzes z ON z.id = qq.quiz_id WHERE z.slug = 'estruturas-de-repeticao' AND qq.position = 6;

INSERT INTO question_translations (question_id, locale, prompt, concept, options, explanation, image_url, image_alt, code)
SELECT qq.id, 'es', '¿Cuántas veces se ejecuta la instrucción interna (valor mostrado)?', 'Bucles anidados', '["5", "6", "9"]', 'El bucle externo se ejecuta 3 veces y, en cada vuelta, el interno se ejecuta 2 veces: 3 × 2 = 6.', NULL, NULL, 'cont ← 0
para i desde 1 hasta 3 hacer
    para j desde 1 hasta 2 hacer
        cont ← cont + 1
    fin para
fin para
escribir(cont)'
FROM questions qq JOIN quizzes z ON z.id = qq.quiz_id WHERE z.slug = 'estruturas-de-repeticao' AND qq.position = 6;

INSERT INTO question_translations (question_id, locale, prompt, concept, options, explanation, image_url, image_alt, code)
SELECT qq.id, 'fr', 'Combien de fois l’instruction interne s’exécute-t-elle (valeur affichée) ?', 'Boucles imbriquées', '["5", "6", "9"]', 'La boucle externe tourne 3 fois et, à chaque tour, la boucle interne tourne 2 fois : 3 × 2 = 6.', NULL, NULL, 'compte ← 0
pour i de 1 à 3 faire
    pour j de 1 à 2 faire
        compte ← compte + 1
    fin pour
fin pour
écrire(compte)'
FROM questions qq JOIN quizzes z ON z.id = qq.quiz_id WHERE z.slug = 'estruturas-de-repeticao' AND qq.position = 6;
