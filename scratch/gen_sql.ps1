[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$jsonPath = Join-Path $PSScriptRoot "products_data.json"
$jsonContent = [System.IO.File]::ReadAllText($jsonPath, [System.Text.Encoding]::UTF8)
$products = ConvertFrom-Json $jsonContent

$sqlLines = @(
    "-- Script cap nhat toan bo mo ta va thong so ky thuat cho 24 san pham",
    "-- Su dung dinh dang JSON gom 'specs' va 'html_desc' tuong thich hoan hao voi Frontend",
    "USE mini_ecommerce_product;",
    "GO",
    ""
)

foreach ($prod in $products) {
    $specsDict = [ordered]@{}
    foreach ($prop in $prod.specs.PSObject.Properties) {
        $specsDict[$prop.Name] = $prop.Value
    }

    $payload = [ordered]@{
        specs = $specsDict
        html_desc = $prod.html_desc
    }

    $jsonString = $payload | ConvertTo-Json -Depth 5 -Compress
    # Escape single quotes for SQL Server
    $escapedJson = $jsonString.Replace("'", "''")

    $sqlLines += ("-- [{0}] {1}" -f $prod.id, $prod.name)
    $sqlLines += ("UPDATE products SET description = N'{0}' WHERE id = {1};" -f $escapedJson, $prod.id)
    $sqlLines += ""
}

$sqlLines += "GO"
$sqlPath = Join-Path $PSScriptRoot "update_all_product_descriptions.sql"
[System.IO.File]::WriteAllLines($sqlPath, $sqlLines, [System.Text.Encoding]::UTF8)

Write-Host "Generated update_all_product_descriptions.sql successfully!"
