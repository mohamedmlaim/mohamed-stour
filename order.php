<?php
// api/order.php — handles both logged-in and guest orders
require_once __DIR__ . '/db.php';

$data = getBody();

$productName = trim($data['productName'] ?? '');
$productId   = trim($data['productId']   ?? '');
$quantity    = max(1, intval($data['quantity'] ?? 1));
$fullName    = trim($data['fullName']    ?? '');
$phone       = trim($data['phone']       ?? '');
$address     = trim($data['address']     ?? '');
$wilaya      = trim($data['wilaya']      ?? '');
$note        = trim($data['note']        ?? '');
$userId      = intval($data['userId']    ?? 0); // 0 = guest

// Validation
$errors = [];
if (!$productName) $errors[] = 'Product name missing.';
if (!$fullName)    $errors[] = 'Full name is required.';
if (!preg_match('/^(05|06|07)[0-9]{8}$/', $phone)) $errors[] = 'Invalid phone number.';
if (!$address)     $errors[] = 'Address is required.';
if (!$wilaya)      $errors[] = 'Please select a province.';
if ($quantity < 1 || $quantity > 99) $errors[] = 'Invalid quantity.';

if ($errors) {
    http_response_code(422);
    echo json_encode(['success' => false, 'message' => implode(' ', $errors)]);
    exit;
}

$pdo = getDB();

if ($userId > 0) {
    // Verify user exists
    $u = $pdo->prepare('SELECT id FROM users WHERE id = ? LIMIT 1');
    $u->execute([$userId]);
    if (!$u->fetch()) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'User not found. Please log in again.']);
        exit;
    }

    $ins = $pdo->prepare(
        'INSERT INTO orders (user_id, product_name, product_id, quantity, full_name, phone, address, wilaya, note)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    );
    $ins->execute([$userId, $productName, $productId, $quantity, $fullName, $phone, $address, $wilaya, $note]);
} else {
    // Guest order
    $ins = $pdo->prepare(
        'INSERT INTO guest_orders (product_name, product_id, quantity, full_name, phone, address, wilaya, note)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    );
    $ins->execute([$productName, $productId, $quantity, $fullName, $phone, $address, $wilaya, $note]);
}

$orderId = $pdo->lastInsertId();

echo json_encode([
    'success'  => true,
    'orderId'  => $orderId,
    'message'  => 'Order placed successfully! We will contact you soon.'
]);
