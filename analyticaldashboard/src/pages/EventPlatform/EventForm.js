import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AppLayout from '../../components/AppLayout/AppLayout';
import LoadingState from '../../components/States/LoadingState';
import { useAuth } from '../../context/AuthContext';
import { createEvent, getEvent, updateEvent, uploadFile } from '../../services/firebaseService';
import './EventPlatform.css';
import '../Auth/Auth.css';
import './EventForm.css';

const initialForm = {
  // Basic Info
  title: '',
  category: '',
  shortDescription: '',
  fullDescription: '',

  // Organizer
  organizerName: '',
  organizerPhone: '',
  organizerEmail: '',
  organizerInstagram: '',

  // Event Date & Time
  eventDate: '',
  registrationDeadline: '',
  assemblyTime: '',
  departureTime: '',
  returnTime: '',

  // Location
  venueName: '',
  venueAddress: '',
  city: '',
  state: '',

  // Ride Details
  difficulty: 'Easy',
  duration: '',
  minimumAge: '',
  minimumExperience: '',

  // Vehicle Requirements
  allowedVehicles: '',
  minimumCC: '',
  helmetRequired: true,
  gearRequired: false,
  dlRequired: true,
  rcRequired: true,
  insuranceRequired: true,
  medicalDeclaration: false,

  // Ticketing
  ticketType: 'Free',
  ticketPrice: '',
  totalSeats: '',

  // Discounts
  earlyBirdDiscount: '',
  groupDiscount: '',
  couponCode: '',

  // Policies
  refundPolicy: '',

  // Safety & Support
  marshals: '',
  firstAid: true,
  recoveryVehicle: false,
  mechanicAvailable: false,
  emergencyContact: '',

  // Media
  bannerImage: '',
  thumbnailImage: '',
  galleryImages: [],

  // SEO & Filters
  customTags: [],
  featured: false,

  // Status
  status: 'Draft',

  // Category Specific Object
  categoryDetails: {}
};

const categoryFields = {
  "Night Rides": [
    "startingPoint",
    "destination",
    "distance",
    "difficulty",
    "minimumAge",
    "minimumExperience"
  ],

  "Day Rides": [
    "startingPoint",
    "destination",
    "distance",
    "difficulty"
  ],

  "Charity Rides": [
    "ngoName",
    "donationPercentage"
  ],

  "Skill Clinics": [
    "coachName",
    "batchSize",
    "minimumExperience"
  ],

  "Races & Stunt Shows": [
    "raceType",
    "prizePool"
  ],

  "International Rides": [
    "passportRequired",
    "visaRequired"
  ],

  "Morning Breakfast Rides": [
    "breakfastIncluded",
    "cafeName"
  ],

  "Monsoon Rides": [
    "weatherPolicy",
    "rainGearRequired"
  ]
};

const EventForm = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [bannerFile, setBannerFile] = useState(null);
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [loading, setLoading] = useState(Boolean(eventId));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);

  const [currentStep, setCurrentStep] = useState(0);
  const steps = [
    "Basic",
    "Location",
    "Organizer",
    "Requirements",
    "Safety",
    "Ticketing",
    "Category",
    "Review"
  ];
  const progressWidth =
    ((currentStep + 1) / steps.length) * 100;

  useEffect(() => {
    if (!eventId) return;
    getEvent(eventId)
      .then((event) => setForm({ ...initialForm, ...event }))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [eventId]);

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const bannerImage = bannerFile
        ? await uploadFile(bannerFile, `events/${user.uid}/banners`, setProgress)
        : form.bannerImage;
      const uploadedGallery = await Promise.all(
        galleryFiles.map((file) => uploadFile(file, `events/${user.uid}/gallery`, setProgress))
      );
      const payload = {
        ...form,
        hostId: user.uid,
        hostName: profile?.fullName || '',
        hostPhotoURL: profile?.photoURL || '',
        bannerImage,
        galleryImages: [...(form.galleryImages || []), ...uploadedGallery].filter(Boolean),
        capacity: Number(form.capacity || 0),
        ticketPrice: form.ticketType === 'Free' ? 0 : Number(form.ticketPrice || 0),
      };

      if (eventId) {
        await updateEvent(eventId, payload);
        navigate(`/events/${eventId}`);
      } else {
        const createdId = await createEvent(payload);
        navigate(`/events/${createdId}`);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <AppLayout><LoadingState label="Loading event" /></AppLayout>;

  return (
    <AppLayout>
      <main className="page-shell">

        <div className="page-heading">
          <div>
            <h1>{eventId ? 'Edit Event' : 'Add Event'}</h1>
            <p>Create a publishable event with registration, ticketing, and participant capacity controls.</p>
          </div>
        </div>
        <div className="progress-wrapper">
          <div
            className="progress-fill"
            style={{ width: `${progressWidth}%` }}
          />
        </div>
        {error && <div className="alert error">{error}</div>}
        <form className="event-form" onSubmit={submit}>
          {currentStep === 0 && (
            <section className="form-section">
              <h2>Basic Information</h2>
              <label className="form-field"><span>Event Name</span><input required value={form.title} onChange={(e) => update('title', e.target.value)} /></label>
              <div className="form-grid two">
                <label className="form-field"><span>Status</span><select value={form.status} onChange={(e) => update('status', e.target.value)}><option>Draft</option><option>Published</option><option>Completed</option><option>Cancelled</option></select></label>

                <label className='form-field'>
                  <span>Event Category</span>
                  <select
                    required
                    value={form.category}
                    onChange={(e) => update('category', e.target.value)}
                  >
                    <option value="">Select Category</option>
                    <option>Night Rides</option>
                    <option>Day Rides</option>
                    <option>Group Rides / Adventure Tour</option>
                    <option>Workshops</option>
                    <option>Mountain Biking</option>
                    <option>Gravel / Offroad Rides</option>
                    <option>Charity Rides</option>
                    <option>Skill Clinics</option>
                    <option>Bike Festivals</option>
                    <option>Meetups</option>
                    <option>Races & Stunt Shows</option>
                    <option>Expeditions</option>
                    <option>International Rides</option>
                    <option>Monsoon Rides</option>
                    <option>Morning Breakfast Rides</option>
                  </select>
                </label>
              </div>
              <label className="form-field"><span>Event Description</span><textarea required value={form.description} onChange={(e) => update('description', e.target.value)} /></label>
              <div className="form-grid two">
                <label className="form-field"><span>Event Banner</span><input type="file" accept="image/*" onChange={(e) => setBannerFile(e.target.files[0])} /></label>
                <label className="form-field"><span>Gallery Images</span><input type="file" accept="image/*" multiple onChange={(e) => setGalleryFiles(Array.from(e.target.files))} /></label>
              </div>
            </section>
          )}

          {currentStep === 1 && (
            <aside className="form-section">
              <h2>Publishing</h2>
              <label className="form-field"><span>Free/Paid</span><select value={form.ticketType} onChange={(e) => update('ticketType', e.target.value)}><option>Free</option><option>Paid</option></select></label>
              <label className="form-field"><span>Ticket Price</span><input type="number" min="0" value={form.ticketPrice} disabled={form.ticketType === 'Free'} onChange={(e) => update('ticketPrice', e.target.value)} /></label>
              <label className="form-field"><span>Maximum Participants</span><input type="number" min="1" required value={form.capacity} onChange={(e) => update('capacity', e.target.value)} /></label>
              {progress > 0 && <p className="muted">Upload progress: {progress}%</p>}
              <button className="primary-btn" disabled={saving} type="submit">{saving ? 'Saving...' : 'Save Event'}</button>
            </aside>
          )}

          {currentStep === 2 && (
            <section>
              {form.category && (
                <section className="form-section">
                  <h2>Category Specific Details</h2>

                  {categoryFields[form.category]?.includes("startingPoint") && (
                    <label className="form-field">
                      <span>Starting Point</span>
                      <input
                        value={form.startingPoint}
                        onChange={(e) => update("startingPoint", e.target.value)}
                      />
                    </label>
                  )}

                  {categoryFields[form.category]?.includes("destination") && (
                    <label className="form-field">
                      <span>Destination</span>
                      <input
                        value={form.destination}
                        onChange={(e) => update("destination", e.target.value)}
                      />
                    </label>
                  )}

                  {categoryFields[form.category]?.includes("distance") && (
                    <label className="form-field">
                      <span>Distance (KM)</span>
                      <input
                        type="number"
                        value={form.distance}
                        onChange={(e) => update("distance", e.target.value)}
                      />
                    </label>
                  )}

                  {categoryFields[form.category]?.includes("ngoName") && (
                    <label className="form-field">
                      <span>NGO Name</span>
                      <input
                        value={form.ngoName}
                        onChange={(e) => update("ngoName", e.target.value)}
                      />
                    </label>
                  )}

                  {categoryFields[form.category]?.includes("coachName") && (
                    <label className="form-field">
                      <span>Coach Name</span>
                      <input
                        value={form.coachName}
                        onChange={(e) => update("coachName", e.target.value)}
                      />
                    </label>
                  )}

                  {categoryFields[form.category]?.includes("prizePool") && (
                    <label className="form-field">
                      <span>Prize Pool</span>
                      <input
                        value={form.prizePool}
                        onChange={(e) => update("prizePool", e.target.value)}
                      />
                    </label>
                  )}

                  {categoryFields[form.category]?.includes("passportRequired") && (
                    <label className="form-field">
                      <span>Passport Required</span>
                      <select
                        value={form.passportRequired}
                        onChange={(e) =>
                          update("passportRequired", e.target.value)
                        }
                      >
                        <option>Yes</option>
                        <option>No</option>
                      </select>
                    </label>
                  )}

                  {categoryFields[form.category]?.includes("breakfastIncluded") && (
                    <label className="form-field">
                      <span>Breakfast Included</span>
                      <select
                        value={form.breakfastIncluded}
                        onChange={(e) =>
                          update("breakfastIncluded", e.target.value)
                        }
                      >
                        <option>Yes</option>
                        <option>No</option>
                      </select>
                    </label>
                  )}

                  {categoryFields[form.category]?.includes("weatherPolicy") && (
                    <label className="form-field">
                      <span>Weather Policy</span>
                      <textarea
                        value={form.weatherPolicy}
                        onChange={(e) =>
                          update("weatherPolicy", e.target.value)
                        }
                      />
                    </label>
                  )}
                </section>
              )}
            </section>
          )}

          {currentStep === 3 && (
            <section className="form-section">
              <h2>Date & Location</h2>
              <div className="form-grid two">
                <label className="form-field"><span>Event Date</span><input type="date" required value={form.startDate} onChange={(e) => update('startDate', e.target.value)} /></label>
                <label className="form-field"><span>End Date</span><input type="date" value={form.endDate} onChange={(e) => update('endDate', e.target.value)} /></label>
                <label className="form-field"><span>Start Time</span><input type="time" required value={form.startTime} onChange={(e) => update('startTime', e.target.value)} /></label>
                <label className="form-field"><span>End Time</span><input type="time" required value={form.endTime} onChange={(e) => update('endTime', e.target.value)} /></label>
              </div>
              <label className="form-field"><span>Venue Name</span><input required value={form.venue} onChange={(e) => update('venue', e.target.value)} /></label>
              <label className="form-field"><span>Address</span><input required value={form.address} onChange={(e) => update('address', e.target.value)} /></label>
              <div className="form-grid two">
                <label className="form-field"><span>City</span><input required value={form.city} onChange={(e) => update('city', e.target.value)} /></label>
                <label className="form-field"><span>State</span><input required value={form.state} onChange={(e) => update('state', e.target.value)} /></label>
              </div>
            </section>
          )}

          {currentStep === 4 && (
            <section className="form-section">
              <h2>Registration & Rules</h2>
              <div className="form-grid two">
                <label className="form-field"><span>Registration Start Date</span><input type="date" required value={form.registrationStart} onChange={(e) => update('registrationStart', e.target.value)} /></label>
                <label className="form-field"><span>Registration End Date</span><input type="date" required value={form.registrationEnd} onChange={(e) => update('registrationEnd', e.target.value)} /></label>
              </div>
              <label className="form-field"><span>Event Rules</span><textarea value={form.rules} onChange={(e) => update('rules', e.target.value)} /></label>
              <label className="form-field"><span>Contact Information</span><textarea required value={form.contactInfo} onChange={(e) => update('contactInfo', e.target.value)} /></label>
            </section>
          )}

          {currentStep === 5 && (
            <section className="form-section">
              <h2>Organizer Information</h2>

              <div className="form-grid two">
                <label className="form-field">
                  <span>Organizer Name</span>
                  <input
                    value={form.organizerName || ''}
                    onChange={(e) => update('organizerName', e.target.value)}
                  />
                </label>

                <label className="form-field">
                  <span>Organizer Phone</span>
                  <input
                    value={form.organizerPhone || ''}
                    onChange={(e) => update('organizerPhone', e.target.value)}
                  />
                </label>

                <label className="form-field">
                  <span>Organizer Email</span>
                  <input
                    type="email"
                    value={form.organizerEmail || ''}
                    onChange={(e) => update('organizerEmail', e.target.value)}
                  />
                </label>

                <label className="form-field">
                  <span>Instagram Handle</span>
                  <input
                    value={form.organizerInstagram || ''}
                    onChange={(e) => update('organizerInstagram', e.target.value)}
                  />
                </label>
              </div>
            </section>
          )}

          {currentStep === 6 && (
            <section className="form-section">
              <h2>Ride Requirements</h2>

              <div className="form-grid two">
                <label className="form-field">
                  <span>Difficulty</span>
                  <select
                    value={form.difficulty || 'Easy'}
                    onChange={(e) => update('difficulty', e.target.value)}
                  >
                    <option>Easy</option>
                    <option>Moderate</option>
                    <option>Hard</option>
                    <option>Expert</option>
                  </select>
                </label>

                <label className="form-field">
                  <span>Duration</span>
                  <input
                    value={form.duration || ''}
                    onChange={(e) => update('duration', e.target.value)}
                  />
                </label>

                <label className="form-field">
                  <span>Minimum Age</span>
                  <input
                    type="number"
                    value={form.minimumAge || ''}
                    onChange={(e) => update('minimumAge', e.target.value)}
                  />
                </label>

                <label className="form-field">
                  <span>Minimum Experience</span>
                  <input
                    value={form.minimumExperience || ''}
                    onChange={(e) => update('minimumExperience', e.target.value)}
                  />
                </label>

                <label className="form-field">
                  <span>Allowed Vehicles</span>
                  <input
                    placeholder="All Bikes, Adventure Bikes, Scooters"
                    value={form.allowedVehicles || ''}
                    onChange={(e) => update('allowedVehicles', e.target.value)}
                  />
                </label>

                <label className="form-field">
                  <span>Minimum CC</span>
                  <input
                    type="number"
                    value={form.minimumCC || ''}
                    onChange={(e) => update('minimumCC', e.target.value)}
                  />
                </label>
              </div>

              <div className="form-grid two">
                <label className="form-checkbox">
                  <input
                    type="checkbox"
                    checked={form.helmetRequired || false}
                    onChange={(e) => update('helmetRequired', e.target.checked)}
                  />
                  Helmet Required
                </label>

                <label className="form-checkbox">
                  <input
                    type="checkbox"
                    checked={form.gearRequired || false}
                    onChange={(e) => update('gearRequired', e.target.checked)}
                  />
                  Riding Gear Required
                </label>

                <label className="form-checkbox">
                  <input
                    type="checkbox"
                    checked={form.dlRequired || false}
                    onChange={(e) => update('dlRequired', e.target.checked)}
                  />
                  Driving License Required
                </label>

                <label className="form-checkbox">
                  <input
                    type="checkbox"
                    checked={form.rcRequired || false}
                    onChange={(e) => update('rcRequired', e.target.checked)}
                  />
                  RC Required
                </label>

                <label className="form-checkbox">
                  <input
                    type="checkbox"
                    checked={form.insuranceRequired || false}
                    onChange={(e) => update('insuranceRequired', e.target.checked)}
                  />
                  Insurance Required
                </label>

                <label className="form-checkbox">
                  <input
                    type="checkbox"
                    checked={form.medicalDeclaration || false}
                    onChange={(e) => update('medicalDeclaration', e.target.checked)}
                  />
                  Medical Declaration Required
                </label>
              </div>
            </section>

          )}

          {currentStep === 7 && (
            <section className="form-section">
              <h2>Safety & Support</h2>

              <div className="form-grid two">
                <label className="form-field">
                  <span>Marshals Count</span>
                  <input
                    type="number"
                    value={form.marshals || ''}
                    onChange={(e) => update('marshals', e.target.value)}
                  />
                </label>

                <label className="form-field">
                  <span>Emergency Contact</span>
                  <input
                    value={form.emergencyContact || ''}
                    onChange={(e) => update('emergencyContact', e.target.value)}
                  />
                </label>
              </div>

              <div className="form-grid two">
                <label className="form-checkbox">
                  <input
                    type="checkbox"
                    checked={form.firstAid || false}
                    onChange={(e) => update('firstAid', e.target.checked)}
                  />
                  First Aid Available
                </label>

                <label className="form-checkbox">
                  <input
                    type="checkbox"
                    checked={form.recoveryVehicle || false}
                    onChange={(e) => update('recoveryVehicle', e.target.checked)}
                  />
                  Recovery Vehicle Available
                </label>

                <label className="form-checkbox">
                  <input
                    type="checkbox"
                    checked={form.mechanicAvailable || false}
                    onChange={(e) => update('mechanicAvailable', e.target.checked)}
                  />
                  Mechanic Available
                </label>
              </div>
            </section>
          )}
        </form>

        <div className="step-actions">
          {currentStep > 0 && (
            <button
              type="button"
              className="prev-btn"
              onClick={() => setCurrentStep(currentStep - 1)}
            >
              Previous
            </button>
          )}

          {currentStep < steps.length - 1 ? (
            <button
              type="button"
              className="next-btn"
              onClick={() => setCurrentStep(currentStep + 1)}
            >
              Next
            </button>
          ) : (
            <button
              // type="submit"
              onClick={()=>console.log(initialForm)}
              className="submit-btn"
            >
              Save Event
            </button>
          )}
        </div>
      </main>
    </AppLayout>
  );
};

export default EventForm;
