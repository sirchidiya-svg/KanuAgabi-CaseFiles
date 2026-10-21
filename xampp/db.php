<?php
/**
 * Kanu G. Agabi & Associates - Case File Inventory and Tracking System
 * Database Connection Module (XAMPP / MySQL / MariaDB)
 * 
 * Instructions:
 * Place this file in your XAMPP web root folder:
 * C:\xampp\htdocs\LawFirmInventory\db.php
 */

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$host = '127.0.0.1';
$db   = 'LawFirmInventory';
$user = 'root';
$pass = ''; // Default XAMPP MySQL password is blank
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (\PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'connected' => false,
        'message' => 'Database connection failed: ' . $e->getMessage(),
        'instructions' => 'Ensure MySQL service is started in XAMPP Control Panel and database.sql has been imported via phpMyAdmin.'
    ]);
    exit();
}
?>
