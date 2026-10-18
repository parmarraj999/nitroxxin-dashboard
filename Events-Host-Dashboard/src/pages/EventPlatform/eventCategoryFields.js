const labelFromId = (id) => id
  .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
  .replace(/^./, (letter) => letter.toUpperCase());

const field = (id, type, options = {}) => ({
  id,
  label: labelFromId(id),
  type,
  ...options,
});

export const eventCategoryFields = {
  'Night Rides': [
    field('startPoint', 'text', { label: 'Starting Point', required: true }),
    field('endingPoint', 'text', { label: 'Ending Point', required: true }),
    field('routeDescription', 'textarea', { label: 'Route Description', required: true }),
    field('totalDistance', 'number', { label: 'Total Distance (KM)', unit: 'km', required: true }),
    field('rideDuration', 'text', { label: 'Estimated Ride Duration' }),
    field('terrain', 'select', { label: 'Terrain Type', options: ['City', 'Highway', 'Mixed', 'Ghat'] }),
    field('difficulty', 'select', { options: ['Easy', 'Moderate', 'Hard'] }),
  ],
  'Day Rides': [
    field('startingPoint', 'text'), field('endingPoint', 'text'), field('routeDescription', 'textarea'),
    field('breakfastIncluded', 'boolean'), field('lunchIncluded', 'boolean'),
  ],
  'Group Rides / Adventure Tour': [
    field('numberOfDays', 'number'), field('itinerary', 'array', { label: 'Day Wise Itinerary', itemType: 'object' }),
    field('accommodationIncluded', 'boolean'), field('supportVehicle', 'boolean'), field('mechanicAvailable', 'boolean'),
  ],
  Workshops: [
    field('sessionStart', 'time'), field('sessionEnd', 'time'), field('topicsCovered', 'textarea'),
    field('bringOwnBike', 'boolean'), field('certificateProvided', 'boolean'),
  ],
  'Mountain Biking': [
    field('trailDistance', 'number'), field('elevationGain', 'number'), field('bikeTypeAllowed', 'text'),
    field('waveStarts', 'array'), field('timingChip', 'boolean'),
  ],
  'Gravel / Offroad Rides': [
    field('trailType', 'textarea'),  field('recommendedTyres', 'text'), field('minimumCC', 'number', { label: 'Minimum CC' }), field('totalDistance', 'number', { label: 'Total Distance (KM)', unit: 'km', required: true }), field('waterCrossings', 'boolean'), field('helmet', 'boolean', { required: true }), field('Gear', 'boolean', { required: true }), field('RC AND INSURANCE', 'boolean', { required: true }), field('MEDICAL DECLARATION', 'boolean', { required: true }),
  ],
  'Charity Rides': [
    field('ngoName', 'text', { label: 'NGO Name' }), field('donationPercentage', 'number'),
    field('certificateProvided', 'boolean'), field('cause', 'textarea'), field('startingPoint', 'text', { label: 'Starting Point' }), field('endPoint', 'text', { label: 'End Point' }), field('totalDistance', 'number', { label: 'Total Distance (KM)', unit: 'km', required: true }), field('helmet', 'boolean', { required: true }), field('Gear', 'boolean', { required: true }), field('RC AND INSURANCE', 'boolean', { required: true }), field('Driving Licence', 'boolean', { required: true }),
  ],
  'Skill Clinics': [
    field('coachNames', 'array'), field('theorySessions', 'textarea'), field('practicalSessions', 'textarea'), field('videoAnalysis', 'boolean'),
  ],
  'Bike Festivals': [
    field('festivalZones', 'array'), field('brandStalls', 'number'), field('liveMusic', 'boolean'),
    field('foodCourt', 'boolean'), field('parkingAvailable', 'boolean'),
  ],
  Meetups: [field('freeEntry', 'boolean'), field('rsvpRequired', 'boolean', { label: 'RSVP Required' }), field('meetupTime', 'text')],
  'Races & Stunt Shows': [
    field('raceFormat', 'text'), field('raceClasses', 'array'), field('prizeMoney', 'array'), field('stuntShowTime', 'time'),
  ],
  Expeditions: [
    field('numberOfDays', 'number'), field('dayWisePlan', 'array'), field('maximumAltitude', 'number'),field('totalDistance', 'number'), field('minimumAge', 'number'), field('terrain', 'text', { label: 'Terrain' }),field('allowedVehicle', 'text', { label: 'Allowed Vehicle' }),
    field('permitsRequired', 'boolean'), field('supportVehicles', 'number'), field('mechanic', 'boolean'),  field('FIRST AID', 'boolean'), field('Gear', 'boolean', { required: true }), field('RC AND INSURANCE', 'boolean', { required: true }), field('Driving Licence', 'boolean', { required: true }),
  ],
  'International Rides': [
    field('countriesVisited', 'array'), field('passportRequired', 'boolean'), field('visaRequired', 'boolean'),
    field('internationalInsurance', 'boolean'), field('borderCrossingGuide', 'boolean'),
  ],
  'Monsoon Rides': [field('weatherPolicy', 'textarea'), field('waterproofGearRequired', 'boolean'), field('rainAlert', 'boolean')],
  'Morning Breakfast Rides': [
    field('breakfastVenue', 'text'), field('breakfastIncluded', 'boolean'),
    field('menuChoice', 'select', { options: ['Veg', 'Non Veg', 'Both'] }),
  ],
};

export const eventCategories = Object.keys(eventCategoryFields);
