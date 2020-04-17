-- phpMyAdmin SQL Dump
-- version 4.7.4
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 25-02-2018 a las 21:18:56
-- Versión del servidor: 10.1.26-MariaDB
-- Versión de PHP: 7.1.9

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `facebluff`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `answers`
--

CREATE TABLE `answers` (
  `email_usuario` varchar(100) NOT NULL,
  `id_question` int(11) NOT NULL,
  `id_answer` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Volcado de datos para la tabla `answers`
--

INSERT INTO `answers` (`email_usuario`, `id_question`, `id_answer`) VALUES
('carlos@gmail.com', 26, 80),
('josue@gmail.com', 26, 81),
('juan@gmail.com', 26, 82),
('charly@gmail.com', 26, 84);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `answer_options`
--

CREATE TABLE `answer_options` (
  `id_answer` int(11) NOT NULL,
  `id_question` int(11) NOT NULL,
  `texto_respuesta` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Volcado de datos para la tabla `answer_options`
--

INSERT INTO `answer_options` (`id_answer`, `id_question`, `texto_respuesta`) VALUES
(80, 26, 'Star Wars\r\n'),
(81, 26, 'El Señor de los anillos\r\n'),
(82, 26, 'Full Monty\r\n'),
(83, 26, 'Star Trek'),
(84, 26, 'Blancanieves');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `answer_other`
--

CREATE TABLE `answer_other` (
  `logged_user` varchar(100) NOT NULL,
  `friend` varchar(100) NOT NULL,
  `id_question` int(11) NOT NULL,
  `adivinado` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Volcado de datos para la tabla `answer_other`
--

INSERT INTO `answer_other` (`logged_user`, `friend`, `id_question`, `adivinado`) VALUES
('carlos@gmail.com', 'charly@gmail.com', 26, 1),
('carlos@gmail.com', 'josue@gmail.com', 26, 0),
('carlos@gmail.com', 'juan@gmail.com', 26, 1),
('charly@gmail.com', 'carlos@gmail.com', 26, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `friends`
--

CREATE TABLE `friends` (
  `email1` varchar(100) DEFAULT NULL,
  `email2` varchar(100) DEFAULT NULL,
  `confirmado` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Volcado de datos para la tabla `friends`
--

INSERT INTO `friends` (`email1`, `email2`, `confirmado`) VALUES
('charly@gmail.com', 'carlos@gmail.com', 1),
('josue@gmail.com', 'carlos@gmail.com', 1),
('josue@gmail.com', 'charly@gmail.com', 0),
('juan@gmail.com', 'carlos@gmail.com', 1),
('juan@gmail.com', 'charly@gmail.com', 0),
('juan@gmail.com', 'josue@gmail.com', 0);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `gallery`
--

CREATE TABLE `gallery` (
  `email_usuario` varchar(100) NOT NULL,
  `img` varchar(100) NOT NULL,
  `description` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Volcado de datos para la tabla `gallery`
--

INSERT INTO `gallery` (`email_usuario`, `img`, `description`) VALUES
('carlos@gmail.com', '2c69c863909e368f13bd6472eb368247', 'Yo soy hacker');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `questions`
--

CREATE TABLE `questions` (
  `id` int(11) NOT NULL,
  `texto_pregunta` varchar(100) NOT NULL,
  `num_options` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Volcado de datos para la tabla `questions`
--

INSERT INTO `questions` (`id`, `texto_pregunta`, `num_options`) VALUES
(26, '¿Cuál es tu película favorita?', 4);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `sessions`
--

CREATE TABLE `sessions` (
  `session_id` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `expires` int(11) UNSIGNED NOT NULL,
  `data` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Volcado de datos para la tabla `sessions`
--

INSERT INTO `sessions` (`session_id`, `expires`, `data`) VALUES
('11malIpFUm7KTB0-EdFKQubDnK71e2US', 1513789682, '{\"cookie\":{\"originalMaxAge\":null,\"expires\":null,\"httpOnly\":true,\"path\":\"/\"},\"currentUser\":\"carlos@gmail.com\"}');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `users`
--

CREATE TABLE `users` (
  `email` varchar(100) NOT NULL,
  `password` varchar(100) NOT NULL,
  `img` varchar(100) DEFAULT NULL,
  `nombre_completo` varchar(100) DEFAULT NULL,
  `genero` int(11) DEFAULT NULL,
  `fecha_nacimiento` date DEFAULT NULL,
  `puntuacion` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Volcado de datos para la tabla `users`
--

INSERT INTO `users` (`email`, `password`, `img`, `nombre_completo`, `genero`, `fecha_nacimiento`, `puntuacion`) VALUES
('carlos@gmail.com', '123123', '1a2acbaaf7c2d56eb391d98d1387eef9', 'Carlos Arroyo Aguilera', 0, '1994-08-26', 0),
('charly@gmail.com', '123123', 'bd05c4db0db753fdd45154ebf88e0457', 'Carlos Fernández', 0, '1985-05-28', 50),
('josue@gmail.com', '123123', 'NoProfile', 'Josué Pradas', 1, '1990-09-12', 0),
('juan@gmail.com', '123123', '9ed6ecf5c2d4f0c9216dbeaa33a273ba', 'Juan Martínez', 2, '1992-09-24', 0);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `answers`
--
ALTER TABLE `answers`
  ADD PRIMARY KEY (`email_usuario`,`id_question`),
  ADD KEY `email_usuario` (`email_usuario`),
  ADD KEY `id_question` (`id_question`),
  ADD KEY `id_answer` (`id_answer`);

--
-- Indices de la tabla `answer_options`
--
ALTER TABLE `answer_options`
  ADD PRIMARY KEY (`id_answer`),
  ADD KEY `id_question` (`id_question`);

--
-- Indices de la tabla `answer_other`
--
ALTER TABLE `answer_other`
  ADD KEY `logged_user` (`logged_user`,`friend`,`id_question`),
  ADD KEY `friend` (`friend`),
  ADD KEY `id_question` (`id_question`);

--
-- Indices de la tabla `friends`
--
ALTER TABLE `friends`
  ADD UNIQUE KEY `email1_2` (`email1`,`email2`),
  ADD KEY `email1` (`email1`),
  ADD KEY `email2` (`email2`);

--
-- Indices de la tabla `gallery`
--
ALTER TABLE `gallery`
  ADD KEY `email_usuario` (`email_usuario`);

--
-- Indices de la tabla `questions`
--
ALTER TABLE `questions`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`session_id`);

--
-- Indices de la tabla `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`email`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `answer_options`
--
ALTER TABLE `answer_options`
  MODIFY `id_answer` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=85;

--
-- AUTO_INCREMENT de la tabla `questions`
--
ALTER TABLE `questions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `answers`
--
ALTER TABLE `answers`
  ADD CONSTRAINT `answers_ibfk_2` FOREIGN KEY (`email_usuario`) REFERENCES `users` (`email`) ON DELETE CASCADE,
  ADD CONSTRAINT `answers_ibfk_3` FOREIGN KEY (`id_answer`) REFERENCES `answer_options` (`id_answer`) ON DELETE CASCADE,
  ADD CONSTRAINT `answers_ibfk_4` FOREIGN KEY (`id_question`) REFERENCES `questions` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `answer_options`
--
ALTER TABLE `answer_options`
  ADD CONSTRAINT `answer_options_ibfk_1` FOREIGN KEY (`id_question`) REFERENCES `questions` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `answer_other`
--
ALTER TABLE `answer_other`
  ADD CONSTRAINT `answer_other_ibfk_1` FOREIGN KEY (`logged_user`) REFERENCES `users` (`email`) ON DELETE CASCADE,
  ADD CONSTRAINT `answer_other_ibfk_2` FOREIGN KEY (`friend`) REFERENCES `users` (`email`) ON DELETE CASCADE,
  ADD CONSTRAINT `answer_other_ibfk_3` FOREIGN KEY (`id_question`) REFERENCES `questions` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `friends`
--
ALTER TABLE `friends`
  ADD CONSTRAINT `friends_ibfk_1` FOREIGN KEY (`email1`) REFERENCES `users` (`email`),
  ADD CONSTRAINT `friends_ibfk_2` FOREIGN KEY (`email2`) REFERENCES `users` (`email`);

--
-- Filtros para la tabla `gallery`
--
ALTER TABLE `gallery`
  ADD CONSTRAINT `gallery_ibfk_1` FOREIGN KEY (`email_usuario`) REFERENCES `users` (`email`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
