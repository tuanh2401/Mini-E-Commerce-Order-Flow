[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$jsonPath = Join-Path $PSScriptRoot "products_data.json"
$jsonContent = [System.IO.File]::ReadAllText($jsonPath, [System.Text.Encoding]::UTF8)
$products = ConvertFrom-Json $jsonContent

$connString = "Server=localhost\SQL2025;Database=mini_ecommerce_product;User Id=sa;Password=123456;TrustServerCertificate=True"
$conn = New-Object System.Data.SqlClient.SqlConnection($connString)
$conn.Open()

$successCount = 0

foreach ($prod in $products) {
    # Convert specs to ordered dictionary
    $specsDict = [ordered]@{}
    foreach ($prop in $prod.specs.PSObject.Properties) {
        $specsDict[$prop.Name] = $prop.Value
    }

    $payload = [ordered]@{
        specs = $specsDict
        html_desc = $prod.html_desc
    }

    $jsonString = $payload | ConvertTo-Json -Depth 5 -Compress

    $cmd = $conn.CreateCommand()
    $cmd.CommandText = "UPDATE products SET description = @description WHERE id = @id"
    
    $pDesc = New-Object System.Data.SqlClient.SqlParameter("@description", [System.Data.SqlDbType]::NVarChar, -1)
    $pDesc.Value = $jsonString
    [void]$cmd.Parameters.Add($pDesc)

    $paramId = New-Object System.Data.SqlClient.SqlParameter("@id", [System.Data.SqlDbType]::BigInt)
    $paramId.Value = [long]$prod.id
    [void]$cmd.Parameters.Add($paramId)

    $rowsAffected = $cmd.ExecuteNonQuery()
    if ($rowsAffected -gt 0) {
        Write-Host ("[SUCCESS] ID {0} - {1} updated! (Length: {2})" -f $prod.id, $prod.name, $jsonString.Length)
        $successCount++
    } else {
        Write-Host ("[FAIL] ID {0} - {1} not found!" -f $prod.id, $prod.name)
    }
}

Write-Host "--------------------------------------------------"
Write-Host ("Total products updated successfully: {0} / {1}" -f $successCount, $products.Count)

$conn.Close()
