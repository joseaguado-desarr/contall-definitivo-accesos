-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 20-08-2026 a las 03:01:51
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `access_control_db`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `access_logs`
--

CREATE TABLE `access_logs` (
  `id` varchar(36) NOT NULL,
  `person_id` varchar(36) DEFAULT NULL,
  `visit_id` varchar(36) DEFAULT NULL,
  `method` enum('facial','qr','manual','card') NOT NULL DEFAULT 'manual',
  `result` enum('authorized','denied','pending') NOT NULL DEFAULT 'authorized',
  `direction` enum('entry','exit') NOT NULL DEFAULT 'entry',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `access_logs`
--

INSERT INTO `access_logs` (`id`, `person_id`, `visit_id`, `method`, `result`, `direction`, `notes`, `created_at`) VALUES
('40144e9f-5eb1-45db-91bb-2b08732fbe11', NULL, NULL, 'manual', 'authorized', 'entry', 'Entrada de visitante: martin', '2026-04-22 03:14:22'),
('499d9342-d9ff-456e-a2b8-b256a11b505f', NULL, NULL, 'manual', 'authorized', 'entry', 'Entrada de visitante: sdfuhnsdf', '2026-04-22 03:16:01'),
('49e8ae6d-16fe-4945-9ae2-ec12d220b25c', NULL, NULL, 'manual', 'denied', 'entry', 'Acceso denegado vía manual', '2026-07-27 04:09:04'),
('938d5a7a-b26f-4c78-bebe-dbf1d391bacd', NULL, NULL, '', 'authorized', 'entry', NULL, '2026-07-09 14:00:50'),
('9a7ed8c0-3e55-40c3-a783-db4017430928', NULL, NULL, 'manual', 'authorized', 'entry', 'Entrada de visitante: nixon', '2026-04-22 03:15:14'),
('d185eb08-f82a-4d74-aa5d-5916980618cd', NULL, NULL, 'facial', 'authorized', 'entry', 'Acceso autorizado vía facial', '2026-04-22 03:05:46'),
('d2d76145-a9a6-4093-bc47-c723619c033d', NULL, NULL, 'manual', 'denied', 'entry', 'Acceso denegado vía manual', '2026-07-27 04:10:22'),
('d3987ca8-8eff-414b-95a3-bb361981d14f', NULL, 'b57e3412-cee5-4768-92c8-ae7f9fa68508', 'manual', 'authorized', 'entry', 'Entrada de visitante: LEONELA', '2026-07-27 03:44:30'),
('de9e5b12-18eb-4b1d-aa57-5f21e0fc0304', NULL, '3aba5fec-3521-429a-8214-a62cfeb89f5a', 'manual', 'authorized', 'entry', 'Entrada de visitante: martin', '2026-07-09 20:04:25'),
('e904ff73-03e9-4876-ba58-a39dfdb0b241', '92397eb7-2033-4c98-8267-b2bd0ed244ae', NULL, 'manual', 'authorized', 'entry', NULL, '2026-07-05 07:52:16'),
('ec74cf07-1c6f-4593-ac93-fb03c2959d6e', NULL, NULL, 'manual', 'authorized', 'entry', NULL, '2026-07-06 02:10:54'),
('fb7ee871-a6ef-4f1f-bc93-f3ada1d684c5', NULL, NULL, 'manual', 'authorized', 'entry', 'Entrada de visitante: eder', '2026-04-22 03:13:57');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `blacklist`
--

CREATE TABLE `blacklist` (
  `id` varchar(36) NOT NULL,
  `document` varchar(50) NOT NULL,
  `name` varchar(255) NOT NULL,
  `reason` text NOT NULL,
  `created_by` varchar(36) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `persons`
--

CREATE TABLE `persons` (
  `id` varchar(36) NOT NULL,
  `first_name` varchar(255) NOT NULL,
  `last_name` varchar(255) NOT NULL,
  `document` varchar(50) NOT NULL,
  `type` enum('resident','employee','contractor') NOT NULL DEFAULT 'resident',
  `photo_url` text DEFAULT NULL,
  `status` enum('active','inactive','suspended') NOT NULL DEFAULT 'active',
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `unit` varchar(50) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `persons`
--

INSERT INTO `persons` (`id`, `first_name`, `last_name`, `document`, `type`, `photo_url`, `status`, `phone`, `email`, `unit`, `notes`, `created_at`, `updated_at`) VALUES
('92397eb7-2033-4c98-8267-b2bd0ed244ae', 'Test', 'User', '123456789484', 'resident', NULL, 'active', '123456789', 'test@example.com', '101', 'Test notes', '2026-04-22 03:28:00', '2026-04-22 03:28:00');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `profiles`
--

CREATE TABLE `profiles` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `avatar_url` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `profiles`
--

INSERT INTO `profiles` (`id`, `user_id`, `full_name`, `email`, `avatar_url`, `created_at`, `updated_at`) VALUES
('266a6177-ab6e-42de-af47-7aa042c51388', '79e1daf3-c52e-4bbf-ab9b-71016896bd00', 'administrador', 'adinistrador@gmail.com', NULL, '2026-08-19 21:40:03', '2026-08-19 21:40:03'),
('9014edb3-0b7a-402a-a4ca-1dddb155b750', '2a7d91ee-def5-4cc6-9b44-7dec31659846', 'Administrador Sistema', 'admin@contaall.com', NULL, '2026-08-19 15:31:13', '2026-08-19 15:31:13'),
('b84d5c36-9090-4793-a32e-ab77798e107b', '48a5845d-2a4e-43fd-9f60-728e4b44ff4d', 'Jose Aguado', 'aguadojose20@gmail.com', NULL, '2026-07-06 14:46:31', '2026-07-06 14:46:31'),
('f947d529-54cd-4393-977f-0cb5c19b7ab7', '08f6f3ff-5f06-436b-b782-227d264a2ba1', 'Usuario Selenium', 'selenium.1787175918844@example.com', NULL, '2026-08-19 21:45:27', '2026-08-19 21:45:27'),
('fc23709d-bee8-408c-9896-47b5ff669815', '408b4fc0-2d69-4558-975a-c708d1579345', 'Usuario Selenium', 'selenium.1787174539945@example.com', NULL, '2026-08-19 21:22:26', '2026-08-19 21:22:26');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `schedules`
--

CREATE TABLE `schedules` (
  `id` varchar(36) NOT NULL,
  `person_id` varchar(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `days` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`days`)),
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `users`
--

CREATE TABLE `users` (
  `id` varchar(36) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `users`
--

INSERT INTO `users` (`id`, `email`, `password_hash`, `created_at`) VALUES
('08f6f3ff-5f06-436b-b782-227d264a2ba1', 'selenium.1787175918844@example.com', '$2b$10$hdynOEHuUt/dd8Tr3YYhIuVBkBkPzKB0snqNyDVe7R95lPFLU.dZq', '2026-08-19 21:45:27'),
('2a7d91ee-def5-4cc6-9b44-7dec31659846', 'admin@contaall.com', '$2b$10$mtn0uCG6RynO.h1ViTJjb.lLLkrDFWRY8yyK8wbUV.qUSDykHQKuW', '2026-08-19 15:31:13'),
('408b4fc0-2d69-4558-975a-c708d1579345', 'selenium.1787174539945@example.com', '$2b$10$MHcCmOzt6bNb9bqgZEIdzu9Xh215UIrNTgIT.4XdXKBR.DcZ0dO/S', '2026-08-19 21:22:26'),
('48a5845d-2a4e-43fd-9f60-728e4b44ff4d', 'aguadojose20@gmail.com', '$2b$10$PXF5l2bQBU51gMy2saX0S.qhJONOjyO35rJn7sTJ/v8oyco1xKfdi', '2026-07-06 14:46:31'),
('79e1daf3-c52e-4bbf-ab9b-71016896bd00', 'adinistrador@gmail.com', '$2b$10$j1hYJEFO4.Fhkzt9Ed0d9OtSbFQpKguxeQqJrrU1XxVzp.qu1mjPK', '2026-08-19 21:40:03');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `user_roles`
--

CREATE TABLE `user_roles` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `role` enum('admin','operator','supervisor') NOT NULL DEFAULT 'operator',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `user_roles`
--

INSERT INTO `user_roles` (`id`, `user_id`, `role`, `created_at`) VALUES
('2ea27173-2804-4919-be87-8b6f975a7abb', '79e1daf3-c52e-4bbf-ab9b-71016896bd00', 'operator', '2026-08-19 21:40:03'),
('799f65af-f0cd-4b8a-b43a-92575460c0b3', '2a7d91ee-def5-4cc6-9b44-7dec31659846', 'admin', '2026-08-19 15:31:13'),
('7df8e5b2-d5b3-4f3d-bbb1-295dde22fce3', '408b4fc0-2d69-4558-975a-c708d1579345', 'operator', '2026-08-19 21:22:26'),
('b126dd58-0da6-491e-80a5-2f4c5eb101a6', '48a5845d-2a4e-43fd-9f60-728e4b44ff4d', 'operator', '2026-07-06 14:46:31'),
('d36be314-09d3-4da3-8a7d-5dc8f2078a05', '08f6f3ff-5f06-436b-b782-227d264a2ba1', 'operator', '2026-08-19 21:45:27');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `visits`
--

CREATE TABLE `visits` (
  `id` varchar(36) NOT NULL,
  `visitor_name` varchar(255) NOT NULL,
  `visitor_document` varchar(50) NOT NULL,
  `visitor_phone` varchar(20) DEFAULT NULL,
  `vehicle_plate` varchar(20) DEFAULT NULL,
  `host_id` varchar(36) DEFAULT NULL,
  `host_name` varchar(255) DEFAULT NULL,
  `reason` text DEFAULT NULL,
  `entry_time` timestamp NOT NULL DEFAULT current_timestamp(),
  `exit_time` timestamp NULL DEFAULT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'inside',
  `created_by` varchar(36) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `visits`
--

INSERT INTO `visits` (`id`, `visitor_name`, `visitor_document`, `visitor_phone`, `vehicle_plate`, `host_id`, `host_name`, `reason`, `entry_time`, `exit_time`, `status`, `created_by`, `created_at`) VALUES
('3aba5fec-3521-429a-8214-a62cfeb89f5a', 'martin', '52695782', '2222222222', 'XXY-653', NULL, 'juan jaraillo', 'EMPLEADA', '2026-07-09 20:04:25', '2026-07-10 01:04:44', 'outside', '48a5845d-2a4e-43fd-9f60-728e4b44ff4d', '2026-07-09 20:04:25'),
('81b12aab-9430-449f-bf9c-f69dd73c1bb0', 'jose', '65289489491', '6519120', 'CBJ-254', NULL, 'Juan Perez', NULL, '2026-07-09 14:07:17', '2026-07-10 00:07:07', 'outside', '48a5845d-2a4e-43fd-9f60-728e4b44ff4d', '2026-07-09 14:07:17'),
('b57e3412-cee5-4768-92c8-ae7f9fa68508', 'LEONELA', '3333333333', '6519120', 'XOO-000', '92397eb7-2033-4c98-8267-b2bd0ed244ae', 'Test User', 'PERSONAL', '2026-07-27 03:44:30', '2026-07-27 08:46:55', 'outside', NULL, '2026-07-27 03:44:30');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `access_logs`
--
ALTER TABLE `access_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `person_id` (`person_id`),
  ADD KEY `visit_id` (`visit_id`);

--
-- Indices de la tabla `blacklist`
--
ALTER TABLE `blacklist`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `document` (`document`),
  ADD KEY `created_by` (`created_by`);

--
-- Indices de la tabla `persons`
--
ALTER TABLE `persons`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `document` (`document`);

--
-- Indices de la tabla `profiles`
--
ALTER TABLE `profiles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`);

--
-- Indices de la tabla `schedules`
--
ALTER TABLE `schedules`
  ADD PRIMARY KEY (`id`),
  ADD KEY `person_id` (`person_id`);

--
-- Indices de la tabla `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indices de la tabla `user_roles`
--
ALTER TABLE `user_roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`,`role`);

--
-- Indices de la tabla `visits`
--
ALTER TABLE `visits`
  ADD PRIMARY KEY (`id`),
  ADD KEY `host_id` (`host_id`),
  ADD KEY `created_by` (`created_by`);

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `access_logs`
--
ALTER TABLE `access_logs`
  ADD CONSTRAINT `access_logs_ibfk_1` FOREIGN KEY (`person_id`) REFERENCES `persons` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `access_logs_ibfk_2` FOREIGN KEY (`visit_id`) REFERENCES `visits` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `blacklist`
--
ALTER TABLE `blacklist`
  ADD CONSTRAINT `blacklist_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `profiles`
--
ALTER TABLE `profiles`
  ADD CONSTRAINT `profiles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `schedules`
--
ALTER TABLE `schedules`
  ADD CONSTRAINT `schedules_ibfk_1` FOREIGN KEY (`person_id`) REFERENCES `persons` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `user_roles`
--
ALTER TABLE `user_roles`
  ADD CONSTRAINT `user_roles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `visits`
--
ALTER TABLE `visits`
  ADD CONSTRAINT `visits_ibfk_1` FOREIGN KEY (`host_id`) REFERENCES `persons` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `visits_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
