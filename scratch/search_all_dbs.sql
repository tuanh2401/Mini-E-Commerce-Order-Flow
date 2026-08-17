DECLARE @Sql NVARCHAR(MAX) = '';

SELECT @Sql = @Sql + '
USE [' + name + '];
DECLARE @DbName NVARCHAR(255) = ''' + name + ''';
DECLARE @TableName NVARCHAR(255), @ColumnName NVARCHAR(255);
DECLARE @InnerSql NVARCHAR(MAX);

DECLARE cur CURSOR FOR 
SELECT t.name, c.name 
FROM sys.tables t 
JOIN sys.columns c ON t.object_id = c.object_id 
JOIN sys.types y ON c.user_type_id = y.user_type_id 
WHERE y.name IN (''varchar'', ''nvarchar'');

OPEN cur;
FETCH NEXT FROM cur INTO @TableName, @ColumnName;
WHILE @@FETCH_STATUS = 0
BEGIN
    SET @InnerSql = N''
    SELECT '''''' + @DbName + '''''', '''''' + @TableName + '''''', '''''' + @ColumnName + '''''', CAST(['' + @ColumnName + ''] AS NVARCHAR(MAX)) 
    FROM ['' + @TableName + ''] 
    WHERE ['' + @ColumnName + ''] LIKE N''''%thông%'''' 
       OR ['' + @ColumnName + ''] LIKE N''''%chính%'''' 
       OR ['' + @ColumnName + ''] LIKE N''''%Ði%'''' 
       OR ['' + @ColumnName + ''] LIKE N''''%Äi%''''
       OR ['' + @ColumnName + ''] LIKE N''''%tho%'''';''
    
    BEGIN TRY
        EXEC sp_executesql @InnerSql;
    END TRY
    BEGIN CATCH
        -- Bỏ qua lỗi cột không tồn tại hoặc sai kiểu
    END CATCH
    
    FETCH NEXT FROM cur INTO @TableName, @ColumnName;
END;
CLOSE cur;
DEALLOCATE cur;
' FROM sys.databases WHERE database_id > 4 AND state = 0 AND name IN ('mini_ecommerce_product', 'mini_ecommerce_user', 'mini_ecommerce_order', 'auth_db', 'mini_ecommerce_cart', 'mini_ecommerce_payment', 'mini_ecommerce_promotion');

EXEC sp_executesql @Sql;
