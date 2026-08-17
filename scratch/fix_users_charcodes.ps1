$connString = "Server=localhost\SQL2025;Database=mini_ecommerce_user;User Id=sa;Password=123456;TrustServerCertificate=True"
$conn = New-Object System.Data.SqlClient.SqlConnection($connString)
$conn.Open()

$tuan_anh_nguyen = "Tu" + [char]7845 + "n Anh Nguy" + [char]7877 + "n"
$nguyen_tuan_anh = "Nguy" + [char]7877 + "n Tu" + [char]7845 + "n Anh"
$tuan_anh = "Tu" + [char]7845 + "n Anh"
$ha_nam = "H" + [char]224 + " Nam"
$quang_ninh = "Qu" + [char]7843 + "ng Ninh - Vi" + [char]7879 + "t Nam"
$ha_nam_viet_nam = "H" + [char]224 + " Nam - Vi" + [char]7879 + "t Nam"

$queries = @(
    "UPDATE users SET fullname = N'$tuan_anh_nguyen' WHERE id = 8",
    "UPDATE users SET fullname = N'$nguyen_tuan_anh' WHERE id = 12",
    "UPDATE users SET fullname = N'$nguyen_tuan_anh' WHERE id = 14",
    "UPDATE users SET fullname = N'$tuan_anh' WHERE id = 16",
    "UPDATE users SET fullname = N'$tuan_anh', address = N'$ha_nam' WHERE id = 23",
    "UPDATE users SET address = N'$quang_ninh' WHERE id = 11",
    "UPDATE users SET address = N'$ha_nam_viet_nam' WHERE id = 24"
)

foreach ($q in $queries) {
    $cmd = $conn.CreateCommand()
    $cmd.CommandText = $q
    $cmd.ExecuteNonQuery() | Out-Null
}

$conn.Close()
Write-Host "CHARCODE UPDATE COMPLETE."
