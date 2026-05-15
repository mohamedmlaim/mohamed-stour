<?php
// api/register.php
require_once __DIR__ . '/db.php';

$data = getBody();

// Pull & sanitize fields
$firstName = trim($data['firstName'] ?? '');
$lastName  = trim($data['lastName']  ?? '');
$email     = trim($data['email']     ?? '');
$age       = intval($data['age']     ?? 0);
$phone     = trim($data['phone']     ?? '');
$address   = trim($data['address']   ?? '');
$wilaya    = trim($data['wilaya']    ?? '');
$password  = $data['password']       ?? '';
$gender    = $data['gender']         ?? '';

// Server-side validation (mirrors JS — never trust only the client)
$errors = [];

if (!$firstName) $errors[] = 'First name is required.';
if (!$lastName)  $errors[] = 'Last name is required.';

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'Invalid email address.';
}

if ($age < 18) {
    $errors[] = 'You must be at least 18 years old.';
}

if (!preg_match('/^(05|06|07)[0-9]{8}$/', $phone)) {
    $errors[] = 'Invalid Algerian phone number.';
}

if (!$address) $errors[] = 'Address is required.';
if (!$wilaya)  $errors[] = 'Please select a province.';

if (strlen($password) < 6) {
    $errors[] = 'Password must be at least 6 characters.';
}

if (!in_array($gender, ['Male', 'Female'], true)) {
    $errors[] = 'Please select a valid gender.';
}

if ($errors) {
    http_response_code(422);
    echo json_encode(['success' => false, 'message' => implode(' ', $errors)]);
    exit;
}

$pdo = getDB();

// Check if email already taken
$chk = $pdo->prepare('SELECT id FROM users WHERE email = ? LIMIT 1');
$chk->execute([$email]);
if ($chk->fetch()) {
    http_response_code(409);
    echo json_encode(['success' => false, 'message' => 'This email is already registered.']);
    exit;
}

// Hash password (bcrypt, cost 12)
$hash = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);

// Insert user
$ins = $pdo->prepare(
    'INSERT INTO users (first_name, last_name, email, password, age, phone, address, wilaya, gender)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
);
$ins->execute([$firstName, $lastName, $email, $hash, $age, $phone, $address, $wilaya, $gender]);

echo json_encode([
    'success' => true,
    'message' => 'Account created successfully.'
]);
