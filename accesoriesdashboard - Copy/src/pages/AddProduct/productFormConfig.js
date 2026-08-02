export const categoryCatalog = {
  'Rider Wear': {
    subcategories: [
      'Riding Jackets',
      'Riding Pants',
      'Riding Gloves',
      'Rain Gear',
      'Riding Boots',
      'Knee Guards / Body Armor'
    ],
    productTypes: ['Jacket', 'Pants', 'Gloves', 'Rain Gear', 'Boots', 'Body Armor'],
    required: ['material', 'ceArmour'],
    attributes: [
      { key: 'material', label: 'Material', type: 'select', options: ['Mesh', 'Leather', 'Textile', 'Cordura', 'Kevlar'] },
      { key: 'season', label: 'Season', type: 'select', options: ['Summer', 'Winter', 'All Weather'] },
      { key: 'waterproof', label: 'Waterproof', type: 'boolean' },
      { key: 'thermalLiner', label: 'Thermal Liner', type: 'boolean' },
      { key: 'ceArmour', label: 'CE Armour', type: 'multi', options: ['Shoulder', 'Elbow', 'Back', 'Chest', 'Knee', 'Level 1', 'Level 2'] },
      { key: 'reflectivePanels', label: 'Reflective Panels', type: 'boolean' },
      { key: 'pocketCount', label: 'Pocket Count', type: 'number' },
      { key: 'ridingStyle', label: 'Suitable Riding Style', type: 'multi', options: ['City', 'Touring', 'Adventure', 'Racing', 'Off Road'] }
    ]
  },
  'Helmets': {
    subcategories: [
      'Full Face Helmets',
      'Modular Helmets',
      'Open Face Helmets',
      'Helmet Visors'
    ],
    productTypes: ['Helmet', 'Visor', 'Bluetooth Helmet', 'Carbon Helmet'],
    required: ['helmetType', 'certification', 'shellMaterial'],
    attributes: [
      { key: 'helmetType', label: 'Helmet Type', type: 'select', options: ['Full Face', 'Modular', 'Open Face', 'Visor'] },
      { key: 'shellMaterial', label: 'Shell Material', type: 'select', options: ['ABS', 'Polycarbonate', 'Fiberglass', 'Carbon Fiber'] },
      { key: 'certification', label: 'Certification', type: 'multi', options: ['ISI', 'DOT', 'ECE 22.05', 'ECE 22.06', 'SNELL'] },
      { key: 'visorType', label: 'Visor Type', type: 'select', options: ['Clear', 'Smoke', 'Iridium', 'Pinlock'] },
      { key: 'pinlockReady', label: 'Pinlock Ready', type: 'boolean' },
      { key: 'sunVisor', label: 'Sun Visor', type: 'boolean' },
      { key: 'ventilationCount', label: 'Ventilation Count', type: 'number' },
      { key: 'bluetoothReady', label: 'Bluetooth Ready', type: 'boolean' }
    ]
  },
  'Bike Accessories': {
    subcategories: [
      'Crash Guards / Sliders',
      'Phone Mounts',
      'Saddle Bags',
      'Tank Bags',
      'Camping Gear',
      'Hydration Packs',
      'Navigation Aids',
      'Disc Locks & Chains',
      'Reflective Gear',
      'First Aid & Survival Kits'
    ],
    productTypes: ['Guards & Protection', 'Luggage & Storage', 'Touring & Utility', 'Security', 'Safety Gear'],
    required: ['mountType', 'material'],
    attributes: [
      { key: 'material', label: 'Material', type: 'text' },
      { key: 'mountType', label: 'Mounting Type', type: 'text' },
      { key: 'waterproof', label: 'Waterproof', type: 'boolean' },
      { key: 'capacity', label: 'Capacity / Volume', type: 'text' },
      { key: 'compatibility', label: 'Bike Compatibility', type: 'text' }
    ]
  },
  'Bike Customization & Performance': {
    subcategories: [
      'Lighting & LEDs',
      'Exhaust Systems',
      'Air Filters',
      'Performance ECU & Tuners',
      'Brake Pads & Brake Lines',
      'Handlebars & Risers',
      'Foot Pegs',
      'Levers',
      'Windscreens',
      'Radiator Guards',
      'Bash Plates / Skid Plates',
      'Chain & Sprocket Kits',
      'Seats & Cushions',
      'Tyres & Tubes',
      'Battery & Electricals'
    ],
    productTypes: ['Lighting', 'Exhaust', 'Engine & Tuning', 'Braking', 'Controls', 'Protection', 'Drivetrain', 'Seats', 'Tyres', 'Electrical'],
    required: ['material', 'compatibility'],
    attributes: [
      { key: 'material', label: 'Material', type: 'text' },
      { key: 'compatibility', label: 'Compatible Bike Models', type: 'text' },
      { key: 'finish', label: 'Finish', type: 'select', options: ['Matte', 'Gloss', 'Anodized', 'Chrome', 'Raw'] },
      { key: 'warranty', label: 'Warranty Period', type: 'text' }
    ]
  },
  'Tech & Gadgets': {
    subcategories: [
      'Smart Mounts & Chargers',
      'Action Cameras & Mounts',
      'Bluetooth Intercoms'
    ],
    productTypes: ['Electronics', 'Mounts & Chargers', 'Cameras', 'Intercoms'],
    required: ['connectivity', 'waterproof'],
    attributes: [
      { key: 'connectivity', label: 'Connectivity / Type', type: 'text' },
      { key: 'waterproof', label: 'Waterproof', type: 'boolean' },
      { key: 'warranty', label: 'Warranty Period', type: 'text' }
    ]
  }
};

export const subcategoryCatalog = {
  'Riding Jackets': {
    productTypes: ['Jacket', 'Armoured Jacket', 'Rain Jacket'],
    required: ['material', 'season', 'ceArmour'],
    attributes: [
      { key: 'material', label: 'Material', type: 'select', options: ['Mesh', 'Leather', 'Textile', 'Cordura', 'Kevlar'] },
      { key: 'season', label: 'Season', type: 'select', options: ['Summer', 'Winter', 'All Weather'] },
      { key: 'waterproof', label: 'Waterproof', type: 'boolean' },
      { key: 'thermalLiner', label: 'Thermal Liner', type: 'boolean' },
      { key: 'removableLiner', label: 'Removable Liner', type: 'boolean' },
      { key: 'ceArmour', label: 'CE Armour', type: 'multi', options: ['Shoulder', 'Elbow', 'Back', 'Chest', 'Knee', 'Level 1', 'Level 2'] },
      { key: 'reflectivePanels', label: 'Reflective Panels', type: 'boolean' },
      { key: 'pocketCount', label: 'Pocket Count', type: 'number' }
    ]
  },
  'Riding Pants': {
    productTypes: ['Riding Pants', 'Rain Over-Pants', 'Armoured Pants'],
    required: ['material', 'season', 'kneeArmour'],
    attributes: [
      { key: 'material', label: 'Material', type: 'multi', options: ['Mesh', 'Leather', 'Textile', 'Cordura', 'Kevlar', 'Denim', 'Nylon'] },
      { key: 'season', label: 'Season', type: 'select', options: ['Summer', 'Winter', 'All Weather'] },
      { key: 'kneeArmour', label: 'Knee Armour Included', type: 'boolean' },
      { key: 'hipArmour', label: 'Hip Armour Included', type: 'boolean' },
      { key: 'ceArmourLevel', label: 'CE Armour Level', type: 'select', options: ['Level 1', 'Level 2', 'Not Applicable'] },
      { key: 'waterproofLiner', label: 'Waterproof Liner', type: 'boolean' },
      { key: 'pocketCount', label: 'Number of Pockets', type: 'number' }
    ]
  },
  'Riding Gloves': {
    productTypes: ['Gloves', 'Gauntlet Gloves', 'Short Cuff Gloves'],
    required: ['material', 'knuckleProtection'],
    attributes: [
      { key: 'material', label: 'Material', type: 'select', options: ['Leather', 'Mesh', 'Textile'] },
      { key: 'knuckleProtection', label: 'Knuckle Protection', type: 'boolean' },
      { key: 'palmSlider', label: 'Palm Slider', type: 'boolean' },
      { key: 'touchscreenSupport', label: 'Touchscreen Support', type: 'boolean' },
      { key: 'waterproof', label: 'Waterproof', type: 'boolean' }
    ]
  },
  'Riding Boots': {
    productTypes: ['Boots', 'Riding Shoes', 'Track Boots'],
    required: ['material', 'height', 'ankleProtection'],
    attributes: [
      { key: 'material', label: 'Material', type: 'text' },
      { key: 'height', label: 'Height', type: 'select', options: ['Low', 'Mid', 'High'] },
      { key: 'toeProtection', label: 'Toe Protection', type: 'boolean' },
      { key: 'heelProtection', label: 'Heel Protection', type: 'boolean' },
      { key: 'ankleProtection', label: 'Ankle Protection', type: 'boolean' },
      { key: 'waterproof', label: 'Waterproof', type: 'boolean' }
    ]
  },
  'Tyres & Tubes': {
    productTypes: ['Tyre', 'Tube', 'Tubeless Kit'],
    required: ['tyreWidth', 'profile', 'rimSize', 'construction'],
    attributes: [
      { key: 'tyreWidth', label: 'Tyre Width (mm)', type: 'number' },
      { key: 'profile', label: 'Profile (%)', type: 'number' },
      { key: 'rimSize', label: 'Rim Size (inches)', type: 'number' },
      { key: 'construction', label: 'Construction', type: 'select', options: ['Tubeless', 'Tube Type'] },
      { key: 'position', label: 'Position', type: 'select', options: ['Front', 'Rear', 'Set'] },
      { key: 'wetGrip', label: 'Wet Grip Rating', type: 'text' },
      { key: 'terrain', label: 'Terrain', type: 'multi', options: ['Off Road', 'On Road', 'Track'] }
    ]
  },
  'Bluetooth Intercoms': {
    productTypes: ['Intercom', 'Bluetooth Kit', 'Speakers'],
    required: ['bluetoothVersion', 'talkTime', 'range'],
    attributes: [
      { key: 'bluetoothVersion', label: 'Bluetooth Version', type: 'text' },
      { key: 'talkTime', label: 'Talk Time (Hours)', type: 'text' },
      { key: 'range', label: 'Max Range (Meters)', type: 'text' },
      { key: 'numberOfRiders', label: 'Max Connected Riders', type: 'number' },
      { key: 'waterproofRating', label: 'Waterproof Rating', type: 'text' }
    ]
  },
  'Smart Mounts & Chargers': {
    productTypes: ['Mounts', 'Chargers', 'Accessories'],
    required: ['mountType', 'chargingSupport'],
    attributes: [
      { key: 'mountType', label: 'Mounting Location', type: 'select', options: ['Handlebar', 'Mirror Mount', 'Fork Stem', 'Windscreen'] },
      { key: 'chargingSupport', label: 'Charging Support', type: 'select', options: ['Wireless Fast Charging', 'USB Port', 'None'] },
      { key: 'powerOutput', label: 'Power Output', type: 'text' },
      { key: 'waterproof', label: 'Waterproof', type: 'boolean' }
    ]
  },
  'Action Cameras & Mounts': {
    productTypes: ['Action Camera', 'Mount', 'Bundle'],
    required: ['resolution', 'stabilization'],
    attributes: [
      { key: 'resolution', label: 'Max Video Resolution', type: 'select', options: ['5.3K', '4K', '2.7K', '1080p'] },
      { key: 'stabilization', label: 'Image Stabilization', type: 'boolean' },
      { key: 'batteryLife', label: 'Battery Life (Minutes)', type: 'text' },
      { key: 'mountLocation', label: 'Mount Type / Location', type: 'text' }
    ]
  },
  'Seats & Cushions': {
    productTypes: ['Seat', 'Seat Cover', 'Gel Cushion', 'Pillion Pad'],
    required: ['material', 'cushionType'],
    attributes: [
      { key: 'material', label: 'Cover Material', type: 'select', options: ['Leather', 'Rexine', 'Mesh', 'Gel Pad'] },
      { key: 'cushionType', label: 'Cushioning Technology', type: 'select', options: ['Gel', 'Memory Foam', 'Air Cushion', 'Standard Foam'] },
      { key: 'waterproof', label: 'Waterproof Cover', type: 'boolean' }
    ]
  },
  'Battery & Electricals': {
    productTypes: ['Battery', 'Spark Plug', 'Wiring Harness', 'Relay', 'Horn'],
    required: ['voltage', 'capacityAh'],
    attributes: [
      { key: 'voltage', label: 'Voltage', type: 'select', options: ['12V', '6V'] },
      { key: 'capacityAh', label: 'Capacity (Ah)', type: 'text' },
      { key: 'batteryType', label: 'Battery Type', type: 'select', options: ['VRLA', 'Lithium-Ion', 'Lead Acid', 'Gel Battery'] }
    ]
  },
  'Exhaust Systems': {
    productTypes: ['Exhaust', 'Header Pipe', 'DB Killer'],
    required: ['material', 'systemType', 'compatibleBikes'],
    attributes: [
      { key: 'material', label: 'Material', type: 'select', options: ['Stainless Steel', 'Titanium', 'Carbon'] },
      { key: 'systemType', label: 'System Type', type: 'select', options: ['Slip On', 'Full System'] },
      { key: 'soundLevel', label: 'Sound Level', type: 'text' },
      { key: 'dbKiller', label: 'DB Killer', type: 'boolean' },
      { key: 'ecuRequired', label: 'ECU Required', type: 'boolean' },
      { key: 'weightSaving', label: 'Weight Saving', type: 'text' }
    ]
  },
  'Saddle Bags': {
    productTypes: ['Soft Luggage', 'Hard Luggage'],
    required: ['capacity', 'material', 'mountType'],
    attributes: [
      { key: 'capacity', label: 'Capacity', type: 'text' },
      { key: 'material', label: 'Material', type: 'text' },
      { key: 'expandable', label: 'Expandable', type: 'boolean' },
      { key: 'waterproof', label: 'Waterproof', type: 'boolean' },
      { key: 'mountType', label: 'Mount Type', type: 'text' }
    ]
  },
  'Tank Bags': {
    productTypes: ['Soft Luggage', 'Magnetic Tank Bag'],
    required: ['capacity', 'material', 'mountType'],
    attributes: [
      { key: 'capacity', label: 'Capacity', type: 'text' },
      { key: 'material', label: 'Material', type: 'text' },
      { key: 'expandable', label: 'Expandable', type: 'boolean' },
      { key: 'waterproof', label: 'Waterproof', type: 'boolean' },
      { key: 'mountType', label: 'Mount Type', type: 'text' }
    ]
  },
  'Camping Gear': {
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

export const getFormConfig = (category, subCategory) => {
  const catConfig = categoryCatalog[category] || categoryCatalog['Rider Wear'];
  const subConfig = subcategoryCatalog[subCategory];
  if (subConfig) {
    return {
      ...catConfig,
      ...subConfig,
      subcategories: catConfig.subcategories,
      productTypes: subConfig.productTypes || catConfig.productTypes,
    };
  }
  return catConfig;
};

export const brands = ['Nitroxx Precision Gear', 'Axor', 'SMK', 'MT', 'LS2', 'Steelbird', 'Royal Enfield', 'Rynox', 'Raida', 'Viaterra', 'Motul', 'Liqui Moly', 'Castrol', 'Shell', 'NGK', 'Brembo', 'Other'];

export const bikeBrands = ['Universal', 'Royal Enfield', 'KTM', 'Bajaj', 'TVS', 'Yamaha', 'Honda', 'Hero', 'Suzuki', 'BMW Motorrad', 'Triumph', 'Kawasaki'];

export const variantTemplates = {
  apparel: ['Size', 'Color', 'Material'],
  fitment: ['Model', 'Version', 'Finish'],
  consumable: ['Capacity', 'Bundle', 'Version'],
  default: ['Size', 'Color', 'Material', 'Finish']
};

export const getVariantTemplate = (category) => {
  if (['Rider Wear', 'Helmets'].includes(category)) return variantTemplates.apparel;
  if (['Bike Accessories', 'Bike Customization & Performance', 'Tech & Gadgets'].includes(category)) return variantTemplates.fitment;
  return variantTemplates.default;
};
