import { collection, doc, writeBatch, Timestamp, getDocs, query, where, limit } from 'firebase/firestore';
import { db } from '../firebase/firebase.config';
import { COLLECTIONS, ORDER_STATUSES, PRODUCT_STATUSES } from '../schemas/firestoreSchema';
import { getVendorId, cleanObject, withVendor } from './firebaseUtils';

export const isDatabaseSeeded = async (vendorId = getVendorId()) => {
  const q = query(
    collection(db, COLLECTIONS.products),
    where('vendorId', '==', vendorId),
    limit(1)
  );
  const snapshot = await getDocs(q);
  return !snapshot.empty;
};

export const seedMockData = async (vendorId = getVendorId()) => {
  const batch = writeBatch(db);

  // 1. Create Mock Products and Inventory
  const productTemplates = [
    {
      id: 'apex-helmet',
      title: 'Apex Carbon Pro Helmet',
      brand: 'Nitroxx Precision Gear',
      category: 'Helmet',
      subCategory: 'Full Face',
      sku: 'NX-HELM-001',
      shortDescription: ' Wind tunnel tested 3K carbon fiber racing helmet.',
      fullDescription: 'The Apex Carbon Pro is the pinnacle of racing helmets. Engineered in the wind tunnel and tested on the track, it offers unmatched aerodynamics, ventilation, and safety in a stunning 3K carbon shell. Certified for global race tracks.',
      weight: '1350g',
      dimensions: { length: '30', width: '25', height: '26', unit: 'cm' },
      safety: { BIS: false, DOT: true, ECE: true, CELevel1: false, CELevel2: false },
      pricing: { mrp: 299.99, sellingPrice: 299.99, discountPercent: 0, gstRate: 18 },
      inventory: { stockQuantity: 124, lowStockThreshold: 10 },
      shipping: { dispatchTime: '1 business day', shippingOrigin: 'Warehouse A', codAvailable: true, returnPolicy: '30-day hassle-free returns' },
      attributes: { certification: 'ECE 22.06 & DOT', supportedAttributes: ['visorType', 'ventilation'] },
      media: { primaryImage: 'https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?auto=format&fit=crop&w=600&q=80', galleryImages: [] },
      status: PRODUCT_STATUSES.published,
      averageRating: 4.9,
      reviewCount: 54,
      salesCount: 245,
      revenue: 122500
    },
    {
      id: 'vantage-jacket',
      title: 'Vantage Leather Armor Jacket',
      brand: 'Nitroxx Precision Gear',
      category: 'Jacket',
      subCategory: 'Racing',
      sku: 'NX-JACK-042',
      shortDescription: 'Premium full-grain leather racing jacket with CE armored protection.',
      fullDescription: 'Crafted from premium 1.3mm full-grain cowhide, the Vantage Jacket offers supreme abrasion resistance with integrated CE Level 2 armor at shoulders and elbows. Stretch panels provide maximum track ergonomics.',
      weight: '3.2 lbs',
      dimensions: { length: '40', width: '30', height: '15', unit: 'cm' },
      safety: { BIS: false, DOT: false, ECE: false, CELevel1: false, CELevel2: true },
      pricing: { mrp: 349.00, sellingPrice: 349.00, discountPercent: 0, gstRate: 18 },
      inventory: { stockQuantity: 5, lowStockThreshold: 10 }, // Low Stock Alert
      shipping: { dispatchTime: '2 business days', shippingOrigin: 'Warehouse B', codAvailable: true, returnPolicy: '15-day return policy' },
      attributes: { certification: 'CE Level 2 Certified', supportedAttributes: ['armorType', 'waterproof'] },
      media: { primaryImage: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=600&q=80', galleryImages: [] },
      status: PRODUCT_STATUSES.published,
      averageRating: 4.5,
      reviewCount: 12,
      salesCount: 189,
      revenue: 85050
    },
    {
      id: 'torque-gloves',
      title: 'Torque-S Racing Gloves',
      brand: 'Nitroxx Precision Gear',
      category: 'Gloves',
      subCategory: 'Track',
      sku: 'NX-GLOV-089',
      shortDescription: 'Full gauntlet leather racing gloves with carbon knuckle protection.',
      fullDescription: 'Ultimate hand protection. Features goat leather chassis, carbon fiber knuckle sliders, TPU finger protectors, and Kevlar lining for maximum safety under high speed conditions.',
      weight: '12 oz',
      dimensions: { length: '25', width: '12', height: '5', unit: 'cm' },
      safety: { BIS: false, DOT: false, ECE: false, CELevel1: true, CELevel2: false },
      pricing: { mrp: 89.50, sellingPrice: 89.50, discountPercent: 0, gstRate: 18 },
      inventory: { stockQuantity: 342, lowStockThreshold: 15 },
      shipping: { dispatchTime: '1 business day', shippingOrigin: 'Warehouse A', codAvailable: true, returnPolicy: '30-day hassle-free returns' },
      attributes: { certification: 'CE Level 1 approved', supportedAttributes: ['knuckleProtection', 'touchscreenSupport'] },
      media: { primaryImage: 'https://images.unsplash.com/photo-1515775591453-62502ef49aa7?auto=format&fit=crop&w=600&q=80', galleryImages: [] },
      status: PRODUCT_STATUSES.published,
      averageRating: 4.7,
      reviewCount: 24,
      salesCount: 412,
      revenue: 41200
    },
    {
      id: 'visor-tinted',
      title: 'Visor Tinted Anti-Fog',
      brand: 'Nitroxx Precision Gear',
      category: 'Helmet',
      subCategory: 'Accessories',
      sku: 'NX-VISR-012',
      shortDescription: 'Dark smoke anti-scratch, anti-fog racing visor.',
      fullDescription: 'Quick release replacement visor for Apex helmets. Built-in Pinlock pins, dark smoke tint, and premium UV protection coating.',
      weight: '6 oz',
      dimensions: { length: '20', width: '15', height: '10', unit: 'cm' },
      safety: { BIS: false, DOT: true, ECE: true, CELevel1: false, CELevel2: false },
      pricing: { mrp: 30.00, sellingPrice: 30.00, discountPercent: 0, gstRate: 18 },
      inventory: { stockQuantity: 2, lowStockThreshold: 5 }, // Low Stock Alert
      shipping: { dispatchTime: '1 business day', shippingOrigin: 'Warehouse A', codAvailable: true, returnPolicy: '30-day return policy' },
      attributes: { certification: 'DOT Compliant', supportedAttributes: ['visorType'] },
      media: { primaryImage: 'https://images.unsplash.com/photo-1609630875171-b1321377ee65?auto=format&fit=crop&w=600&q=80', galleryImages: [] },
      status: PRODUCT_STATUSES.published,
      averageRating: 4.8,
      reviewCount: 8,
      salesCount: 15,
      revenue: 450
    }
  ];

  productTemplates.forEach((p) => {
    const productRef = doc(db, COLLECTIONS.products, p.id);
    batch.set(productRef, cleanObject(withVendor({
      ...p,
      productId: p.id,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    }, vendorId)));

    const inventoryRef = doc(db, COLLECTIONS.inventory, p.id);
    batch.set(inventoryRef, {
      vendorId,
      productId: p.id,
      stock: p.inventory.stockQuantity,
      reservedStock: 0,
      availableStock: p.inventory.stockQuantity,
      lowStockThreshold: p.inventory.lowStockThreshold,
      warehouseId: p.shipping.shippingOrigin,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
  });

  // 2. Create Historical Mock Orders across months
  const now = new Date();
  const getPastDate = (monthsAgo, daysAgo) => {
    const d = new Date(now);
    d.setMonth(d.getMonth() - monthsAgo);
    d.setDate(d.getDate() - daysAgo);
    return Timestamp.fromDate(d);
  };

  const orderTemplates = [
    {
      id: 'NX-99824',
      createdAt: getPastDate(0, 0), // Today
      customer: { name: 'Marco Rossi', email: 'marco.r@example.com', phone: '+39 333 1234567' },
      items: [
        { productId: 'apex-helmet', name: 'Apex Carbon Pro Helmet', qty: 1, price: 299.99, sku: 'NX-HELM-001', size: 'L', color: 'Matte Black' },
        { productId: 'visor-tinted', name: 'Visor Tinted Anti-Fog', qty: 1, price: 30.00, sku: 'NX-VISR-012', size: 'One Size', color: 'Dark Smoke' }
      ],
      total: 329.99,
      status: 'pending',
      shippingAddress: { line1: 'Via Garibaldi 12', city: 'Milan', state: 'MI', postalCode: '20121', country: 'Italy' }
    },
    {
      id: 'NX-99823',
      createdAt: getPastDate(0, 1), // Yesterday
      customer: { name: 'Elena Kraus', email: 'elena.k@example.com', phone: '+49 172 9876543' },
      items: [
        { productId: 'vantage-jacket', name: 'Vantage Leather Armor Jacket', qty: 1, price: 349.00, sku: 'NX-JACK-042', size: 'M', color: 'Speedway Red' }
      ],
      total: 349.00,
      status: 'packed', // Ready to Ship
      shippingAddress: { line1: 'Schönhauser Allee 45', city: 'Berlin', state: 'BE', postalCode: '10437', country: 'Germany' }
    },
    {
      id: 'NX-99820',
      createdAt: getPastDate(0, 3), // 3 days ago
      customer: { name: 'James Miller', email: 'j.miller@example.com', phone: '+1 202 555 0199' },
      items: [
        { productId: 'torque-gloves', name: 'Torque-S Racing Gloves', qty: 2, price: 89.50, sku: 'NX-GLOV-089', size: 'XL', color: 'Carbon Black' }
      ],
      total: 179.00,
      status: 'shipped', // In Transit
      shippingAddress: { line1: '1600 Amphitheatre Pkwy', city: 'Mountain View', state: 'CA', postalCode: '94043', country: 'USA' }
    },
    {
      id: 'NX-99815',
      createdAt: getPastDate(0, 8), // 8 days ago
      customer: { name: 'Sarah Jenkins', email: 'sarah.j@example.com', phone: '+44 7911 123456' },
      items: [
        { productId: 'apex-helmet', name: 'Apex Carbon Pro Helmet', qty: 1, price: 299.99, sku: 'NX-HELM-001', size: 'S', color: 'White Gloss' }
      ],
      total: 299.99,
      status: 'delivered',
      shippingAddress: { line1: '221B Baker St', city: 'London', state: 'ENG', postalCode: 'NW1 6XE', country: 'UK' }
    },
    {
      id: 'NX-99750',
      createdAt: getPastDate(1, 15), // Last Month
      customer: { name: 'Takashi Sato', email: 't.sato@example.com', phone: '+81 90 1234 5678' },
      items: [
        { productId: 'apex-helmet', name: 'Apex Carbon Pro Helmet', qty: 2, price: 299.99, sku: 'NX-HELM-001' }
      ],
      total: 599.98,
      status: 'delivered',
      shippingAddress: { line1: 'Chiyoda-ku 1-1', city: 'Tokyo', state: 'TK', postalCode: '100-0001', country: 'Japan' }
    },
    {
      id: 'NX-99680',
      createdAt: getPastDate(2, 20), // 2 Months ago
      customer: { name: 'Alice Wong', email: 'alice.w@example.com', phone: '+852 9876 5432' },
      items: [
        { productId: 'vantage-jacket', name: 'Vantage Leather Armor Jacket', qty: 1, price: 349.00, sku: 'NX-JACK-042' }
      ],
      total: 349.00,
      status: 'delivered',
      shippingAddress: { line1: 'Nathan Road 123', city: 'Kowloon', state: 'KLN', postalCode: '999077', country: 'Hong Kong' }
    },
    {
      id: 'NX-99510',
      createdAt: getPastDate(3, 10), // 3 Months ago
      customer: { name: 'Carlos Gomez', email: 'carlos@example.com', phone: '+34 600 123 456' },
      items: [
        { productId: 'torque-gloves', name: 'Torque-S Racing Gloves', qty: 3, price: 89.50, sku: 'NX-GLOV-089' }
      ],
      total: 268.50,
      status: 'delivered',
      shippingAddress: { line1: 'Gran Via 45', city: 'Madrid', state: 'MD', postalCode: '28013', country: 'Spain' }
    },
    {
      id: 'NX-99410',
      createdAt: getPastDate(4, 5), // 4 Months ago
      customer: { name: 'Jean Dupont', email: 'jean.d@example.com', phone: '+33 6 1234 5678' },
      items: [
        { productId: 'apex-helmet', name: 'Apex Carbon Pro Helmet', qty: 1, price: 299.99, sku: 'NX-HELM-001' }
      ],
      total: 299.99,
      status: 'returned',
      shippingAddress: { line1: 'Rue de Rivoli 80', city: 'Paris', state: 'IDF', postalCode: '75001', country: 'France' }
    }
  ];

  orderTemplates.forEach((o) => {
    const orderRef = doc(db, COLLECTIONS.orders, o.id);
    batch.set(orderRef, cleanObject(withVendor({
      ...o,
      customerName: o.customer.name,
      customerEmail: o.customer.email,
      itemCount: o.items.reduce((sum, item) => sum + Number(item.qty || 0), 0),
      totalAmount: o.total,
      updatedAt: o.createdAt
    }, vendorId)));

    o.items.forEach((item) => {
      const itemRef = doc(collection(db, COLLECTIONS.orderItems));
      batch.set(itemRef, cleanObject(withVendor({
        ...item,
        orderId: o.id,
        createdAt: o.createdAt,
        updatedAt: o.createdAt
      }, vendorId)));
    });
  });

  // 3. Create Mock Reviews
  const reviews = [
    {
      productId: 'apex-helmet',
      productName: 'Apex Carbon Pro Helmet',
      reviewerName: 'Marco R.',
      rating: 5,
      comment: 'The Apex Carbon Pro is truly a game changer. Light and fits perfect!',
      createdAt: getPastDate(0, 1),
      reply: 'Thanks Marco! Enjoy the track ride!'
    },
    {
      productId: 'vantage-jacket',
      productName: 'Vantage Leather Armor Jacket',
      reviewerName: 'Elena K.',
      rating: 4,
      comment: 'Leather quality is top notch on the Vantage jacket. A bit snug but safe.',
      createdAt: getPastDate(0, 4)
    },
    {
      productId: 'torque-gloves',
      productName: 'Torque-S Racing Gloves',
      reviewerName: 'Sam W.',
      rating: 5,
      comment: 'Incredible grip. High speed ventilation is amazing.',
      createdAt: getPastDate(0, 10)
    }
  ];

  reviews.forEach((r, idx) => {
    const reviewRef = doc(collection(db, COLLECTIONS.reviews), `rev-${idx}`);
    batch.set(reviewRef, cleanObject(withVendor({
      ...r,
      updatedAt: r.createdAt
    }, vendorId)));
  });

  await batch.commit();
};
