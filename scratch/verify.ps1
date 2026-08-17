$connString = "Server=localhost\SQL2025;Database=mini_ecommerce_product;User Id=sa;Password=123456;TrustServerCertificate=True"
$conn = New-Object System.Data.SqlClient.SqlConnection($connString)
$conn.Open()
$cmd = $conn.CreateCommand()
$cmd.CommandText = "SELECT description FROM categories WHERE id = 1"
$desc = $cmd.ExecuteScalar()
$conn.Close()

Write-Host "Category 1 Description: $desc"
$desc.ToCharArray() | ForEach-Object {
    Write-Host ("'{0}' -> Unicode: {1}" -f $_, [int]$_)
}
