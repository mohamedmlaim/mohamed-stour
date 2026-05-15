<?php
// api/login.php
require_once __DIR__ . '/db.php';

$data  = getBody();
$email = trim($data['email'] ?? '');
$pass  = $data['password'] ?? '';

// Basic validation
if (!$email || !$pass) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Email and password are required.']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid email format.']);
    exit;
}

// Simple rate limiting via session (basic — upgrade with Redis on paid hosting)
session_start();
$key = 'login_attempts_' . md5($email);
$attempts = $_SESSION[$key] ?? 0;

if ($attempts >= 10) {
    http_response_code(429);
    echo json_encode(['success' => false, 'message' => 'Too many attempts. Please wait a few minutes.']);
    exit;
}

// Lookup user
$pdo  = getDB();
$stmt = $pdo->prepare('SELECT id, first_name, last_name, email, password FROM users WHERE email = ? LIMIT 1');
$stmt->execute([$email]);
$user = $stmt->fetch();

if (!$user || !password_verify($pass, $user['password'])) {
    $_SESSION[$key] = $attempts + 1;
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Invalid email or password.']);
    exit;
}

// Success — reset attempts
$_SESSION[$key] = 0;

echo json_encode([
    'success' => true,
    'user'    => [
        'id'        => $user['id'],
        'firstName' => $user['first_name'],
        'lastName'  => $user['last_name'],
        'email'     => $user['email'],
    ]
]);
