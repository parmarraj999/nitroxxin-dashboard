import {
  BadgeIndianRupee,
  BarChart3,
  Bell,
  Bike,
  Boxes,
  Building2,
  CircleDollarSign,
  ClipboardCheck,
  FileBarChart,
  Headphones,
  Megaphone,
  Package,
  PackageCheck,
  RotateCcw,
  ShieldCheck,
  Star,
  Tags,
  Truck,
  Users,
  Warehouse
} from 'lucide-react';
import { COLLECTIONS } from '../../schemas/firestoreSchema';

const accessoryCategories = [
  'Helmets',
  'Riding Jackets',
  'Riding Gloves',
  'Riding Boots',
  'Luggage',
  'Crash Guards',
  'Lights',
  'Mobile Holders',
  'Tyres',
  'Engine Oil',
  'Bluetooth',
  'Performance Parts'
];

const productBrands = ['Axor', 'SMK', 'LS2', 'Rynox', 'Raida', 'Viaterra', 'Motul', 'Brembo'];

const text = (key, label, placeholder = '') => ({ key, label, type: 'text', placeholder });
const number = (key, label, placeholder = '') => ({ key, label, type: 'number', placeholder });
const area = (key, label, placeholder = '') => ({ key, label, type: 'textarea', placeholder });
const select = (key, label, options) => ({ key, label, type: 'select', options });
const image = (key, label) => ({ key, label, type: 'image' });

export const moduleConfigs = {
  events: {
    title: 'Event Management', subtitle: 'Create and manage event listings independently from store products.', collectionName: COLLECTIONS.events, icon: ClipboardCheck, primaryAction: 'Create Event', accent: '#7c3aed', global: true,
    fields: [text('name', 'Event Name', 'Monsoon Ride 2026'), text('venue', 'Venue', 'Lonavala'), text('eventDate', 'Event Date', '2026-08-15'), number('ticketPrice', 'Ticket Price', '999'), number('capacity', 'Capacity', '250'), select('status', 'Status', ['draft', 'published', 'cancelled'])],
    columns: ['name', 'venue', 'eventDate', 'ticketPrice', 'capacity', 'status'], seed: [{ name: 'Monsoon Ride 2026', venue: 'Lonavala', eventDate: '2026-08-15', ticketPrice: 999, capacity: 250, status: 'published' }]
  },
  eventCategories: {
    title: 'Event Categories', subtitle: 'Organize event types without affecting product categories.', collectionName: COLLECTIONS.eventCategories, icon: Tags, primaryAction: 'Add Event Category', accent: '#0f766e', global: true,
    fields: [text('name', 'Category Name', 'Group Ride'), area('description', 'Description', 'Community motorcycle rides'), select('status', 'Status', ['active', 'draft'])], columns: ['name', 'description', 'status'], seed: [{ name: 'Group Ride', description: 'Community motorcycle rides', status: 'active' }]
  },
  eventBookings: {
    title: 'Event Bookings', subtitle: 'Track registrations and ticket payments for events only.', collectionName: COLLECTIONS.eventBookings, icon: ClipboardCheck, primaryAction: 'Add Booking', accent: '#2563eb', global: true,
    fields: [text('bookingId', 'Booking ID', 'EVB-2026-001'), text('eventName', 'Event', 'Monsoon Ride 2026'), text('customer', 'Participant', 'Aarav Sharma'), number('tickets', 'Tickets', '2'), number('amount', 'Amount', '1998'), select('status', 'Status', ['confirmed', 'pending', 'cancelled', 'refunded'])], columns: ['bookingId', 'eventName', 'customer', 'tickets', 'amount', 'status']
  },
  eventParticipants: {
    title: 'Event Participants', subtitle: 'Manage check-in and attendance separately from store customers.', collectionName: COLLECTIONS.eventParticipants, icon: Users, primaryAction: 'Add Participant', accent: '#0891b2', global: true,
    fields: [text('name', 'Participant Name', 'Aarav Sharma'), text('eventName', 'Event', 'Monsoon Ride 2026'), text('phone', 'Phone', '+91 98765 43210'), select('checkInStatus', 'Check-in Status', ['registered', 'checked_in', 'no_show'])], columns: ['name', 'eventName', 'phone', 'checkInStatus']
  },
  eventCoupons: {
    title: 'Event Coupons', subtitle: 'Create discount codes applicable only to event bookings.', collectionName: COLLECTIONS.eventCoupons, icon: Megaphone, primaryAction: 'Add Event Coupon', accent: '#ea580c', global: true, defaults: { couponScope: 'event' },
    fields: [text('code', 'Code', 'RIDE2026'), number('discount', 'Discount', '15'), select('discountType', 'Discount Type', ['percent', 'fixed']), text('expiresAt', 'Expires', '2026-08-15'), select('status', 'Status', ['active', 'scheduled', 'expired'])], columns: ['code', 'discount', 'discountType', 'expiresAt', 'status']
  },
  eventReviews: {
    title: 'Event Reviews', subtitle: 'Moderate feedback left for events, separate from product reviews.', collectionName: COLLECTIONS.eventReviews, icon: Star, primaryAction: 'Add Event Review', accent: '#ca8a04', global: true,
    fields: [text('eventName', 'Event', 'Monsoon Ride 2026'), text('customer', 'Participant', 'Rohit Mehta'), number('rating', 'Rating (1-5)', '5'), area('review', 'Review', 'Great route and coordination.'), select('status', 'Status', ['published', 'pending', 'hidden'])], columns: ['eventName', 'customer', 'rating', 'review', 'status']
  },
  eventAnalytics: {
    title: 'Event Analytics', subtitle: 'Measure ticket sales, attendance, and event revenue.', collectionName: COLLECTIONS.eventAnalytics, icon: BarChart3, primaryAction: 'Add Event Snapshot', accent: '#16a34a', global: true,
    fields: [text('period', 'Period', '2026-08'), text('eventName', 'Event', 'Monsoon Ride 2026'), number('bookings', 'Bookings', '120'), number('attendance', 'Attendance', '110'), number('revenue', 'Revenue', '119880')], columns: ['period', 'eventName', 'bookings', 'attendance', 'revenue']
  },
  pendingVendors: {
    title: 'Pending Vendor Approval', subtitle: 'Review vendors awaiting platform approval.', collectionName: COLLECTIONS.vendors, icon: Building2, primaryAction: 'Add Vendor', accent: '#b45309', filters: [['verificationStatus', '==', 'pending']],
    fields: [text('displayName', 'Vendor Name', 'Nitroxx Moto Gear'), text('gstNumber', 'GST Number', '27ABCDE1234F1Z5'), text('pan', 'PAN', 'ABCDE1234F'), select('verificationStatus', 'Verification', ['pending', 'verified', 'rejected'])], columns: ['displayName', 'gstNumber', 'pan', 'verificationStatus']
  },
  vendorProducts: {
    title: 'Vendor Products', subtitle: 'View product listings by vendor without mixing them with event inventory.', collectionName: COLLECTIONS.products, icon: Package, primaryAction: 'Add Vendor Product', accent: '#7c3aed',
    fields: [text('title', 'Product Name', 'Axor Apex Helmet'), text('vendorId', 'Vendor ID', 'vendor-id'), text('sku', 'SKU', 'AXR-APX-001'), select('status', 'Status', ['draft', 'published', 'archived'])], columns: ['title', 'vendorId', 'sku', 'status']
  },
  vendorEvents: {
    title: 'Vendor Events', subtitle: 'View events published by vendors independently from product listings.', collectionName: COLLECTIONS.events, icon: ClipboardCheck, primaryAction: 'Add Vendor Event', accent: '#7c3aed',
    fields: [text('name', 'Event Name', 'Monsoon Ride 2026'), text('vendorId', 'Vendor ID', 'vendor-id'), text('venue', 'Venue', 'Lonavala'), text('eventDate', 'Event Date', '2026-08-15'), select('status', 'Status', ['draft', 'published', 'cancelled'])], columns: ['name', 'vendorId', 'venue', 'eventDate', 'status']
  },
  vendorPayouts: {
    title: 'Vendor Payouts', subtitle: 'Schedule and audit payouts owed to marketplace vendors.', collectionName: COLLECTIONS.vendorPayouts, icon: BadgeIndianRupee, primaryAction: 'Add Payout', accent: '#15803d', global: true,
    fields: [text('payoutId', 'Payout ID', 'PAY-2026-001'), text('vendorName', 'Vendor', 'Rynox Performance'), number('amount', 'Amount', '175000'), text('period', 'Period', 'July 2026'), select('status', 'Status', ['scheduled', 'processing', 'paid', 'hold'])], columns: ['payoutId', 'vendorName', 'amount', 'period', 'status']
  },
  productCoupons: {
    title: 'Product Coupons', subtitle: 'Create discount codes that apply only to store products.', collectionName: COLLECTIONS.coupons, icon: Megaphone, primaryAction: 'Add Product Coupon', accent: '#ea580c', global: true, defaults: { couponScope: 'product' }, filters: [['couponScope', '==', 'product']],
    fields: [text('code', 'Code', 'RIDEFAST15'), number('discount', 'Discount', '15'), select('discountType', 'Discount Type', ['percent', 'fixed']), text('expiresAt', 'Expires', '2026-08-31'), select('status', 'Status', ['active', 'scheduled', 'expired'])], columns: ['code', 'discount', 'discountType', 'expiresAt', 'status']
  },
  productReviews: {
    title: 'Product Reviews', subtitle: 'Moderate store product feedback independently from event reviews.', collectionName: COLLECTIONS.reviews, icon: Star, primaryAction: 'Add Product Review', accent: '#ca8a04', global: true, defaults: { reviewScope: 'product' }, filters: [['reviewScope', '==', 'product']],
    fields: [text('productName', 'Product Name', 'LS2 FF800 Storm'), text('customer', 'Customer Name', 'Rohit Mehta'), number('rating', 'Rating (1-5)', '5'), area('review', 'Customer Review', 'Excellent fit and ventilation.'), select('status', 'Status', ['published', 'pending', 'hidden'])], columns: ['productName', 'customer', 'rating', 'review', 'status']
  },
  productAnalytics: {
    title: 'Product Analytics', subtitle: 'Measure store performance separately from event performance.', collectionName: COLLECTIONS.analytics, icon: BarChart3, primaryAction: 'Add Product Snapshot', accent: '#16a34a', global: true, defaults: { analyticsScope: 'product' }, filters: [['analyticsScope', '==', 'product']],
    fields: [text('period', 'Period', '2026-08'), number('revenue', 'Revenue', '1250000'), number('orders', 'Orders', '420'), number('visitors', 'Visitors', '18000'), number('conversionRate', 'Conversion Rate %', '2.8')], columns: ['period', 'revenue', 'orders', 'visitors', 'conversionRate']
  },
  vendors: {
    title: 'Vendor Management',
    subtitle: 'Onboard, verify, settle, and measure marketplace vendors.',
    collectionName: COLLECTIONS.vendors,
    icon: Building2,
    primaryAction: 'Add Vendor',
    accent: '#111827',
    fields: [
      text('displayName', 'Vendor Name', 'Nitroxx Moto Gear'),
      select('verificationStatus', 'Verification', ['pending', 'verified', 'rejected', 'suspended']),
      text('gstNumber', 'GST Number', '27ABCDE1234F1Z5'),
      text('pan', 'PAN', 'ABCDE1234F'),
      text('warehouse', 'Warehouse', 'Mumbai FC'),
      text('pickupAddress', 'Pickup Address', 'Andheri East, Mumbai'),
      number('commission', 'Commission %', '12'),
      select('settlementStatus', 'Settlement', ['scheduled', 'processing', 'paid', 'hold'])
    ],
    columns: ['displayName', 'verificationStatus', 'gstNumber', 'warehouse', 'commission', 'settlementStatus'],
    seed: [
      { displayName: 'Rynox Performance', verificationStatus: 'verified', gstNumber: '27RYNOX2026Z1', pan: 'RYNOX8890F', warehouse: 'Pune Hub', pickupAddress: 'Chakan, Pune', commission: 12, settlementStatus: 'scheduled' },
      { displayName: 'Moto Oil Depot', verificationStatus: 'pending', gstNumber: '29MOTUL1122Z7', pan: 'MOTUL7741K', warehouse: 'Bengaluru FC', pickupAddress: 'Peenya, Bengaluru', commission: 10, settlementStatus: 'hold' }
    ]
  },
  categories: {
    title: 'Category Management',
    subtitle: 'Build unlimited accessories categories, subcategories, and listing rules.',
    collectionName: COLLECTIONS.productCategories,
    icon: Tags,
    primaryAction: 'Add Category',
    accent: '#0f766e',
    fields: [
      text('name', 'Category Name', 'Helmets'),
      image('imageUrl', 'Category Image'),
      text('parentCategory', 'Parent Category', 'Rider Safety'),
      { key: 'subcategories', label: 'Subcategories', type: 'subcategories' },
      select('status', 'Status', ['active', 'draft', 'hidden']),
      number('sortOrder', 'Sort Order', '10'),
      area('attributes', 'Required Attributes', 'ISI, DOT, ECE, shell material')
    ],
    columns: ['name', 'parentCategory', 'subcategories', 'status', 'sortOrder'],
    seed: [
      { name: 'Helmets', parentCategory: 'Rider Safety', subcategories: 'Full Face, Modular, Off Road, Dual Sport', status: 'active', sortOrder: 1, attributes: 'ISI, DOT, ECE, Pinlock Ready' },
      { name: 'Luggage', parentCategory: 'Touring', subcategories: 'Tank Bags, Tail Bags, Saddle Bags, Top Boxes', status: 'active', sortOrder: 4, attributes: 'Capacity, Waterproof, Mounting Type' }
    ]
  },
  brands: {
    title: 'Accessory Brand Management',
    subtitle: 'Manage the brands that sell accessories in the store.',
    collectionName: COLLECTIONS.brands,
    icon: ShieldCheck,
    primaryAction: 'Add Accessory Brand',
    accent: '#7c3aed',
    fields: [
      text('name', 'Accessory Brand Name', 'Axor'),
      image('imageUrl', 'Accessory Brand Image'),
      select('authorizedStatus', 'Authorized', ['authorized', 'pending', 'not_authorized']),
      select('popular', 'Popular', ['yes', 'no'])
    ],
    columns: ['name', 'imageUrl', 'authorizedStatus', 'popular'],
    seed: [
      { name: 'Axor', authorizedStatus: 'authorized', popular: 'yes' },
      { name: 'Motul', authorizedStatus: 'authorized', popular: 'yes' }
    ]
  },
  bikeBrands: {
    title: 'Bike Brand Management',
    subtitle: 'Manage bike manufacturers and the bikes available under each brand.',
    collectionName: COLLECTIONS.bikeBrands,
    icon: Bike,
    primaryAction: 'Add Bike Brand',
    accent: '#2563eb',
    global: true,
    fields: [
      text('name', 'Bike Brand Name', 'Royal Enfield'),
      image('imageUrl', 'Brand Logo'),
      text('bannerUrl', 'Brand Banner URL', 'https://...'),
      select('featured', 'Featured', ['yes', 'no']),
      select('popular', 'Popular', ['yes', 'no'])
    ],
    columns: ['name', 'imageUrl', 'featured', 'popular'],
    seed: [
      { name: 'Royal Enfield', featured: 'yes', popular: 'yes' },
      { name: 'KTM', featured: 'no', popular: 'yes' }
    ]
  },
  inventory: {
    title: 'Inventory Control',
    subtitle: 'Track warehouse stock, reserved units, incoming stock, and low-stock risk.',
    collectionName: COLLECTIONS.inventory,
    icon: Warehouse,
    primaryAction: 'Add Stock Record',
    accent: '#0891b2',
    fields: [
      text('productName', 'Product', 'Rynox Tornado Pro Jacket'),
      text('sku', 'SKU', 'RYN-JKT-BLK-L'),
      text('warehouseId', 'Warehouse', 'Mumbai FC'),
      number('stock', 'Total Stock', '80'),
      number('reservedStock', 'Reserved', '12'),
      number('availableStock', 'Available', '68'),
      number('lowStockThreshold', 'Low Stock Alert', '10'),
      text('restockDate', 'Restock Date', '2026-07-20')
    ],
    columns: ['productName', 'sku', 'warehouseId', 'availableStock', 'reservedStock', 'lowStockThreshold'],
    seed: [
      { productName: 'SMK Stellar Helmet', sku: 'SMK-HEL-M-BLK', warehouseId: 'Delhi FC', stock: 42, reservedStock: 6, availableStock: 36, lowStockThreshold: 8, restockDate: '2026-07-18' },
      { productName: 'Motul Chain Lube', sku: 'MOT-CL-400', warehouseId: 'Mumbai FC', stock: 12, reservedStock: 4, availableStock: 8, lowStockThreshold: 15, restockDate: '2026-07-09' }
    ]
  },
  shipping: {
    title: 'Shipping Operations',
    subtitle: 'Manage courier templates, dispatch SLAs, pickup points, and proof workflows.',
    collectionName: COLLECTIONS.shippingTemplates,
    icon: Truck,
    primaryAction: 'Add Template',
    accent: '#2563eb',
    fields: [
      text('name', 'Template Name', 'Standard Accessories Shipping'),
      text('courier', 'Courier', 'Blue Dart'),
      text('regions', 'Regions', 'India - All serviceable PIN codes'),
      number('shippingFee', 'Shipping Fee', '99'),
      number('codCharges', 'COD Charges', '40'),
      text('dispatchTime', 'Dispatch Time', '24 hours'),
      select('status', 'Status', ['active', 'paused'])
    ],
    columns: ['name', 'courier', 'regions', 'shippingFee', 'codCharges', 'dispatchTime', 'status'],
    seed: [
      { name: 'Helmet Express', courier: 'Delhivery', regions: 'Metro cities', shippingFee: 149, codCharges: 50, dispatchTime: 'Same day', status: 'active' }
    ]
  },
  customers: {
    title: 'Customer Management',
    subtitle: 'See customer history, wallet signals, support status, and loyalty value.',
    collectionName: 'customers',
    icon: Users,
    primaryAction: 'Add Customer',
    accent: '#be123c',
    fields: [
      text('name', 'Customer Name', 'Aarav Sharma'),
      text('email', 'Email', 'aarav@example.com'),
      text('phone', 'Phone', '+91 98765 43210'),
      number('orders', 'Orders', '8'),
      number('lifetimeValue', 'Lifetime Value', '48500'),
      select('segment', 'Segment', ['new', 'repeat', 'vip', 'at_risk']),
      text('city', 'City', 'Mumbai')
    ],
    columns: ['name', 'email', 'phone', 'orders', 'lifetimeValue', 'segment', 'city'],
    seed: [
      { name: 'Aarav Sharma', email: 'aarav@example.com', phone: '+91 98765 43210', orders: 9, lifetimeValue: 52300, segment: 'vip', city: 'Mumbai' }
    ]
  },
  returns: {
    title: 'Returns & Refunds',
    subtitle: 'Approve, inspect, replace, refund, and audit every return request.',
    collectionName: 'returns',
    icon: RotateCcw,
    primaryAction: 'Create Return',
    accent: '#dc2626',
    fields: [
      text('returnId', 'Return ID', 'RET-2026-1024'),
      text('orderId', 'Order ID', 'ORD-2026-8842'),
      text('customer', 'Customer', 'Priya Nair'),
      text('productName', 'Product', 'Axor Apex Helmet'),
      select('status', 'Status', ['requested', 'approved', 'inspection', 'replacement', 'refunded', 'rejected']),
      select('reason', 'Reason', ['size_issue', 'damaged', 'wrong_item', 'not_as_described']),
      number('refundAmount', 'Refund Amount', '4999')
    ],
    columns: ['returnId', 'orderId', 'customer', 'productName', 'status', 'reason', 'refundAmount'],
    seed: [
      { returnId: 'RET-2026-1001', orderId: 'ORD-2026-4211', customer: 'Priya Nair', productName: 'Axor Apex Helmet', status: 'inspection', reason: 'size_issue', refundAmount: 4999 }
    ]
  },
  reviews: {
    title: 'Reviews & Moderation',
    subtitle: 'Manage customer ratings, reviews, verified purchases, status, and seller replies.',
    collectionName: COLLECTIONS.reviews,
    icon: Star,
    primaryAction: 'Add / Moderate Review',
    accent: '#ca8a04',
    fields: [
      text('productName', 'Product Name', 'LS2 FF800 Storm'),
      text('customer', 'Customer Name', 'Rohit Mehta'),
      number('rating', 'Rating (1-5)', '5'),
      text('title', 'Review Title / Headline', 'Excellent quality and fit!'),
      select('verifiedPurchase', 'Verified Purchase', ['yes', 'no']),
      select('status', 'Status', ['published', 'pending', 'hidden']),
      area('review', 'Customer Review', 'Excellent fit and ventilation.'),
      area('reply', 'Seller / Admin Reply', 'Thank you for your feedback! Riding with Nitroxx.')
    ],
    columns: ['productName', 'customer', 'rating', 'title', 'verifiedPurchase', 'status', 'review', 'reply'],
    seed: [
      { productName: 'LS2 FF800 Storm', customer: 'Rohit Mehta', rating: 5, title: 'Excellent fit!', verifiedPurchase: 'yes', status: 'published', review: 'Excellent fit and ventilation.', reply: 'Thank you for riding with Nitroxx.' }
    ]
  },
  promotions: {
    title: 'Promotions',
    subtitle: 'Run coupons, flash sales, bundles, referral rewards, and festival campaigns.',
    collectionName: COLLECTIONS.coupons,
    icon: Megaphone,
    primaryAction: 'Add Promotion',
    accent: '#ea580c',
    fields: [
      text('code', 'Code', 'RIDEFAST15'),
      select('type', 'Type', ['coupon', 'flash_sale', 'bundle', 'festival', 'loyalty']),
      number('discount', 'Discount', '15'),
      select('discountType', 'Discount Type', ['percent', 'fixed']),
      text('startsAt', 'Starts', '2026-07-04'),
      text('expiresAt', 'Expires', '2026-07-31'),
      number('usageLimit', 'Usage Limit', '500'),
      select('status', 'Status', ['active', 'scheduled', 'expired', 'paused'])
    ],
    columns: ['code', 'type', 'discount', 'discountType', 'expiresAt', 'usageLimit', 'status'],
    seed: [
      { code: 'MONSOONRIDE', type: 'festival', discount: 18, discountType: 'percent', startsAt: '2026-07-04', expiresAt: '2026-07-31', usageLimit: 750, status: 'active' }
    ]
  },
  analytics: {
    title: 'Analytics',
    subtitle: 'Measure revenue, conversion, top products, category mix, and geography.',
    collectionName: COLLECTIONS.analytics,
    icon: BarChart3,
    primaryAction: 'Add Snapshot',
    accent: '#16a34a',
    fields: [
      text('period', 'Period', '2026-07'),
      number('revenue', 'Revenue', '1250000'),
      number('orders', 'Orders', '420'),
      number('visitors', 'Visitors', '18000'),
      number('conversionRate', 'Conversion Rate %', '2.8'),
      number('averageOrderValue', 'Average Order Value', '2976'),
      text('topCategory', 'Top Category', 'Helmets'),
      text('topCity', 'Top City', 'Bengaluru')
    ],
    columns: ['period', 'revenue', 'orders', 'visitors', 'conversionRate', 'averageOrderValue', 'topCategory'],
    seed: [
      { period: '2026-07', revenue: 1250000, orders: 420, visitors: 18000, conversionRate: 2.8, averageOrderValue: 2976, topCategory: 'Helmets', topCity: 'Bengaluru' }
    ]
  },
  reports: {
    title: 'Reports',
    subtitle: 'Create product and event reports alongside sales, inventory, tax, vendor, and refund exports.',
    collectionName: 'reports',
    icon: FileBarChart,
    primaryAction: 'Create Report',
    accent: '#475569',
    global: true,
    tableFilters: [{ key: 'reportScope', label: 'Scope', options: ['products', 'events', 'all'] }],
    fields: [
      text('name', 'Report Name', 'Monthly GST Report'),
      select('reportScope', 'Data Scope', ['products', 'events', 'all']),
      select('type', 'Type', ['sales', 'inventory', 'tax', 'vendor', 'customer', 'category', 'brand', 'refund', 'return', 'bookings', 'attendance']),
      text('period', 'Period', 'July 2026'),
      select('format', 'Format', ['csv', 'excel', 'pdf']),
      select('status', 'Status', ['queued', 'ready', 'failed']),
      text('owner', 'Owner', 'Finance')
    ],
    columns: ['name', 'reportScope', 'type', 'period', 'format', 'status', 'owner'],
    seed: [
      { name: 'Weekly Inventory Risk', type: 'inventory', period: 'Week 27, 2026', format: 'excel', status: 'ready', owner: 'Inventory' }
    ]
  },
  finance: {
    title: 'Finance',
    subtitle: 'Track vendor payouts, refunds, commissions, and transactions in one finance ledger.',
    collectionName: COLLECTIONS.settlements,
    icon: CircleDollarSign,
    primaryAction: 'Add Settlement',
    accent: '#15803d',
    global: true,
    fields: [
      text('settlementId', 'Settlement ID', 'SET-2026-0720'),
      text('vendorName', 'Vendor', 'Rynox Performance'),
      select('transactionType', 'Transaction Type', ['vendor_payout', 'refund', 'commission', 'transaction']),
      number('grossAmount', 'Gross Amount', '250000'),
      number('commission', 'Commission', '30000'),
      number('refundAmount', 'Refund Amount', '0'),
      number('gst', 'GST', '45000'),
      number('netPayable', 'Net Payable', '175000'),
      select('status', 'Status', ['scheduled', 'processing', 'paid', 'hold'])
    ],
    columns: ['settlementId', 'vendorName', 'transactionType', 'grossAmount', 'commission', 'refundAmount', 'netPayable', 'status'],
    seed: [
      { settlementId: 'SET-2026-0701', vendorName: 'Rynox Performance', grossAmount: 250000, commission: 30000, gst: 45000, netPayable: 175000, status: 'scheduled' }
    ]
  },
  notifications: {
    title: 'Notifications',
    subtitle: 'Manage low stock, new order, refund, price change, and offer alerts.',
    collectionName: COLLECTIONS.notifications,
    icon: Bell,
    primaryAction: 'Create Alert',
    accent: '#9333ea',
    fields: [
      select('type', 'Type', ['new_order', 'low_stock', 'out_of_stock', 'return_request', 'refund_request', 'price_change', 'offer_expiry']),
      text('title', 'Title', 'Low stock on chain lube'),
      area('body', 'Message', 'Motul Chain Lube is below threshold in Mumbai FC.'),
      select('priority', 'Priority', ['low', 'medium', 'high', 'critical']),
      select('read', 'Read', ['false', 'true'])
    ],
    columns: ['type', 'title', 'priority', 'read', 'body'],
    seed: [
      { type: 'low_stock', title: 'Low stock on Motul Chain Lube', body: 'Only 8 units available in Mumbai FC.', priority: 'high', read: 'false' }
    ]
  },
  roles: {
    title: 'Role Management',
    subtitle: 'Control access for admin, vendor, warehouse, support, finance, and marketing teams.',
    collectionName: 'roles',
    icon: ClipboardCheck,
    primaryAction: 'Add Role',
    accent: '#0369a1',
    fields: [
      text('roleName', 'Role Name', 'Warehouse Manager'),
      text('scope', 'Scope', 'inventory, orders, shipping'),
      select('accessLevel', 'Access Level', ['read', 'write', 'approve', 'admin']),
      text('members', 'Members', '4'),
      select('status', 'Status', ['active', 'disabled'])
    ],
    columns: ['roleName', 'scope', 'accessLevel', 'members', 'status'],
    seed: [
      { roleName: 'Finance', scope: 'settlements, invoices, GST reports', accessLevel: 'approve', members: 3, status: 'active' }
    ]
  },
  support: {
    title: 'Support Tickets',
    subtitle: 'Resolve product questions, order issues, returns, refunds, and vendor escalations.',
    collectionName: COLLECTIONS.supportTickets,
    icon: Headphones,
    primaryAction: 'Add Ticket',
    accent: '#db2777',
    fields: [
      text('ticketId', 'Ticket ID', 'TKT-2026-501'),
      text('customer', 'Customer', 'Neha Iyer'),
      select('channel', 'Channel', ['email', 'phone', 'chat', 'marketplace']),
      text('subject', 'Subject', 'Need helmet size exchange'),
      select('status', 'Status', ['open', 'pending', 'resolved', 'closed']),
      select('priority', 'Priority', ['low', 'medium', 'high', 'urgent'])
    ],
    columns: ['ticketId', 'customer', 'channel', 'subject', 'status', 'priority'],
    seed: [
      { ticketId: 'TKT-2026-501', customer: 'Neha Iyer', channel: 'chat', subject: 'Need helmet size exchange', status: 'open', priority: 'high' }
    ]
  },
  warehouses: {
    title: 'Warehouses',
    subtitle: 'Manage fulfillment centers, pickup addresses, serviceability, and capacity.',
    collectionName: COLLECTIONS.warehouses,
    icon: Boxes,
    primaryAction: 'Add Warehouse',
    accent: '#0d9488',
    fields: [
      text('name', 'Warehouse Name', 'Mumbai FC'),
      text('city', 'City', 'Mumbai'),
      text('address', 'Address', 'Andheri East'),
      text('manager', 'Manager', 'Sahil Khan'),
      number('capacity', 'Capacity', '12000'),
      select('status', 'Status', ['active', 'paused', 'maintenance'])
    ],
    columns: ['name', 'city', 'manager', 'capacity', 'status'],
    seed: [
      { name: 'Mumbai FC', city: 'Mumbai', address: 'Andheri East', manager: 'Sahil Khan', capacity: 12000, status: 'active' }
    ]
  },
  compatibility: {
    title: 'Bike Compatibility',
    subtitle: 'Map accessories and parts to bike brands, models, variants, engines, and years.',
    collectionName: COLLECTIONS.bikeCompatibility,
    icon: Bike,
    primaryAction: 'Add Fitment',
    accent: '#4f46e5',
    fields: [
      text('productName', 'Product', 'Frame Slider Kit'),
      text('manufacturer', 'Manufacturer', 'Royal Enfield'),
      text('model', 'Model', 'Himalayan 450'),
      text('variant', 'Variant', 'Alloy Wheel'),
      text('engine', 'Engine', '452cc'),
      text('yearRange', 'Year Range', '2024-2026'),
      text('compatibleParts', 'Compatible Parts', 'Frame sliders, engine guard')
    ],
    columns: ['productName', 'manufacturer', 'model', 'variant', 'engine', 'yearRange'],
    seed: [
      { productName: 'Frame Slider Kit', manufacturer: 'Royal Enfield', model: 'Himalayan 450', variant: 'Alloy Wheel', engine: '452cc', yearRange: '2024-2026', compatibleParts: 'Frame sliders, engine guard' }
    ]
  },
  settings: {
    title: 'Marketplace Settings',
    subtitle: 'Configure platform fees, GST defaults, return windows, compliance, and catalog rules.',
    collectionName: 'settings',
    icon: PackageCheck,
    primaryAction: 'Add Setting',
    accent: '#334155',
    fields: [
      text('settingName', 'Setting', 'Default GST'),
      text('module', 'Module', 'Pricing'),
      text('value', 'Value', '18%'),
      select('environment', 'Environment', ['production', 'staging']),
      select('status', 'Status', ['active', 'draft'])
    ],
    columns: ['settingName', 'module', 'value', 'environment', 'status'],
    seed: [
      { settingName: 'Default GST', module: 'Pricing', value: '18%', environment: 'production', status: 'active' }
    ]
  },
  pricing: {
    title: 'Pricing Rules',
    subtitle: 'Manage MRP, selling price, wholesale rates, platform fees, GST, COD, and offers.',
    collectionName: 'pricing_rules',
    icon: BadgeIndianRupee,
    primaryAction: 'Add Rule',
    accent: '#b45309',
    fields: [
      text('ruleName', 'Rule Name', 'Helmet Margin Guard'),
      select('category', 'Category', accessoryCategories),
      select('brand', 'Brand', productBrands),
      number('minimumMargin', 'Minimum Margin %', '18'),
      number('platformFee', 'Platform Fee %', '5'),
      number('gstRate', 'GST Rate %', '18'),
      select('status', 'Status', ['active', 'draft', 'paused'])
    ],
    columns: ['ruleName', 'category', 'brand', 'minimumMargin', 'platformFee', 'gstRate', 'status'],
    seed: [
      { ruleName: 'Helmet Margin Guard', category: 'Helmets', brand: 'Axor', minimumMargin: 18, platformFee: 5, gstRate: 18, status: 'active' }
    ]
  }
};
