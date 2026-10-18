export const requireFields = (data, fields, entityName) => {
  const missing = fields.filter((field) => {
    const value = field.split('.').reduce((current, key) => current?.[key], data);
    return value === undefined || value === null || value === '';
  });

  if (missing.length) {
    throw new Error(`${entityName} missing required fields: ${missing.join(', ')}`);
  }
};

export const validateProductPayload = (product, { publish = false } = {}) => {
  const baseFields = ['title', 'brand', 'category', 'sku'];
  const publishFields = [
    'fullDescription',
    'pricing.sellingPrice',
    'inventory.stockQuantity',
    'shipping.returnPolicy'
  ];

  requireFields(product, publish ? [...baseFields, ...publishFields] : baseFields, 'Product');

  const price = Number(product.pricing?.sellingPrice || 0);
  const stock = Number(product.inventory?.stockQuantity || 0);
  const gstRate = Number(product.pricing?.gstRate || 0);

  if (price < 0) throw new Error('Product selling price cannot be negative');
  if (stock < 0) throw new Error('Product stock cannot be negative');
  if (gstRate < 0 || gstRate > 28) throw new Error('Product GST rate must be between 0 and 28');
};

export const validateCouponPayload = (coupon) => {
  requireFields(coupon, ['code', 'discount', 'type', 'expiryDate', 'usageLimit'], 'Coupon');
  if (Number(coupon.discount) <= 0) throw new Error('Coupon discount must be greater than zero');
  if (Number(coupon.usageLimit) <= 0) throw new Error('Coupon usage limit must be greater than zero');
};

export const validateSupportTicketPayload = (ticket) => {
  requireFields(ticket, ['subject', 'message'], 'Support ticket');
};
