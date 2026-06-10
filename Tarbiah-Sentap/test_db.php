<?php
$host = 'db.iuyqnqwvpsrzsrdcccoh.supabase.co';
$port = 5432;
$dbname = 'postgres';
$user = 'postgres';
$password = '040316namI@'; // trying without brackets first

try {
    $dsn = "pgsql:host=$host;port=$port;dbname=$dbname";
    $pdo = new PDO($dsn, $user, $password, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
    echo "SUCCESS\n";
} catch (PDOException $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    // try with brackets
    try {
        $password = '[040316namI@]';
        $pdo = new PDO($dsn, $user, $password, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
        echo "SUCCESS WITH BRACKETS\n";
    } catch (PDOException $e2) {
        echo "ERROR WITH BRACKETS: " . $e2->getMessage() . "\n";
    }
}
