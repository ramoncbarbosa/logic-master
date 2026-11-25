ALTER TABLE quizzes ADD COLUMN authors TEXT NOT NULL DEFAULT '[]';
ALTER TABLE quizzes ADD COLUMN attribution TEXT NOT NULL DEFAULT '[]';
ALTER TABLE quizzes ADD COLUMN changes TEXT NOT NULL DEFAULT '';

UPDATE quizzes SET authors = CASE
  WHEN slug IN ('fundamentos-logica-computacional', 'tabelas-verdade-conectivos', 'estruturas-condicionais', 'estruturas-de-repeticao')
    THEN '["Ramon Castro Barbosa","Maíra Bastos David de Assis"]'
  WHEN owner_id IS NOT NULL THEN json_array((SELECT name FROM owners WHERE id = quizzes.owner_id))
  ELSE '[]'
END;
