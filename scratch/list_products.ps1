[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$connString = "Server=localhost\SQL2025;Database=mini_ecommerce_product;User Id=sa;Password=123456;TrustServerCertificate=True"
$conn = New-Object System.Data.SqlClient.SqlConnection($connString)
$conn.Open()
$cmd = $conn.CreateCommand()
$cmd.CommandText = "SELECT * FROM products WHERE id = 32"
$reader = $cmd.ExecuteReader()
if ($reader.Read()) {
    for ($i = 0; $i -lt $reader.FieldCount; $i++) {
        Write-Host ($reader.GetName($i) + ": " + $reader.GetValue($i))
    }
}
$conn.Close()
