<?php
/**
 * Direct database test to check product type without loading WordPress
 */

// Database connection
$servername = "127.0.0.1";
$username = "root";
$password = "";
$dbname = "develop"; // adjust if needed

$conn = new mysqli($servername, $username, $password, $dbname, 3307);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$product_id = 14994;
echo "=== Direct Database Check for Product $product_id ===\n\n";

// Check main product post
$sql = "SELECT * FROM wp_posts WHERE ID = $product_id";
$result = $conn->query($sql);

if ($row = $result->fetch_assoc()) {
    echo "Product Post:\n";
    echo "  ID: " . $row['ID'] . "\n";
    echo "  Title: " . $row['post_title'] . "\n";
    echo "  Type: " . $row['post_type'] . "\n";
    echo "  Status: " . $row['post_status'] . "\n\n";
}

// Check for variations
$sql = "SELECT ID, post_title, post_status FROM wp_posts WHERE post_parent = $product_id AND post_type = 'product_variation'";
$result = $conn->query($sql);

echo "Variations:\n";
$count = 0;
while ($row = $result->fetch_assoc()) {
    $count++;
    echo "  Variation $count: ID=" . $row['ID'] . ", Title=" . $row['post_title'] . ", Status=" . $row['post_status'] . "\n";
}
echo "Total Variations: $count\n\n";

// Check product type taxonomy
$sql = "SELECT t.name, t.slug FROM wp_term_relationships tr 
        JOIN wp_term_taxonomy tt ON tr.term_taxonomy_id = tt.term_taxonomy_id 
        JOIN wp_terms t ON tt.term_id = t.term_id 
        WHERE tr.object_id = $product_id AND tt.taxonomy = 'product_type'";

$result = $conn->query($sql);
echo "Product Type Terms:\n";
while ($row = $result->fetch_assoc()) {
    echo "  Term: " . $row['name'] . " (slug: " . $row['slug'] . ")\n";
}

$conn->close();