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

/**
 * Validates a vendor's Phone number:
 * - Must be strictly digits only
 * - Must be min 10 and max 10 digits (exact 10 digits)
 */
export const validatePhoneNumber = (phone) => {
  if (!phone || typeof phone !== 'string') {
    return { isValid: false, error: 'Phone number is required.' };
  }
  const clean = phone.trim();
  if (!/^\d+$/.test(clean)) {
    return { isValid: false, error: 'Phone number must contain only numbers.' };
  }
  if (clean.length < 10) {
    return { isValid: false, error: 'Phone number must be at least 10 digits.' };
  }
  if (clean.length > 10) {
    return { isValid: false, error: 'Phone number cannot exceed 10 digits.' };
  }
  return { isValid: true, cleanPhone: clean };
};

/**
 * Validates a 15-character Indian Goods and Services Tax Identification Number (GSTIN):
 * - Digits 1–2: State code (based on Indian Census: 2 digits)
 * - Digits 3–12: Permanent Account Number (PAN) of the business entity (5 letters, 4 digits, 1 letter)
 * - Digit 13: Entity code (number of registrations a business has within the same state: 1-9 or A-Z)
 * - Digit 14: Default character (Z) reserved by the system
 * - Digit 15: Check code (alphanumeric digit used for error detection)
 */
export const validateGstNumber = (gstNumber) => {
  if (!gstNumber || typeof gstNumber !== 'string') {
    return { isValid: false, error: 'GST Number is required.' };
  }
  const clean = gstNumber.trim().toUpperCase();
  if (clean.length !== 15) {
    return { isValid: false, error: 'GST Number must be exactly 15 characters long.' };
  }

  // Digits 1–2: State code (2 digits)
  const stateCode = clean.slice(0, 2);
  if (!/^\d{2}$/.test(stateCode)) {
    return { isValid: false, error: 'GST digits 1–2 must be a valid 2-digit state code (e.g. 27).' };
  }

  // Digits 3–12: PAN of the business entity (5 uppercase letters, 4 digits, 1 uppercase letter)
  const pan = clean.slice(2, 12);
  if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan)) {
    return {
      isValid: false,
      error: 'GST digits 3–12 must be a valid 10-character PAN (5 letters, 4 numbers, 1 letter, e.g. ABCDE1234F).'
    };
  }

  // Digit 13: Entity code (1-9 or A-Z)
  const entityCode = clean[12];
  if (!/^[1-9A-Z]$/.test(entityCode)) {
    return { isValid: false, error: 'GST digit 13 must be a valid entity code (1-9 or A-Z).' };
  }

  // Digit 14: Default character (Z)
  const defaultChar = clean[13];
  if (defaultChar !== 'Z') {
    return { isValid: false, error: "GST digit 14 must be default character 'Z'." };
  }

  // Digit 15: Check code (alphanumeric digit)
  const checkCode = clean[14];
  if (!/^[0-9A-Z]$/.test(checkCode)) {
    return { isValid: false, error: 'GST digit 15 must be an alphanumeric check code.' };
  }

  return {
    isValid: true,
    cleanGst: clean,
    stateCode,
    pan,
    entityCode,
    checkCode
  };
};

