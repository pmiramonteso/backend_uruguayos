-- Limpieza de la base de datos tras quitar sequelize.sync({ alter: true }).
--
-- Borra los índices únicos duplicados que creaba sequelize.sync({ alter: true }) en cada arranque
-- del backend: email_2 ... email_63 en users y token_2 ... en recoverytokens.
-- Deja el índice original (email, token), así que el email sigue siendo único.
-- Solo actúa si el original existe, y se puede ejecutar más de una vez sin problema.
-- Uso: phpMyAdmin > base de datos > pestaña SQL > pegar todo > Continuar. Haz antes una copia (Exportar).

SET SESSION group_concat_max_len = 100000;

-- users.email
SET @sql = (
  SELECT CONCAT('ALTER TABLE `users` ', GROUP_CONCAT(CONCAT('DROP INDEX `', index_name, '`') SEPARATOR ', '))
  FROM (SELECT DISTINCT index_name FROM information_schema.statistics
        WHERE table_schema = DATABASE() AND table_name = 'users' AND index_name REGEXP '^email_[0-9]+$') AS duplicados
  WHERE EXISTS (SELECT 1 FROM information_schema.statistics
                WHERE table_schema = DATABASE() AND table_name = 'users' AND index_name = 'email' AND non_unique = 0)
);
SET @sql = IFNULL(@sql, 'SELECT ''users: no hay índices duplicados'' AS resultado');
PREPARE consulta FROM @sql; EXECUTE consulta; DEALLOCATE PREPARE consulta;

-- recoverytokens.token
SET @sql = (
  SELECT CONCAT('ALTER TABLE `recoverytokens` ', GROUP_CONCAT(CONCAT('DROP INDEX `', index_name, '`') SEPARATOR ', '))
  FROM (SELECT DISTINCT index_name FROM information_schema.statistics
        WHERE table_schema = DATABASE() AND table_name = 'recoverytokens' AND index_name REGEXP '^token_[0-9]+$') AS duplicados
  WHERE EXISTS (SELECT 1 FROM information_schema.statistics
                WHERE table_schema = DATABASE() AND table_name = 'recoverytokens' AND index_name = 'token' AND non_unique = 0)
);
SET @sql = IFNULL(@sql, 'SELECT ''recoverytokens: no hay índices duplicados'' AS resultado');
PREPARE consulta FROM @sql; EXECUTE consulta; DEALLOCATE PREPARE consulta;

-- Comprobación: debería salir 1 índice de email en users (más PRIMARY y, si lo hay, users_email)
SELECT table_name AS tabla, COUNT(DISTINCT index_name) AS indices
FROM information_schema.statistics
WHERE table_schema = DATABASE() AND table_name IN ('users', 'recoverytokens')
GROUP BY table_name;

-- Tabla books: restos del proyecto de ejemplo (dos libros de prueba). Ningún código ni tabla la usa.
DROP TABLE IF EXISTS `books`;
