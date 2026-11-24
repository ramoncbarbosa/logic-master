ALTER TABLE quiz_translations ADD COLUMN video_url TEXT;

UPDATE quiz_translations SET video_url = 'https://www.youtube.com/watch?v=Ass7qLDCbiE'
WHERE locale = 'en' AND quiz_id = (SELECT id FROM quizzes WHERE slug = 'tabelas-verdade-conectivos');

UPDATE quiz_translations SET video_url = 'https://www.youtube.com/watch?v=t_D-7j1Sbk8'
WHERE locale = 'es' AND quiz_id = (SELECT id FROM quizzes WHERE slug = 'tabelas-verdade-conectivos');

UPDATE quiz_translations SET video_url = 'https://www.youtube.com/watch?v=_LWu8YkhMtA'
WHERE locale = 'fr' AND quiz_id = (SELECT id FROM quizzes WHERE slug = 'tabelas-verdade-conectivos');

UPDATE quiz_translations SET video_url = 'https://www.youtube.com/watch?v=laHMFcSQf8Q'
WHERE locale = 'en' AND quiz_id = (SELECT id FROM quizzes WHERE slug = 'estruturas-condicionais');

UPDATE quiz_translations SET video_url = 'https://www.youtube.com/watch?v=x7xs4cMfIDc'
WHERE locale = 'es' AND quiz_id = (SELECT id FROM quizzes WHERE slug = 'estruturas-condicionais');

UPDATE quiz_translations SET video_url = 'https://www.youtube.com/watch?v=n5eN0YzJhrk'
WHERE locale = 'fr' AND quiz_id = (SELECT id FROM quizzes WHERE slug = 'estruturas-condicionais');

UPDATE quiz_translations SET video_url = 'https://www.youtube.com/watch?v=HUmHi7_A_8M'
WHERE locale = 'en' AND quiz_id = (SELECT id FROM quizzes WHERE slug = 'estruturas-de-repeticao');

UPDATE quiz_translations SET video_url = 'https://www.youtube.com/watch?v=pu_3EX-PcVc'
WHERE locale = 'es' AND quiz_id = (SELECT id FROM quizzes WHERE slug = 'estruturas-de-repeticao');

UPDATE quiz_translations SET video_url = 'https://www.youtube.com/watch?v=943sRoeloXs'
WHERE locale = 'fr' AND quiz_id = (SELECT id FROM quizzes WHERE slug = 'estruturas-de-repeticao');
