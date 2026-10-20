IF NOT EXISTS (SELECT 1 FROM vouchers WHERE code = 'FREESHIP30K')
BEGIN
    INSERT INTO vouchers (code, discount_amount, max_discount_amount, min_order_value, min_membership_tier, usage_limit, used_count, valid_from, valid_to, is_active, created_by, created_date, version)
    VALUES ('FREESHIP30K', 30000.00, 30000.00, 300000.00, NULL, 1000, 0, '2026-01-01 00:00:00', '2027-12-31 23:59:59', 1, 'system', SYSUTCDATETIME(), 0);
END;

IF NOT EXISTS (SELECT 1 FROM vouchers WHERE code = 'WELCOME50K')
BEGIN
    INSERT INTO vouchers (code, discount_amount, max_discount_amount, min_order_value, min_membership_tier, usage_limit, used_count, valid_from, valid_to, is_active, created_by, created_date, version)
    VALUES ('WELCOME50K', 50000.00, 50000.00, 500000.00, NULL, 1000, 0, '2026-01-01 00:00:00', '2027-12-31 23:59:59', 1, 'system', SYSUTCDATETIME(), 0);
END;

IF NOT EXISTS (SELECT 1 FROM vouchers WHERE code = 'VIPGOLD500K')
BEGIN
    INSERT INTO vouchers (code, discount_amount, max_discount_amount, min_order_value, min_membership_tier, usage_limit, used_count, valid_from, valid_to, is_active, created_by, created_date, version)
    VALUES ('VIPGOLD500K', 500000.00, 500000.00, 10000000.00, 'GOLD', 500, 0, '2026-01-01 00:00:00', '2027-12-31 23:59:59', 1, 'system', SYSUTCDATETIME(), 0);
END;

UPDATE vouchers 
SET valid_to = '2027-12-31 23:59:59', is_active = 1 
WHERE code IN ('KM500K', 'GOLDVOUCHER');
