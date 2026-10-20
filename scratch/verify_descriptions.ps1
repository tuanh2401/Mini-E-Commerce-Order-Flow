[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$connString = "Server=localhost\SQL2025;Database=mini_ecommerce_product;User Id=sa;Password=123456;TrustServerCertificate=True"
$conn = New-Object System.Data.SqlClient.SqlConnection($connString)
$conn.Open()

$cmd = $conn.CreateCommand()
$cmd.CommandText = "SELECT id, name, description FROM products ORDER BY id"
$reader = $cmd.ExecuteReader()

$verified = 0
$total = 0

while ($reader.Read()) {
    $total++
    $id = $reader["id"]
    $name = $reader["name"]
    $desc = $reader["description"]

    if ([string]::IsNullOrWhiteSpace($desc)) {
        Write-Host ("[FAIL] ID {0} - {1}: Description is empty!" -f $id, $name) -ForegroundColor Red
        continue
    }

    try {
        $json = ConvertFrom-Json $desc
        $specCount = ($json.specs.PSObject.Properties | Measure-Object).Count
        $htmlDescLen = $json.html_desc.Length

        # Lay 3 thong so dau tien xem nhu frontend page.js se lay
        $top3 = ($json.specs.PSObject.Properties | Select-Object -First 3 | ForEach-Object { "$($_.Name): $($_.Value)" }) -join " | "

        Write-Host ("[OK] ID {0} - {1}" -f $id, $name) -ForegroundColor Green
        Write-Host ("     Specs ({0}): {1}" -f $specCount, $top3)
        Write-Host ("     HTML Desc: {0} chars" -f $htmlDescLen)

        $verified++
    } catch {
        Write-Host ("[FAIL] ID {0} - {1}: Invalid JSON! Error: {2}" -f $id, $name, $_.Exception.Message) -ForegroundColor Red
    }
}

$conn.Close()

Write-Host "--------------------------------------------------"
Write-Host ("Verified: {0} / {1} products" -f $verified, $total)
