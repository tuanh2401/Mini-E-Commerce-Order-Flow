$connString = "Server=localhost\SQL2025;Database=mini_ecommerce_user;User Id=sa;Password=123456;TrustServerCertificate=True"
$conn = New-Object System.Data.SqlClient.SqlConnection($connString)
$conn.Open()

$queries = @(
    "UPDATE users SET fullname = N'Tuấn Anh Nguyễn' WHERE id = 8",
    "UPDATE users SET fullname = N'Nguyễn Tuấn Anh' WHERE id = 12",
    "UPDATE users SET fullname = N'Nguyễn Tuấn Anh' WHERE id = 14",
    "UPDATE users SET fullname = N'Tuấn Anh' WHERE id = 16",
    "UPDATE users SET fullname = N'Tuấn Anh', address = N'Hà Nam' WHERE id = 23",
    "UPDATE users SET address = N'Quảng Ninh - Việt Nam' WHERE id = 11",
    "UPDATE users SET address = N'Hà Nam - Việt Nam' WHERE id = 24"
)

foreach ($q in $queries) {
    $cmd = $conn.CreateCommand()
    $cmd.CommandText = $q
    $cmd.ExecuteNonQuery() | Out-Null
}

$conn.Close()
Write-Host "DIRECT UPDATE COMPLETE."
