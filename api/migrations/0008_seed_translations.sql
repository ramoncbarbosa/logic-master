INSERT INTO quiz_translations (quiz_id, locale, title, description, audience, objective)
SELECT id, 'en', 'Fundamentals of Computational Logic', 'Interactive quiz with instant feedback on propositions, logical connectives, truth tables, flowcharts, conditional structures and loops.', 'Technical high school / vocational education and first-year Computing undergraduates', 'Evaluate propositions and boolean expressions, reason with truth tables and predict the output of simple algorithms with decisions and loops (desk checking).' FROM quizzes WHERE slug = 'fundamentos-logica-computacional';

INSERT INTO quiz_translations (quiz_id, locale, title, description, audience, objective)
SELECT id, 'es', 'Fundamentos de Lógica Computacional', 'Quiz interactivo con retroalimentación inmediata sobre proposiciones, conectores lógicos, tablas de verdad, diagramas de flujo, estructuras condicionales y de repetición.', 'Educación media técnica / formación profesional y primer semestre de la carrera de Computación', 'Evaluar proposiciones y expresiones booleanas, razonar con tablas de verdad y predecir la salida de algoritmos simples con decisiones y repeticiones (prueba de escritorio).' FROM quizzes WHERE slug = 'fundamentos-logica-computacional';

INSERT INTO quiz_translations (quiz_id, locale, title, description, audience, objective)
SELECT id, 'fr', 'Fondamentaux de la logique informatique', 'Quiz interactif avec retour immédiat sur les propositions, les connecteurs logiques, les tables de vérité, les organigrammes, les structures conditionnelles et les boucles.', 'Lycée technique / formation professionnelle et première année de licence en informatique', 'Évaluer des propositions et des expressions booléennes, raisonner avec des tables de vérité et prévoir la sortie d’algorithmes simples avec décisions et boucles (exécution pas à pas).' FROM quizzes WHERE slug = 'fundamentos-logica-computacional';

INSERT INTO question_translations (question_id, locale, prompt, concept, options, explanation, image_url, image_alt, code)
SELECT qq.id, 'en', 'Which of the options below is a logical proposition?', 'Propositions', '["What time is it?", "Close the door!", "7 is a prime number.", "x + 2"]', 'A proposition is a declarative sentence that can be classified as either true or false, but not both. Questions, commands and open expressions (like x + 2) are not propositions.', NULL, NULL, NULL
FROM questions qq JOIN quizzes z ON z.id = qq.quiz_id WHERE z.slug = 'fundamentos-logica-computacional' AND qq.position = 1;

INSERT INTO question_translations (question_id, locale, prompt, concept, options, explanation, image_url, image_alt, code)
SELECT qq.id, 'en', 'Look at the AND logic gate. If P = True and Q = False, what is the value of P ∧ Q?', 'Logical connectives', '["True", "False", "Undetermined", "It depends on the order of P and Q"]', 'Conjunction (AND) is true only when ALL inputs are true. Since Q is false, P ∧ Q is false.', '/img/en/and-gate.svg', 'AND logic gate with inputs P and Q and one output', NULL
FROM questions qq JOIN quizzes z ON z.id = qq.quiz_id WHERE z.slug = 'fundamentos-logica-computacional' AND qq.position = 2;

INSERT INTO question_translations (question_id, locale, prompt, concept, options, explanation, image_url, image_alt, code)
SELECT qq.id, 'en', 'Look at the OR logic gate. If P = False and Q = True, what is the value of P ∨ Q?', 'Logical connectives', '["True", "False", "Undetermined", "It is only true if P is also true"]', 'Disjunction (OR) is true when AT LEAST ONE of the inputs is true. Since Q is true, P ∨ Q is true.', '/img/en/or-gate.svg', 'OR logic gate with inputs P and Q and one output', NULL
FROM questions qq JOIN quizzes z ON z.id = qq.quiz_id WHERE z.slug = 'fundamentos-logica-computacional' AND qq.position = 3;

INSERT INTO question_translations (question_id, locale, prompt, concept, options, explanation, image_url, image_alt, code)
SELECT qq.id, 'en', 'What is the logical value of ¬(T ∧ F)?', 'Negation', '["True", "False", "It cannot be calculated", "T and F at the same time"]', 'First solve the parentheses: T ∧ F = F. Then apply the negation: ¬F = T.', NULL, NULL, NULL
FROM questions qq JOIN quizzes z ON z.id = qq.quiz_id WHERE z.slug = 'fundamentos-logica-computacional' AND qq.position = 4;

INSERT INTO question_translations (question_id, locale, prompt, concept, options, explanation, image_url, image_alt, code)
SELECT qq.id, 'en', 'The image shows the truth table of an expression with 2 variables (4 rows). How many rows will the truth table of an expression with 3 variables have?', 'Truth table', '["3", "6", "8", "9"]', 'The number of rows is 2 raised to the number of variables: 2³ = 8 possible combinations of T and F.', '/img/en/truth-table.svg', 'Truth table of variables P and Q with the columns P AND Q and P OR Q', NULL
FROM questions qq JOIN quizzes z ON z.id = qq.quiz_id WHERE z.slug = 'fundamentos-logica-computacional' AND qq.position = 5;

INSERT INTO question_translations (question_id, locale, prompt, concept, options, explanation, image_url, image_alt, code)
SELECT qq.id, 'en', 'The conditional proposition P → Q (if P, then Q) is FALSE only when:', 'Conditional', '["P is false and Q is true", "P is true and Q is false", "P and Q are false", "P and Q are true"]', 'The conditional is false only when the promise is broken: the antecedent (P) happens and the consequent (Q) does not.', NULL, NULL, NULL
FROM questions qq JOIN quizzes z ON z.id = qq.quiz_id WHERE z.slug = 'fundamentos-logica-computacional' AND qq.position = 6;

INSERT INTO question_translations (question_id, locale, prompt, concept, options, explanation, image_url, image_alt, code)
SELECT qq.id, 'en', 'According to De Morgan’s law, the expression ¬(A ∧ B) is equivalent to:', 'De Morgan’s laws', '["¬A ∧ ¬B", "¬A ∨ ¬B", "A ∨ B", "¬A ∧ B"]', 'The negation of a conjunction is the disjunction of the negations: ¬(A ∧ B) ≡ ¬A ∨ ¬B. The AND becomes OR and each term is negated.', NULL, NULL, NULL
FROM questions qq JOIN quizzes z ON z.id = qq.quiz_id WHERE z.slug = 'fundamentos-logica-computacional' AND qq.position = 7;

INSERT INTO question_translations (question_id, locale, prompt, concept, options, explanation, image_url, image_alt, code)
SELECT qq.id, 'en', 'Analyze the flowchart. If the variable grade receives the value 6, what will be displayed?', 'Conditional structure', '["Passed", "Make-up exam", "Passed and Make-up exam", "Nothing is displayed"]', 'The condition 6 >= 7 is false, so the flow follows the NO path and displays Make-up exam. Only one of the branches of the conditional is executed.', '/img/en/flowchart-decision.svg', 'Flowchart: start, grade receives 6, decision grade greater than or equal to 7; if yes write Passed, if no write Make-up exam; end', NULL
FROM questions qq JOIN quizzes z ON z.id = qq.quiz_id WHERE z.slug = 'fundamentos-logica-computacional' AND qq.position = 8;

INSERT INTO question_translations (question_id, locale, prompt, concept, options, explanation, image_url, image_alt, code)
SELECT qq.id, 'en', 'Desk-check the algorithm below. What value will be displayed?', 'Loop structure', '["4", "5", "10", "15"]', 'The loop runs 4 times: sum = 0+1 = 1, 1+2 = 3, 3+3 = 6, 6+4 = 10. The value displayed is 10.', '/img/en/flowchart-loop.svg', 'Loop flowchart: sum receives 0, i from 1 to 4, sum receives sum plus i, at the end write sum', 'sum ← 0
for i from 1 to 4 do
    sum ← sum + i
end for
write(sum)'
FROM questions qq JOIN quizzes z ON z.id = qq.quiz_id WHERE z.slug = 'fundamentos-logica-computacional' AND qq.position = 9;

INSERT INTO question_translations (question_id, locale, prompt, concept, options, explanation, image_url, image_alt, code)
SELECT qq.id, 'en', 'What is the final value of the variable canEnter?', 'Boolean expressions', '["true", "false", "17", "runtime error"]', '(17 >= 18) is false, but false OR true = true. In a disjunction it is enough for one of the conditions to be true.', NULL, NULL, 'age ← 17
hasPermission ← true
canEnter ← (age >= 18) OR hasPermission'
FROM questions qq JOIN quizzes z ON z.id = qq.quiz_id WHERE z.slug = 'fundamentos-logica-computacional' AND qq.position = 10;

INSERT INTO question_translations (question_id, locale, prompt, concept, options, explanation, image_url, image_alt, code)
SELECT qq.id, 'en', 'Desk-check the algorithm: what are the final values of a and b?', 'Sequential algorithms', '["a = 3 and b = 5", "a = 8 and b = 3", "a = 5 and b = 3", "a = 5 and b = 8"]', 'Step by step: a = 3+5 = 8; b = 8-5 = 3; a = 8-3 = 5. The algorithm swaps the values of the variables without using an auxiliary variable.', NULL, NULL, 'a ← 3
b ← 5
a ← a + b
b ← a - b
a ← a - b'
FROM questions qq JOIN quizzes z ON z.id = qq.quiz_id WHERE z.slug = 'fundamentos-logica-computacional' AND qq.position = 11;

INSERT INTO question_translations (question_id, locale, prompt, concept, options, explanation, image_url, image_alt, code)
SELECT qq.id, 'en', 'What correctly characterizes an algorithm?', 'Algorithms', '["A program necessarily written in a programming language", "A finite, ordered and unambiguous sequence of steps to solve a problem", "Any set of instructions, even one that never ends", "A flowchart drawing"]', 'An algorithm is a finite and well-defined sequence of steps. It can be represented in natural language, pseudocode, a flowchart or a programming language.', NULL, NULL, NULL
FROM questions qq JOIN quizzes z ON z.id = qq.quiz_id WHERE z.slug = 'fundamentos-logica-computacional' AND qq.position = 12;

INSERT INTO question_translations (question_id, locale, prompt, concept, options, explanation, image_url, image_alt, code)
SELECT qq.id, 'es', '¿Cuál de las opciones siguientes es una proposición lógica?', 'Proposiciones', '["¿Qué hora es?", "¡Cierra la puerta!", "7 es un número primo.", "x + 2"]', 'Una proposición es una oración declarativa que puede clasificarse como verdadera o falsa, pero no ambas. Las preguntas, las órdenes y las expresiones abiertas (como x + 2) no son proposiciones.', NULL, NULL, NULL
FROM questions qq JOIN quizzes z ON z.id = qq.quiz_id WHERE z.slug = 'fundamentos-logica-computacional' AND qq.position = 1;

INSERT INTO question_translations (question_id, locale, prompt, concept, options, explanation, image_url, image_alt, code)
SELECT qq.id, 'es', 'Observa la compuerta lógica Y (AND). Si P = Verdadero y Q = Falso, ¿cuál es el valor de P ∧ Q?', 'Conectores lógicos', '["Verdadero", "Falso", "Indeterminado", "Depende del orden de P y Q"]', 'La conjunción (Y) solo es verdadera cuando TODAS las entradas son verdaderas. Como Q es falso, P ∧ Q es falso.', '/img/es/and-gate.svg', 'Compuerta lógica AND con entradas P y Q y una salida', NULL
FROM questions qq JOIN quizzes z ON z.id = qq.quiz_id WHERE z.slug = 'fundamentos-logica-computacional' AND qq.position = 2;

INSERT INTO question_translations (question_id, locale, prompt, concept, options, explanation, image_url, image_alt, code)
SELECT qq.id, 'es', 'Observa la compuerta lógica O (OR). Si P = Falso y Q = Verdadero, ¿cuál es el valor de P ∨ Q?', 'Conectores lógicos', '["Verdadero", "Falso", "Indeterminado", "Solo es verdadero si P también lo es"]', 'La disyunción (O) es verdadera cuando AL MENOS UNA de las entradas es verdadera. Como Q es verdadero, P ∨ Q es verdadero.', '/img/es/or-gate.svg', 'Compuerta lógica OR con entradas P y Q y una salida', NULL
FROM questions qq JOIN quizzes z ON z.id = qq.quiz_id WHERE z.slug = 'fundamentos-logica-computacional' AND qq.position = 3;

INSERT INTO question_translations (question_id, locale, prompt, concept, options, explanation, image_url, image_alt, code)
SELECT qq.id, 'es', '¿Cuál es el valor lógico de ¬(V ∧ F)?', 'Negación', '["Verdadero", "Falso", "No es posible calcularlo", "V y F al mismo tiempo"]', 'Primero resolvemos los paréntesis: V ∧ F = F. Luego aplicamos la negación: ¬F = V.', NULL, NULL, NULL
FROM questions qq JOIN quizzes z ON z.id = qq.quiz_id WHERE z.slug = 'fundamentos-logica-computacional' AND qq.position = 4;

INSERT INTO question_translations (question_id, locale, prompt, concept, options, explanation, image_url, image_alt, code)
SELECT qq.id, 'es', 'La imagen muestra la tabla de verdad de una expresión con 2 variables (4 filas). ¿Cuántas filas tendrá la tabla de verdad de una expresión con 3 variables?', 'Tabla de verdad', '["3", "6", "8", "9"]', 'El número de filas es 2 elevado al número de variables: 2³ = 8 combinaciones posibles de V y F.', '/img/es/truth-table.svg', 'Tabla de verdad de las variables P y Q con las columnas P Y Q y P O Q', NULL
FROM questions qq JOIN quizzes z ON z.id = qq.quiz_id WHERE z.slug = 'fundamentos-logica-computacional' AND qq.position = 5;

INSERT INTO question_translations (question_id, locale, prompt, concept, options, explanation, image_url, image_alt, code)
SELECT qq.id, 'es', 'La proposición condicional P → Q (si P, entonces Q) es FALSA solamente cuando:', 'Condicional', '["P es falso y Q es verdadero", "P es verdadero y Q es falso", "P y Q son falsos", "P y Q son verdaderos"]', 'El condicional solo es falso cuando se rompe la promesa: el antecedente (P) ocurre y el consecuente (Q) no ocurre.', NULL, NULL, NULL
FROM questions qq JOIN quizzes z ON z.id = qq.quiz_id WHERE z.slug = 'fundamentos-logica-computacional' AND qq.position = 6;

INSERT INTO question_translations (question_id, locale, prompt, concept, options, explanation, image_url, image_alt, code)
SELECT qq.id, 'es', 'Según la ley de De Morgan, la expresión ¬(A ∧ B) es equivalente a:', 'Leyes de De Morgan', '["¬A ∧ ¬B", "¬A ∨ ¬B", "A ∨ B", "¬A ∧ B"]', 'La negación de una conjunción es la disyunción de las negaciones: ¬(A ∧ B) ≡ ¬A ∨ ¬B. El Y se convierte en O y cada término se niega.', NULL, NULL, NULL
FROM questions qq JOIN quizzes z ON z.id = qq.quiz_id WHERE z.slug = 'fundamentos-logica-computacional' AND qq.position = 7;

INSERT INTO question_translations (question_id, locale, prompt, concept, options, explanation, image_url, image_alt, code)
SELECT qq.id, 'es', 'Analiza el diagrama de flujo. Si la variable nota recibe el valor 6, ¿qué se mostrará?', 'Estructura condicional', '["Aprobado", "Recuperación", "Aprobado y Recuperación", "No se muestra nada"]', 'La condición 6 >= 7 es falsa, así que el flujo sigue por el camino NO y muestra Recuperación. Solo se ejecuta uno de los caminos de la decisión.', '/img/es/flowchart-decision.svg', 'Diagrama de flujo: inicio, nota recibe 6, decisión nota mayor o igual a 7; si sí escribir Aprobado, si no escribir Recuperación; fin', NULL
FROM questions qq JOIN quizzes z ON z.id = qq.quiz_id WHERE z.slug = 'fundamentos-logica-computacional' AND qq.position = 8;

INSERT INTO question_translations (question_id, locale, prompt, concept, options, explanation, image_url, image_alt, code)
SELECT qq.id, 'es', 'Haz la prueba de escritorio del algoritmo siguiente. ¿Qué valor se mostrará?', 'Estructura de repetición', '["4", "5", "10", "15"]', 'El bucle se ejecuta 4 veces: suma = 0+1 = 1, 1+2 = 3, 3+3 = 6, 6+4 = 10. El valor mostrado es 10.', '/img/es/flowchart-loop.svg', 'Diagrama de flujo de repetición: suma recibe 0, i desde 1 hasta 4, suma recibe suma más i, al final escribir suma', 'suma ← 0
para i desde 1 hasta 4 hacer
    suma ← suma + i
fin para
escribir(suma)'
FROM questions qq JOIN quizzes z ON z.id = qq.quiz_id WHERE z.slug = 'fundamentos-logica-computacional' AND qq.position = 9;

INSERT INTO question_translations (question_id, locale, prompt, concept, options, explanation, image_url, image_alt, code)
SELECT qq.id, 'es', '¿Cuál es el valor final de la variable puedeEntrar?', 'Expresiones booleanas', '["verdadero", "falso", "17", "error de ejecución"]', '(17 >= 18) es falso, pero falso O verdadero = verdadero. En la disyunción basta con que una de las condiciones sea verdadera.', NULL, NULL, 'edad ← 17
tienePermiso ← verdadero
puedeEntrar ← (edad >= 18) O tienePermiso'
FROM questions qq JOIN quizzes z ON z.id = qq.quiz_id WHERE z.slug = 'fundamentos-logica-computacional' AND qq.position = 10;

INSERT INTO question_translations (question_id, locale, prompt, concept, options, explanation, image_url, image_alt, code)
SELECT qq.id, 'es', 'Haz la prueba de escritorio: ¿cuáles son los valores finales de a y b?', 'Algoritmos secuenciales', '["a = 3 y b = 5", "a = 8 y b = 3", "a = 5 y b = 3", "a = 5 y b = 8"]', 'Paso a paso: a = 3+5 = 8; b = 8-5 = 3; a = 8-3 = 5. El algoritmo intercambia los valores de las variables sin usar una variable auxiliar.', NULL, NULL, 'a ← 3
b ← 5
a ← a + b
b ← a - b
a ← a - b'
FROM questions qq JOIN quizzes z ON z.id = qq.quiz_id WHERE z.slug = 'fundamentos-logica-computacional' AND qq.position = 11;

INSERT INTO question_translations (question_id, locale, prompt, concept, options, explanation, image_url, image_alt, code)
SELECT qq.id, 'es', '¿Qué caracteriza correctamente a un algoritmo?', 'Algoritmos', '["Un programa escrito obligatoriamente en un lenguaje de programación", "Una secuencia finita, ordenada y sin ambigüedad de pasos para resolver un problema", "Cualquier conjunto de instrucciones, aunque nunca termine", "Un dibujo de diagrama de flujo"]', 'Un algoritmo es una secuencia finita y bien definida de pasos. Puede representarse en lenguaje natural, pseudocódigo, diagrama de flujo o lenguaje de programación.', NULL, NULL, NULL
FROM questions qq JOIN quizzes z ON z.id = qq.quiz_id WHERE z.slug = 'fundamentos-logica-computacional' AND qq.position = 12;

INSERT INTO question_translations (question_id, locale, prompt, concept, options, explanation, image_url, image_alt, code)
SELECT qq.id, 'fr', 'Laquelle des réponses ci-dessous est une proposition logique ?', 'Propositions', '["Quelle heure est-il ?", "Ferme la porte !", "7 est un nombre premier.", "x + 2"]', 'Une proposition est une phrase déclarative qui peut être classée comme vraie ou fausse, mais pas les deux. Les questions, les ordres et les expressions ouvertes (comme x + 2) ne sont pas des propositions.', NULL, NULL, NULL
FROM questions qq JOIN quizzes z ON z.id = qq.quiz_id WHERE z.slug = 'fundamentos-logica-computacional' AND qq.position = 1;

INSERT INTO question_translations (question_id, locale, prompt, concept, options, explanation, image_url, image_alt, code)
SELECT qq.id, 'fr', 'Observez la porte logique ET (AND). Si P = Vrai et Q = Faux, quelle est la valeur de P ∧ Q ?', 'Connecteurs logiques', '["Vrai", "Faux", "Indéterminé", "Cela dépend de l’ordre de P et Q"]', 'La conjonction (ET) n’est vraie que lorsque TOUTES les entrées sont vraies. Comme Q est faux, P ∧ Q est faux.', '/img/fr/and-gate.svg', 'Porte logique AND avec les entrées P et Q et une sortie', NULL
FROM questions qq JOIN quizzes z ON z.id = qq.quiz_id WHERE z.slug = 'fundamentos-logica-computacional' AND qq.position = 2;

INSERT INTO question_translations (question_id, locale, prompt, concept, options, explanation, image_url, image_alt, code)
SELECT qq.id, 'fr', 'Observez la porte logique OU (OR). Si P = Faux et Q = Vrai, quelle est la valeur de P ∨ Q ?', 'Connecteurs logiques', '["Vrai", "Faux", "Indéterminé", "Ce n’est vrai que si P l’est aussi"]', 'La disjonction (OU) est vraie lorsqu’AU MOINS UNE des entrées est vraie. Comme Q est vrai, P ∨ Q est vrai.', '/img/fr/or-gate.svg', 'Porte logique OR avec les entrées P et Q et une sortie', NULL
FROM questions qq JOIN quizzes z ON z.id = qq.quiz_id WHERE z.slug = 'fundamentos-logica-computacional' AND qq.position = 3;

INSERT INTO question_translations (question_id, locale, prompt, concept, options, explanation, image_url, image_alt, code)
SELECT qq.id, 'fr', 'Quelle est la valeur logique de ¬(V ∧ F) ?', 'Négation', '["Vrai", "Faux", "Impossible à calculer", "V et F en même temps"]', 'On résout d’abord les parenthèses : V ∧ F = F. Puis on applique la négation : ¬F = V.', NULL, NULL, NULL
FROM questions qq JOIN quizzes z ON z.id = qq.quiz_id WHERE z.slug = 'fundamentos-logica-computacional' AND qq.position = 4;

INSERT INTO question_translations (question_id, locale, prompt, concept, options, explanation, image_url, image_alt, code)
SELECT qq.id, 'fr', 'L’image montre la table de vérité d’une expression à 2 variables (4 lignes). Combien de lignes aura la table de vérité d’une expression à 3 variables ?', 'Table de vérité', '["3", "6", "8", "9"]', 'Le nombre de lignes est 2 puissance le nombre de variables : 2³ = 8 combinaisons possibles de V et F.', '/img/fr/truth-table.svg', 'Table de vérité des variables P et Q avec les colonnes P ET Q et P OU Q', NULL
FROM questions qq JOIN quizzes z ON z.id = qq.quiz_id WHERE z.slug = 'fundamentos-logica-computacional' AND qq.position = 5;

INSERT INTO question_translations (question_id, locale, prompt, concept, options, explanation, image_url, image_alt, code)
SELECT qq.id, 'fr', 'La proposition conditionnelle P → Q (si P, alors Q) est FAUSSE uniquement lorsque :', 'Conditionnelle', '["P est faux et Q est vrai", "P est vrai et Q est faux", "P et Q sont faux", "P et Q sont vrais"]', 'La conditionnelle n’est fausse que lorsque la promesse est rompue : l’antécédent (P) se produit et le conséquent (Q) ne se produit pas.', NULL, NULL, NULL
FROM questions qq JOIN quizzes z ON z.id = qq.quiz_id WHERE z.slug = 'fundamentos-logica-computacional' AND qq.position = 6;

INSERT INTO question_translations (question_id, locale, prompt, concept, options, explanation, image_url, image_alt, code)
SELECT qq.id, 'fr', 'D’après la loi de De Morgan, l’expression ¬(A ∧ B) est équivalente à :', 'Lois de De Morgan', '["¬A ∧ ¬B", "¬A ∨ ¬B", "A ∨ B", "¬A ∧ B"]', 'La négation d’une conjonction est la disjonction des négations : ¬(A ∧ B) ≡ ¬A ∨ ¬B. Le ET devient OU et chaque terme est nié.', NULL, NULL, NULL
FROM questions qq JOIN quizzes z ON z.id = qq.quiz_id WHERE z.slug = 'fundamentos-logica-computacional' AND qq.position = 7;

INSERT INTO question_translations (question_id, locale, prompt, concept, options, explanation, image_url, image_alt, code)
SELECT qq.id, 'fr', 'Analysez l’organigramme. Si la variable note reçoit la valeur 6, qu’est-ce qui sera affiché ?', 'Structure conditionnelle', '["Admis", "Rattrapage", "Admis et Rattrapage", "Rien n’est affiché"]', 'La condition 6 >= 7 est fausse, donc le flux suit le chemin NON et affiche Rattrapage. Une seule des branches de la condition est exécutée.', '/img/fr/flowchart-decision.svg', 'Organigramme : début, note reçoit 6, décision note supérieure ou égale à 7 ; si oui écrire Admis, sinon écrire Rattrapage ; fin', NULL
FROM questions qq JOIN quizzes z ON z.id = qq.quiz_id WHERE z.slug = 'fundamentos-logica-computacional' AND qq.position = 8;

INSERT INTO question_translations (question_id, locale, prompt, concept, options, explanation, image_url, image_alt, code)
SELECT qq.id, 'fr', 'Exécutez pas à pas l’algorithme ci-dessous. Quelle valeur sera affichée ?', 'Structure de répétition', '["4", "5", "10", "15"]', 'La boucle s’exécute 4 fois : somme = 0+1 = 1, 1+2 = 3, 3+3 = 6, 6+4 = 10. La valeur affichée est 10.', '/img/fr/flowchart-loop.svg', 'Organigramme de boucle : somme reçoit 0, i de 1 à 4, somme reçoit somme plus i, à la fin écrire somme', 'somme ← 0
pour i de 1 à 4 faire
    somme ← somme + i
fin pour
écrire(somme)'
FROM questions qq JOIN quizzes z ON z.id = qq.quiz_id WHERE z.slug = 'fundamentos-logica-computacional' AND qq.position = 9;

INSERT INTO question_translations (question_id, locale, prompt, concept, options, explanation, image_url, image_alt, code)
SELECT qq.id, 'fr', 'Quelle est la valeur finale de la variable peutEntrer ?', 'Expressions booléennes', '["vrai", "faux", "17", "erreur d’exécution"]', '(17 >= 18) est faux, mais faux OU vrai = vrai. Dans une disjonction, il suffit qu’une des conditions soit vraie.', NULL, NULL, 'age ← 17
aAutorisation ← vrai
peutEntrer ← (age >= 18) OU aAutorisation'
FROM questions qq JOIN quizzes z ON z.id = qq.quiz_id WHERE z.slug = 'fundamentos-logica-computacional' AND qq.position = 10;

INSERT INTO question_translations (question_id, locale, prompt, concept, options, explanation, image_url, image_alt, code)
SELECT qq.id, 'fr', 'Exécutez pas à pas : quelles sont les valeurs finales de a et b ?', 'Algorithmes séquentiels', '["a = 3 et b = 5", "a = 8 et b = 3", "a = 5 et b = 3", "a = 5 et b = 8"]', 'Pas à pas : a = 3+5 = 8 ; b = 8-5 = 3 ; a = 8-3 = 5. L’algorithme échange les valeurs des variables sans utiliser de variable auxiliaire.', NULL, NULL, 'a ← 3
b ← 5
a ← a + b
b ← a - b
a ← a - b'
FROM questions qq JOIN quizzes z ON z.id = qq.quiz_id WHERE z.slug = 'fundamentos-logica-computacional' AND qq.position = 11;

INSERT INTO question_translations (question_id, locale, prompt, concept, options, explanation, image_url, image_alt, code)
SELECT qq.id, 'fr', 'Qu’est-ce qui caractérise correctement un algorithme ?', 'Algorithmes', '["Un programme obligatoirement écrit dans un langage de programmation", "Une suite finie, ordonnée et sans ambiguïté d’étapes pour résoudre un problème", "N’importe quel ensemble d’instructions, même s’il ne se termine jamais", "Un dessin d’organigramme"]', 'Un algorithme est une suite finie et bien définie d’étapes. Il peut être représenté en langage naturel, en pseudocode, par un organigramme ou dans un langage de programmation.', NULL, NULL, NULL
FROM questions qq JOIN quizzes z ON z.id = qq.quiz_id WHERE z.slug = 'fundamentos-logica-computacional' AND qq.position = 12;
