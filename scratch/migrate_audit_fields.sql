SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO

-- 1. auth_db
USE auth_db;
GO
SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('dbo.users') AND name = 'created_at')
BEGIN
    EXEC sp_executesql N'UPDATE dbo.users SET created_date = created_at WHERE created_date IS NULL AND created_at IS NOT NULL;';
    EXEC sp_executesql N'ALTER TABLE dbo.users DROP COLUMN created_at;';
END
GO
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('dbo.users') AND name = 'updated_at')
BEGIN
    EXEC sp_executesql N'UPDATE dbo.users SET last_modified_date = updated_at WHERE last_modified_date IS NULL AND updated_at IS NOT NULL;';
    EXEC sp_executesql N'ALTER TABLE dbo.users DROP COLUMN updated_at;';
END
GO

-- 2. mini_ecommerce_user
USE mini_ecommerce_user;
GO
SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('dbo.users') AND name = 'created_at')
BEGIN
    EXEC sp_executesql N'UPDATE dbo.users SET created_date = created_at WHERE created_date IS NULL AND created_at IS NOT NULL;';
    EXEC sp_executesql N'ALTER TABLE dbo.users DROP COLUMN created_at;';
END
GO
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('dbo.users') AND name = 'updated_at')
BEGIN
    EXEC sp_executesql N'UPDATE dbo.users SET last_modified_date = updated_at WHERE last_modified_date IS NULL AND updated_at IS NOT NULL;';
    EXEC sp_executesql N'ALTER TABLE dbo.users DROP COLUMN updated_at;';
END
GO

-- 3. mini_ecommerce_product
USE mini_ecommerce_product;
GO
SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO
-- For categories
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('dbo.categories') AND name = 'created_at')
BEGIN
    EXEC sp_executesql N'UPDATE dbo.categories SET created_date = created_at WHERE created_date IS NULL AND created_at IS NOT NULL;';
    EXEC sp_executesql N'ALTER TABLE dbo.categories DROP COLUMN created_at;';
END
GO
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('dbo.categories') AND name = 'updated_at')
BEGIN
    EXEC sp_executesql N'UPDATE dbo.categories SET last_modified_date = updated_at WHERE last_modified_date IS NULL AND updated_at IS NOT NULL;';
    EXEC sp_executesql N'ALTER TABLE dbo.categories DROP COLUMN updated_at;';
END
GO
-- For products
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('dbo.products') AND name = 'created_at')
BEGIN
    EXEC sp_executesql N'UPDATE dbo.products SET created_date = created_at WHERE created_date IS NULL AND created_at IS NOT NULL;';
    EXEC sp_executesql N'ALTER TABLE dbo.products DROP COLUMN created_at;';
END
GO
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('dbo.products') AND name = 'updated_at')
BEGIN
    EXEC sp_executesql N'UPDATE dbo.products SET last_modified_date = updated_at WHERE last_modified_date IS NULL AND updated_at IS NOT NULL;';
    EXEC sp_executesql N'ALTER TABLE dbo.products DROP COLUMN updated_at;';
END
GO
-- For favorite_products
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('dbo.favorite_products') AND name = 'created_at')
BEGIN
    EXEC sp_executesql N'UPDATE dbo.favorite_products SET created_date = created_at WHERE created_date IS NULL AND created_at IS NOT NULL;';
    EXEC sp_executesql N'ALTER TABLE dbo.favorite_products DROP COLUMN created_at;';
END
GO
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('dbo.favorite_products') AND name = 'updated_at')
BEGIN
    EXEC sp_executesql N'UPDATE dbo.favorite_products SET last_modified_date = updated_at WHERE last_modified_date IS NULL AND updated_at IS NOT NULL;';
    EXEC sp_executesql N'ALTER TABLE dbo.favorite_products DROP COLUMN updated_at;';
END
GO
-- For product_reviews
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('dbo.product_reviews') AND name = 'created_at')
BEGIN
    EXEC sp_executesql N'UPDATE dbo.product_reviews SET created_date = created_at WHERE created_date IS NULL AND created_at IS NOT NULL;';
    EXEC sp_executesql N'ALTER TABLE dbo.product_reviews DROP COLUMN created_at;';
END
GO
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('dbo.product_reviews') AND name = 'updated_at')
BEGIN
    EXEC sp_executesql N'UPDATE dbo.product_reviews SET last_modified_date = updated_at WHERE last_modified_date IS NULL AND updated_at IS NOT NULL;';
    EXEC sp_executesql N'ALTER TABLE dbo.product_reviews DROP COLUMN updated_at;';
END
GO

-- 4. mini_ecommerce_order
USE mini_ecommerce_order;
GO
SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO
-- For orders
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('dbo.orders') AND name = 'created_at')
BEGIN
    EXEC sp_executesql N'UPDATE dbo.orders SET created_date = created_at WHERE created_date IS NULL AND created_at IS NOT NULL;';
    EXEC sp_executesql N'ALTER TABLE dbo.orders DROP COLUMN created_at;';
END
GO
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('dbo.orders') AND name = 'updated_at')
BEGIN
    EXEC sp_executesql N'UPDATE dbo.orders SET last_modified_date = updated_at WHERE last_modified_date IS NULL AND updated_at IS NOT NULL;';
    EXEC sp_executesql N'ALTER TABLE dbo.orders DROP COLUMN updated_at;';
END
GO
-- For order_items
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('dbo.order_items') AND name = 'created_at')
BEGIN
    EXEC sp_executesql N'UPDATE dbo.order_items SET created_date = created_at WHERE created_date IS NULL AND created_at IS NOT NULL;';
    EXEC sp_executesql N'ALTER TABLE dbo.order_items DROP COLUMN created_at;';
END
GO
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('dbo.order_items') AND name = 'updated_at')
BEGIN
    EXEC sp_executesql N'UPDATE dbo.order_items SET last_modified_date = updated_at WHERE last_modified_date IS NULL AND updated_at IS NOT NULL;';
    EXEC sp_executesql N'ALTER TABLE dbo.order_items DROP COLUMN updated_at;';
END
GO

-- 5. mini_ecommerce_payment
USE mini_ecommerce_payment;
GO
SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('dbo.payments') AND name = 'created_at')
BEGIN
    EXEC sp_executesql N'UPDATE dbo.payments SET created_date = created_at WHERE created_date IS NULL AND created_at IS NOT NULL;';
    EXEC sp_executesql N'ALTER TABLE dbo.payments DROP COLUMN created_at;';
END
GO
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('dbo.payments') AND name = 'updated_at')
BEGIN
    EXEC sp_executesql N'UPDATE dbo.payments SET last_modified_date = updated_at WHERE last_modified_date IS NULL AND updated_at IS NOT NULL;';
    EXEC sp_executesql N'ALTER TABLE dbo.payments DROP COLUMN updated_at;';
END
GO

-- 6. mini_ecommerce_cart
USE mini_ecommerce_cart;
GO
SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO
-- For carts
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('dbo.carts') AND name = 'created_at')
BEGIN
    EXEC sp_executesql N'UPDATE dbo.carts SET created_date = created_at WHERE created_date IS NULL AND created_at IS NOT NULL;';
    EXEC sp_executesql N'ALTER TABLE dbo.carts DROP COLUMN created_at;';
END
GO
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('dbo.carts') AND name = 'updated_at')
BEGIN
    EXEC sp_executesql N'UPDATE dbo.carts SET last_modified_date = updated_at WHERE last_modified_date IS NULL AND updated_at IS NOT NULL;';
    EXEC sp_executesql N'ALTER TABLE dbo.carts DROP COLUMN updated_at;';
END
GO
-- For cart_items
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('dbo.cart_items') AND name = 'created_at')
BEGIN
    EXEC sp_executesql N'UPDATE dbo.cart_items SET created_date = created_at WHERE created_date IS NULL AND created_at IS NOT NULL;';
    EXEC sp_executesql N'ALTER TABLE dbo.cart_items DROP COLUMN created_at;';
END
GO
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('dbo.cart_items') AND name = 'updated_at')
BEGIN
    EXEC sp_executesql N'UPDATE dbo.cart_items SET last_modified_date = updated_at WHERE last_modified_date IS NULL AND updated_at IS NOT NULL;';
    EXEC sp_executesql N'ALTER TABLE dbo.cart_items DROP COLUMN updated_at;';
END
GO

-- 7. mini_ecommerce_promotion
USE mini_ecommerce_promotion;
GO
SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('dbo.vouchers') AND name = 'created_at')
BEGIN
    EXEC sp_executesql N'UPDATE dbo.vouchers SET created_date = created_at WHERE created_date IS NULL AND created_at IS NOT NULL;';
    EXEC sp_executesql N'ALTER TABLE dbo.vouchers DROP COLUMN created_at;';
END
GO
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('dbo.vouchers') AND name = 'updated_at')
BEGIN
    EXEC sp_executesql N'UPDATE dbo.vouchers SET last_modified_date = updated_at WHERE last_modified_date IS NULL AND updated_at IS NOT NULL;';
    EXEC sp_executesql N'ALTER TABLE dbo.vouchers DROP COLUMN updated_at;';
END
GO
