<?php
/**
 * Kanu G. Agabi & Associates - Case File Inventory and Tracking System
 * Authentication & Session Service
 * 
 * Target Location:
 * C:\xampp\htdocs\LawFirmInventory\auth.php
 */

require_once __DIR__ . '/db.php';

$rawInput = file_get_contents('php://input');
$data = json_decode($rawInput, true);

if (!$data) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Malformed JSON request']);
    exit();
}

$action = $data['action'] ?? 'login';

if ($action === 'login') {
    $role = $data['role'] ?? 'GUEST';

    if ($role === 'GUEST') {
        $guestName = trim($data['guestName'] ?? 'Chamber Intern / Guest');
        $chamberUnit = trim($data['chamberUnit'] ?? 'General Registry');

        echo json_encode([
            'status' => 'success',
            'role' => 'GUEST',
            'userName' => $guestName,
            'chamberUnit' => $chamberUnit,
            'token' => 'guest_session_' . bin2hex(random_bytes(16)),
            'message' => 'Guest read-only access granted'
        ]);
        exit();
    }

    // Admin & Super Admin Authentication
    $username = trim($data['username'] ?? '');
    $password = $data['password'] ?? '';

    if (empty($username) || empty($password)) {
        http_response_code(401);
        echo json_encode(['status' => 'error', 'message' => 'Username and password are required']);
        exit();
    }

    $inputHash = hash('sha256', $password);

    try {
        $stmt = $pdo->prepare('SELECT AdminID, Username, FullName, RoleTitle, PasswordHash FROM AdminUsers WHERE Username = :username LIMIT 1');
        $stmt->execute(['username' => $username]);
        $user = $stmt->fetch();

        if ($user && hash_equals($user['PasswordHash'], $inputHash)) {
            $isSuper = (strtolower($user['Username']) === 'superadmin' || strpos(strtolower($user['RoleTitle']), 'super') !== false);
            
            echo json_encode([
                'status' => 'success',
                'role' => $isSuper ? 'SUPER_ADMIN' : 'ADMIN',
                'userName' => $user['FullName'],
                'chamberUnit' => $user['RoleTitle'],
                'token' => bin2hex(random_bytes(32)),
                'message' => 'Authentication successful'
            ]);
            exit();
        } else {
            http_response_code(401);
            echo json_encode(['status' => 'error', 'message' => 'Invalid username or credentials']);
            exit();
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Authentication query failed: ' . $e->getMessage()]);
        exit();
    }
}

http_response_code(400);
echo json_encode(['status' => 'error', 'message' => 'Unknown action']);
?>
