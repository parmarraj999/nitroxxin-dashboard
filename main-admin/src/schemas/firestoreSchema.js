export const COLLECTIONS = {
  vendors: 'vendors',
  products: 'product-collection',
  productCategories: 'product_categories',
  productAttributes: 'product_attributes',
  productVariants: 'product_variants',
  brands: 'brands',
  bikeBrands: 'bike_brands',
  orders: 'orders',
  orderItems: 'order_items',
  inventory: 'inventory',
  warehouses: 'warehouses',
  coupons: 'coupons',
  reviews: 'reviews',
  notifications: 'notifications',
  analytics: 'analytics',
  settlements: 'settlements',
  withdrawals: 'withdrawals',
  supportTickets: 'support_tickets',
  mediaLibrary: 'media_library',
  shippingTemplates: 'shipping_templates',
  returnPolicies: 'return_policies',
  certifications: 'certifications',
  bikeCompatibility: 'bike_compatibility',
  events: 'events',
  eventCategories: 'event_categories',
  eventBookings: 'event_bookings',
  eventParticipants: 'event_participants',
  eventCoupons: 'event_coupons',
  eventReviews: 'event_reviews',
  eventAnalytics: 'event_analytics',
  vendorPayouts: 'vendor_payouts',
  transactions: 'transactions'
};

export const PRODUCT_STATUSES = {
  draft: 'draft',
  published: 'published',
  archived: 'archived'
};

export const ORDER_STATUSES = [
  'pending',
  'confirmed',
  'packed',
  'shipped',
  'delivered',
  'cancelled',
  'returned'
];

export const MEDIA_TYPES = [
  'primaryImage',
  'galleryImages',
  'lifestyleImages',
  'sizeCharts',
  'certificationImages',
  'brandLogos',
  'videos'
];

export const categoryAttributeDefinitions = {
  Helmet: ['shellMaterial', 'visorType', 'ventilation', 'certification'],
  Jacket: ['armorType', 'waterproof', 'ventilationPanels'],
  Gloves: ['knuckleProtection', 'touchscreenSupport'],
  Boots: ['ankleProtection', 'waterproof'],
  'Phone Mount': ['mountingType', 'rotationSupport'],
  GPS: ['batteryLife', 'connectivity'],
  'Aux Lights': ['wattage', 'waterproofRating'],
  Exhaust: ['material', 'soundLevel']
};

export const emptyVendorProfile = {
  ownerId: '',
  displayName: '',
  verificationStatus: 'pending',
  gstDetails: {
    gstNumber: '',
    legalName: '',
    registrationState: ''
  },
  businessDetails: {
    businessName: '',
    businessType: '',
    pan: '',
    supportEmail: '',
    supportPhone: ''
  },
  brandInformation: {
    brandName: '',
    logoUrl: '',
    description: ''
  },
  returnAddress: {},
  warehouseAddress: {},
  pickupAddress: {}
};

export const emptyProduct = {
  vendorId: '',
  title: '',
  brand: '',
  category: '',
  subCategory: '',
  sku: '',
  shortDescription: '',
  fullDescription: '',
  colorOptions: [],
  sizeOptions: [],
  weight: '',
  dimensions: { length: '', width: '', height: '', unit: 'cm' },
  material: '',
  warranty: '',
  countryOfManufacture: '',
  compatibility: '',
  keyFeatures: [],
  safety: {
    BIS: false,
    DOT: false,
    ECE: false,
    CELevel1: false,
    CELevel2: false
  },
  pricing: {
    mrp: 0,
    sellingPrice: 0,
    discountPercent: 0,
    gstRate: 0
  },
  inventory: {
    stockQuantity: 0,
    lowStockThreshold: 5
  },
  shipping: {
    dispatchTime: '',
    shippingOrigin: '',
    codAvailable: false,
    returnPolicy: ''
  },
  seo: {
    seoTitle: '',
    metaDescription: '',
    tags: [],
    keywords: [],
    compatibleBikes: [],
    badges: []
  },
  attributes: {},
  media: {
    primaryImage: '',
    galleryImages: [],
    lifestyleImages: [],
    sizeCharts: [],
    certificationImages: [],
    brandLogos: [],
    videos: []
  },
  status: PRODUCT_STATUSES.draft,
  averageRating: 0,
  reviewCount: 0
};

export const collectionStructure = {
  vendors: '{vendorId}: vendor profile, verification, GST, addresses, wallet summary',
  products: '{productId}: complete listing identity, specs, pricing, SEO, media, status',
  product_categories: '{categoryId}: category tree and active flags',
  product_attributes: '{categoryName}: dynamic attribute definitions',
  product_variants: '{variantId}: productId, sku, size/color, price, stock',
  brands: '{brandId}: accessory brand, logo, authorization, merchandising metadata',
  bike_brands: '{bikeBrandId}: bike manufacturer, logo, authorization, bikes[]',
  orders: '{orderId}: vendorId, customer, totals, shipping, tracking, invoice, status',
  order_items: '{itemId}: orderId, vendorId, productId, qty, price snapshot',
  inventory: '{productId or variantId}: stock, reservedStock, availableStock, warehouseId',
  warehouses: '{warehouseId}: vendorId, address, contact, pickup configuration',
  coupons: '{couponId}: vendorId, code, discount, type, expiryDate, usageLimit',
  reviews: '{reviewId}: vendorId, productId, customer, rating, reply',
  notifications: '{notificationId}: vendorId, type, title, body, read',
  analytics: '{vendorId_yyyy_mm}: revenue, orders, topProducts, categorySales',
  settlements: '{settlementId}: vendorId, amount, period, status',
  withdrawals: '{withdrawalId}: vendorId, amount, bank, status',
  support_tickets: '{ticketId}: vendorId, subject, status, replies',
  media_library: '{mediaId}: vendorId, productId, storagePath, downloadUrl, type',
  shipping_templates: '{templateId}: vendorId, rates, regions, dispatchTime',
  return_policies: '{policyId}: vendorId, windowDays, terms',
  certifications: '{certificationId}: vendorId, productId, type, documentUrl',
  bike_compatibility: '{compatibilityId}: vendorId, productId, make, model, yearRange'
};
