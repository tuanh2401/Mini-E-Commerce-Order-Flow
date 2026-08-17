$dbs = @("auth_db", "mini_ecommerce_order", "mini_ecommerce_product", "mini_ecommerce_user", "mini_ecommerce_payment", "mini_ecommerce_cart", "mini_ecommerce_promotion")
$searchTerms = @("%Äi%", "%Ði%", "%thông%", "%chính%")

foreach ($db in $dbs) {
    $query = "SELECT t.name AS TableName, c.name AS ColumnName FROM sys.tables t JOIN sys.columns c ON t.object_id = c.object_id JOIN sys.types y ON c.user_type_id = y.user_type_id WHERE y.name IN ('varchar', 'nvarchar')"
    $output = sqlcmd -S "localhost\SQL2025" -U sa -P "123456" -d $db -Q $query -h -1 -W
    
    foreach ($line in $output) {
        if ($line -match '^(\S+)\s+(\S+)$') {
            $table = $Matches[1]
            $column = $Matches[2]
            
            # Bỏ qua các cột audit
            if ($column -match 'by$|date$|at$|url$|id$|email|phone') { continue }
            
            foreach ($term in $searchTerms) {
                $sql = "SELECT CAST($column AS NVARCHAR(MAX)) FROM $table WHERE $column LIKE N'$term'"
                $res = sqlcmd -S "localhost\SQL2025" -U sa -P "123456" -d $db -Q $sql -h -1 -W
                $cleanRes = $res | Where-Object { $_ -and $_.Trim() -ne "" -and $_ -notmatch 'rows affected' }
                if ($cleanRes) {
                    Write-Host "FOUND in DB: $db -> Table: $table -> Column: $column"
                    Write-Host "Value: $cleanRes"
                    Write-Host "----------------------------------"
                }
            }
        }
    }
}
