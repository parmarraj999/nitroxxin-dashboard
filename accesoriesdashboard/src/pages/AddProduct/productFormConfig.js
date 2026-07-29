export const categoryCatalog = {
  Helmets: {
    subcategories: ['Full Face', 'Modular', 'Open Face', 'Half Face', 'Adventure', 'Motocross', 'Dual Sport', 'Kids'],
    productTypes: ['Helmet', 'Bluetooth Helmet', 'Carbon Helmet'],
    required: ['helmetType', 'certification', 'shellMaterial', 'visorType'],
    attributes: [
      { key: 'helmetType', label: 'Helmet Type', type: 'select', options: ['Full Face', 'Modular', 'Open Face', 'Half Face', 'Adventure', 'Motocross', 'Dual Sport', 'Kids'] },
      { key: 'shellMaterial', label: 'Shell Material', type: 'select', options: ['ABS', 'Polycarbonate', 'Fiberglass', 'Carbon Fiber'] },
      { key: 'shellSize', label: 'Shell Size', type: 'text' },
      { key: 'certification', label: 'Certification', type: 'multi', options: ['ISI', 'DOT', 'ECE 22.05', 'ECE 22.06', 'SNELL'] },
      { key: 'visorType', label: 'Visor Type', type: 'select', options: ['Clear', 'Smoke', 'Iridium'] },
      { key: 'pinlockReady', label: 'Pinlock Ready', type: 'boolean' },
      { key: 'sunVisor', label: 'Sun Visor', type: 'boolean' },
      { key: 'quickReleaseVisor', label: 'Quick Release Visor', type: 'boolean' },
      { key: 'ventilationCount', label: 'Ventilation Count', type: 'number' },
      { key: 'removableInterior', label: 'Removable Interior', type: 'boolean' },
      { key: 'bluetoothReady', label: 'Bluetooth Ready', type: 'boolean' },
      { key: 'ridingStyle', label: 'Suitable Riding Style', type: 'multi', options: ['City', 'Touring', 'Adventure', 'Racing', 'Off Road'] }
    ]
  },
  'Riding Jackets': {
    subcategories: ['Mesh', 'Leather', 'Adventure', 'Winter', 'Summer', 'Touring', 'Urban'],
    productTypes: ['Jacket', 'Armoured Jacket', 'Rain Jacket'],
    required: ['material', 'season', 'ceArmour'],
    attributes: [
      { key: 'material', label: 'Material', type: 'select', options: ['Mesh', 'Leather', 'Textile', 'Cordura', 'Kevlar'] },
      { key: 'season', label: 'Season', type: 'select', options: ['Summer', 'Winter', 'All Weather'] },
      { key: 'waterproof', label: 'Waterproof', type: 'boolean' },
      { key: 'thermalLiner', label: 'Thermal Liner', type: 'boolean' },
      { key: 'removableLiner', label: 'Removable Liner', type: 'boolean' },
      { key: 'ceArmour', label: 'CE Armour', type: 'multi', options: ['Shoulder', 'Elbow', 'Back', 'Chest', 'Level 1', 'Level 2'] },
      { key: 'reflectivePanels', label: 'Reflective Panels', type: 'boolean' },
      { key: 'pocketCount', label: 'Pocket Count', type: 'number' },
      { key: 'hydrationSupport', label: 'Hydration Support', type: 'boolean' },
      { key: 'pantConnector', label: 'Pant Connector', type: 'boolean' }
    ]
  },
  'Riding Gloves': {
    subcategories: ['Leather', 'Mesh', 'Textile', 'Waterproof', 'Track', 'Touring'],
    productTypes: ['Gloves', 'Gauntlet Gloves', 'Short Cuff Gloves'],
    required: ['material', 'knuckleProtection'],
    attributes: [
      { key: 'material', label: 'Material', type: 'select', options: ['Leather', 'Mesh', 'Textile'] },
      { key: 'knuckleProtection', label: 'Knuckle Protection', type: 'boolean' },
      { key: 'palmSlider', label: 'Palm Slider', type: 'boolean' },
      { key: 'touchscreenSupport', label: 'Touchscreen Support', type: 'boolean' },
      { key: 'waterproof', label: 'Waterproof', type: 'boolean' },
      { key: 'thermal', label: 'Thermal', type: 'boolean' },
      { key: 'ceCertified', label: 'CE Certified', type: 'boolean' },
      { key: 'grip', label: 'Grip', type: 'text' }
    ]
  },
  'Riding Boots': {
    subcategories: ['Adventure', 'Touring', 'Urban', 'Track', 'Waterproof'],
    productTypes: ['Boots', 'Riding Shoes', 'Track Boots'],
    required: ['material', 'height', 'ankleProtection'],
    attributes: [
      { key: 'material', label: 'Material', type: 'text' },
      { key: 'height', label: 'Height', type: 'select', options: ['Low', 'Mid', 'High'] },
      { key: 'toeProtection', label: 'Toe Protection', type: 'boolean' },
      { key: 'heelProtection', label: 'Heel Protection', type: 'boolean' },
      { key: 'ankleProtection', label: 'Ankle Protection', type: 'boolean' },
      { key: 'waterproof', label: 'Waterproof', type: 'boolean' },
      { key: 'antiSlip', label: 'Anti Slip', type: 'boolean' },
      { key: 'closureType', label: 'Closure Type', type: 'text' }
    ]
  },
  'Engine Oil': {
    subcategories: ['Synthetic', 'Semi Synthetic', 'Mineral'],
    productTypes: ['Engine Oil', 'Brake Oil', 'Coolant'],
    required: ['viscosity', 'grade', 'volume'],
    attributes: [
      { key: 'viscosity', label: 'Viscosity', type: 'text' },
      { key: 'grade', label: 'Grade', type: 'select', options: ['Synthetic', 'Semi Synthetic', 'Mineral'] },
      { key: 'apiRating', label: 'API Rating', type: 'text' },
      { key: 'jasoRating', label: 'JASO Rating', type: 'text' },
      { key: 'volume', label: 'Volume', type: 'text' },
      { key: 'suitableEngine', label: 'Suitable Engine', type: 'text' },
      { key: 'changeInterval', label: 'Change Interval', type: 'text' }
    ]
  },
  Tyres: {
    subcategories: ['Front', 'Rear', 'Tubeless', 'Tube Type', 'Off Road', 'Track'],
    productTypes: ['Tyre', 'Tube', 'Alloy'],
    required: ['tyreWidth', 'profile', 'rimSize'],
    attributes: [
      { key: 'tyreWidth', label: 'Tyre Width', type: 'number' },
      { key: 'profile', label: 'Profile', type: 'number' },
      { key: 'rimSize', label: 'Rim Size', type: 'number' },
      { key: 'construction', label: 'Construction', type: 'select', options: ['Tube Type', 'Tubeless'] },
      { key: 'position', label: 'Position', type: 'select', options: ['Front', 'Rear', 'Both'] },
      { key: 'loadRating', label: 'Load Rating', type: 'text' },
      { key: 'speedRating', label: 'Speed Rating', type: 'text' },
      { key: 'wetGrip', label: 'Wet Grip', type: 'text' },
      { key: 'terrain', label: 'Terrain', type: 'multi', options: ['Off Road', 'On Road', 'Track'] }
    ]
  },
  Exhaust: {
    subcategories: ['Slip On', 'Full System', 'Carbon', 'Titanium'],
    productTypes: ['Exhaust', 'Header Pipe', 'DB Killer'],
    required: ['material', 'systemType', 'compatibleBikes'],
    attributes: [
      { key: 'material', label: 'Material', type: 'select', options: ['Stainless Steel', 'Titanium', 'Carbon'] },
      { key: 'systemType', label: 'System Type', type: 'select', options: ['Slip On', 'Full System'] },
      { key: 'soundLevel', label: 'Sound Level', type: 'text' },
      { key: 'dbKiller', label: 'DB Killer', type: 'boolean' },
      { key: 'ecuRequired', label: 'ECU Required', type: 'boolean' },
      { key: 'weightSaving', label: 'Weight Saving', type: 'text' },
      { key: 'compatibleBikes', label: 'Compatible Bikes', type: 'text' }
    ]
  },
  Intercom: {
    subcategories: ['Bluetooth', 'Mesh Intercom', 'Helmet Speakers'],
    productTypes: ['Intercom', 'Bluetooth Kit'],
    required: ['bluetoothVersion', 'talkTime', 'range'],
    attributes: [
      { key: 'bluetoothVersion', label: 'Bluetooth Version', type: 'text' },
      { key: 'batteryCapacity', label: 'Battery Capacity', type: 'text' },
      { key: 'chargingTime', label: 'Charging Time', type: 'text' },
      { key: 'talkTime', label: 'Talk Time', type: 'text' },
      { key: 'standbyTime', label: 'Standby Time', type: 'text' },
      { key: 'range', label: 'Range', type: 'text' },
      { key: 'numberOfRiders', label: 'Number of Riders', type: 'number' },
      { key: 'musicSharing', label: 'Music Sharing', type: 'boolean' },
      { key: 'voiceCommand', label: 'Voice Command', type: 'boolean' },
      { key: 'waterproofRating', label: 'Waterproof Rating', type: 'text' }
    ]
  },
  Luggage: {
    subcategories: ['Tank Bags', 'Tail Bags', 'Saddle Bags', 'Top Boxes'],
    productTypes: ['Soft Luggage', 'Hard Luggage', 'Mounting Plate'],
    required: ['capacity', 'material', 'mountType'],
    attributes: [
      { key: 'capacity', label: 'Capacity', type: 'text' },
      { key: 'material', label: 'Material', type: 'text' },
      { key: 'expandable', label: 'Expandable', type: 'boolean' },
      { key: 'waterproof', label: 'Waterproof', type: 'boolean' },
      { key: 'mountType', label: 'Mount Type', type: 'text' },
      { key: 'reflective', label: 'Reflective', type: 'boolean' },
      { key: 'rainCover', label: 'Rain Cover', type: 'boolean' },
      { key: 'laptopCompatible', label: 'Laptop Compatible', type: 'boolean' }
    ]
  },
  Tools: {
    subcategories: ['Tool Kits', 'Sockets', 'Portable Pumps', 'Repair Kits'],
    productTypes: ['Tool', 'Kit'],
    required: ['toolType', 'material'],
    attributes: [
      { key: 'toolType', label: 'Tool Type', type: 'text' },
      { key: 'material', label: 'Material', type: 'text' },
      { key: 'socketSize', label: 'Socket Size', type: 'text' },
      { key: 'portable', label: 'Portable', type: 'boolean' },
      { key: 'warranty', label: 'Warranty', type: 'text' }
    ]
  },
  Camping: {
    subcategories: ['Tents', 'Sleeping Bags', 'Camping Chairs', 'Cooking Gear'],
    productTypes: ['Camping Gear', 'Tent', 'Sleep System'],
    required: ['material', 'weight'],
    attributes: [
      { key: 'tentCapacity', label: 'Tent Capacity', type: 'number' },
      { key: 'sleepingCapacity', label: 'Sleeping Capacity', type: 'number' },
      { key: 'weight', label: 'Weight', type: 'text' },
      { key: 'waterproofRating', label: 'Waterproof Rating', type: 'text' },
      { key: 'seasonRating', label: 'Season Rating', type: 'text' },
      { key: 'material', label: 'Material', type: 'text' }
    ]
  }
};

export const brands = ['Nitroxx Precision Gear', 'Axor', 'SMK', 'MT', 'LS2', 'Steelbird', 'Royal Enfield', 'Rynox', 'Raida', 'Viaterra', 'Motul', 'Liqui Moly', 'Castrol', 'Shell', 'NGK', 'Brembo'];

export const bikeBrands = ['Universal', 'Royal Enfield', 'KTM', 'Bajaj', 'TVS', 'Yamaha', 'Honda', 'Hero', 'Suzuki', 'BMW Motorrad', 'Triumph', 'Kawasaki'];

export const variantTemplates = {
  apparel: ['Size', 'Color', 'Material'],
  fitment: ['Model', 'Version', 'Finish'],
  consumable: ['Capacity', 'Bundle', 'Version'],
  default: ['Size', 'Color', 'Material', 'Finish']
};

export const getVariantTemplate = (category) => {
  if (['Riding Jackets', 'Riding Gloves', 'Riding Boots', 'Helmets'].includes(category)) return variantTemplates.apparel;
  if (['Engine Oil', 'Intercom', 'Tools', 'Camping'].includes(category)) return variantTemplates.consumable;
  if (['Tyres', 'Exhaust', 'Luggage'].includes(category)) return variantTemplates.fitment;
  return variantTemplates.default;
};
