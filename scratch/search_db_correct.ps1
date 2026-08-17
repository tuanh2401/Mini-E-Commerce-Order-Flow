$connStringTemplate = "Server=localhost\SQL2025;Database={0};User Id=sa;Password=123456;TrustServerCertificate=True"
$dbs = @("auth_db", "mini_ecommerce_order", "mini_ecommerce_product", "mini_ecommerce_user", "mini_ecommerce_payment", "mini_ecommerce_cart", "mini_ecommerce_promotion")

$searchTerms = @("Äi", "Ði", "tho", "thông", "chính")

$outFile = "c:\Users\datdo\Desktop\Mini E-commerce Orders\scratch\db_scan_results.txt"
"DB Scan Results:" | Out-File $outFile -Encoding utf8

foreach ($db in $dbs) {
    try {
        $connStr = $connStringTemplate -f $db
        $conn = New-Object System.Data.SqlClient.SqlConnection($connStr)
        $conn.Open()
        
        $cmd = $conn.CreateCommand()
        $cmd.CommandText = "SELECT t.name AS TableName, c.name AS ColumnName FROM sys.tables t JOIN sys.columns c ON t.object_id = c.object_id JOIN sys.types y ON c.user_type_id = y.user_type_id WHERE y.name IN ('varchar', 'nvarchar')"
        $reader = $cmd.ExecuteReader()
        $columns = @()
        while ($reader.Read()) {
            $columns += [PSCustomObject]@{
                Table = $reader.GetString(0)
                Column = $reader.GetString(1)
            }
        }
        $reader.Close()
        
        foreach ($col in $columns) {
            $table = $col.Table
            $column = $col.Column
            
            if ($column -match "by$|date$|at$|url$|id$|email|phone") { continue }
            
            $checkCmd = $conn.CreateCommand()
            $checkCmd.CommandText = "SELECT $column FROM $table"
            $checkReader = $checkCmd.ExecuteReader()
            while ($checkReader.Read()) {
                if (!$checkReader.IsDBNull(0)) {
                    $val = $checkReader.GetString(0)
                    foreach ($term in $searchTerms) {
                        if ($val.Contains($term)) {
                            $msg = "FOUND: Database=$db, Table=$table, Column=$column, Value=$val"
                            Write-Host $msg
                            $msg | Out-File $outFile -Append -Encoding utf8
                            break
                        }
                    }
                }
            }
            $checkReader.Close()
        }
        
        $conn.Close()
    } catch {
        Write-Host "Error scanning $db: $_"
    }
}
Write-Host "SCAN COMPLETE."
