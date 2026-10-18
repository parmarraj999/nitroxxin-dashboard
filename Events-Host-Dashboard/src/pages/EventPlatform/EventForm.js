import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Image, FileText, Plus, Trash2 } from "lucide-react";
import AppLayout from "../../components/AppLayout/AppLayout";
import LoadingState from "../../components/States/LoadingState";
import { useAuth } from "../../context/AuthContext";
import {
  createEvent,
  getEvent,
  updateEvent,
  uploadFile,
} from "../../services/firebaseService";
import {
  eventCategories as categories,
  eventCategoryFields,
} from "./eventCategoryFields";
import "./EventPlatform.css";
import "./EventForm.css";

const ticketForCategoryMapping = {
  'Night Rides': ["Rider", "Pillion", "Participant", "Custom"],
  'Day Rides': ["Rider", "Pillion", "Participant", "Custom"],
  'Monsoon Rides': ["Rider", "Pillion", "Participant", "Custom"],
  'Morning Breakfast Rides': ["Rider", "Pillion", "Participant", "Custom"],
  'Gravel / Offroad Rides': ["Rider", "Pillion", "Participant", "Custom"],
  'Group Rides / Adventure Tour': ["Rider", "Pillion", "Driver", "Passenger", "Participant", "Camping", "Adventure Activity", "Custom"],
  'Expeditions': ["Rider", "Pillion", "Driver", "Passenger", "Participant", "Camping", "Adventure Activity", "Custom"],
  'International Rides': ["Rider", "Pillion", "Driver", "Passenger", "Participant", "Camping", "Adventure Activity", "Custom"],
  'Workshops': ["Participant", "Student", "Spectator", "Workshop", "Track Session", "Custom"],
  'Skill Clinics': ["Participant", "Student", "Spectator", "Workshop", "Track Session", "Custom"],
  'Mountain Biking': ["Participant", "Spectator", "Team", "Custom"],
  'Charity Rides': ["Rider", "Pillion", "Participant", "Sponsor", "Volunteer", "General Admission", "Custom"],
  'Bike Festivals': ["General Admission", "VIP", "Premium", "Student", "Couple", "Family", "Child", "Senior Citizen", "Volunteer", "Media", "Sponsor", "Exhibitor", "Vendor", "Artist / Performer", "Camping", "Meet & Greet", "Custom"],
  'Meetups': ["General Admission", "Participant", "VIP", "Couple", "Family", "Meet & Greet", "Custom"],
  'Races & Stunt Shows': ["General Admission", "VIP", "Premium", "Spectator", "Participant", "Team", "Media", "Sponsor", "Track Session", "Custom"],
  default: ["General Admission", "Participant", "Custom"]
};

const emptyPackage = () => ({
  id: crypto.randomUUID(),
  name: "",
  price: "",
  discountPrice: "",
  seats: "",
  ticketFor: "",
  shortDescription: "",
  inclusions: "",
  exclusions: "",
});
const emptyCoupon = () => ({
  id: crypto.randomUUID(),
  code: "",
  discountType: "percentage",
  discountValue: "",
  maxUses: "",
  validTill: "",
});
const emptyAddon = () => ({
  id: crypto.randomUUID(),
  name: "",
  description: "",
  price: "",
});
const emptyItineraryItem = () => ({
  id: crypto.randomUUID(),
  title: "",
  type: "text",
  text: "",
  fileUrl: "",
});

const initialForm = {
  title: "",
  category: "",
  subCategory: "",
  description: "",
  status: "Draft",
  startDate: "",
  endDate: "",
  startTime: "",
  endTime: "",
  registrationStart: "",
  registrationEnd: "",
  venue: "",
  address: "",
  city: "",
  state: "",
  organizerName: "",
  organizerPhone: "",
  organizerEmail: "",
  organizerInstagram: "",
  ticketType: "Free",
  ticketPrice: "",
  capacity: "",
  packages: [],
  bannerImage: "",
  thumbnailImage: "",
  routeMap: "",
  galleryImages: [],
  itinerary: [],
  categoryDetails: {},
  termsAndConditions: "",
  coupons: [],
  addons: [],
  tripSupport: [],
  mandatoryRequirements: [],
};

const steps = [
  "Details",
  "Schedule",
  "Media",
  "Itinerary",
  "Pricing",
  "Coupons",
  "Add-ons",
  "Terms & Conditions",
  "Preview",
];
const MB = 1024 * 1024;

const validateImage = async (file, { label, maxMb }) => {
  if (!file.type.match(/^image\/(jpeg|png)$/))
    throw new Error(`${label} must be a JPG or PNG file.`);
  if (file.size > maxMb * MB)
    throw new Error(`${label} must be ${maxMb} MB or smaller.`);
};

const StringListBuilder = ({ items = [], onChange, title, placeholder }) => {
  const [val, setVal] = useState("");
  const add = () => {
    if (val.trim()) {
      onChange([...items, val.trim()]);
      setVal("");
    }
  };
  return (
    <div className="string-list-builder" style={{ marginBottom: "20px" }}>
      <label className="form-field">
        <span>{title}</span>
        <div style={{ display: "flex", gap: "10px" }}>
          <input
            value={val}
            onChange={e => setVal(e.target.value)}
            placeholder={placeholder}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
          />
          <button type="button" className="secondary-btn" onClick={add}>Add</button>
        </div>
      </label>
      {items.length > 0 && (
        <ul style={{ marginTop: "10px", paddingLeft: "20px", color: "var(--text-secondary)" }}>
          {items.map((item, i) => (
            <li key={i} style={{ marginBottom: "5px", display: "flex", justifyContent: "space-between" }}>
              <span>{item}</span>
              <button type="button" style={{ background: "none", border: "none", color: "var(--danger, red)", cursor: "pointer" }} onClick={() => onChange(items.filter((_, idx) => idx !== i))}><Trash2 size={14} /></button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const EventForm = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [files, setFiles] = useState({
    banner: null,
    thumbnail: null,
    routeMap: null,
    gallery: [],
  });
  const [itineraryFiles, setItineraryFiles] = useState({});
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(Boolean(eventId));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!eventId) return;
    getEvent(eventId)
      .then((event) =>
        setForm({
          ...initialForm,
          ...event,
          packages: event.packages || [],
          itinerary: event.itinerary || [],
          coupons: event.coupons || [],
          addons: event.addons || [],
          tripSupport: event.tripSupport || [],
          mandatoryRequirements: event.mandatoryRequirements || [],
        })
      )
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [eventId]);

  const update = (field, value) =>
    setForm((current) => ({ ...current, [field]: value }));
  const updateCategory = (category) =>
    setForm((current) => ({ ...current, category, categoryDetails: {} }));
  const updateCategoryDetail = (field, value) =>
    setForm((current) => ({
      ...current,
      categoryDetails: { ...(current.categoryDetails || {}), [field]: value },
    }));
  const updatePackage = (id, field, value) =>
    update(
      "packages",
      form.packages.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  const updateCoupon = (id, field, value) =>
    update(
      "coupons",
      form.coupons.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  const updateAddon = (id, field, value) =>
    update(
      "addons",
      form.addons.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  const updateItinerary = (id, field, value) =>
    update(
      "itinerary",
      form.itinerary.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );

  const chooseMedia = async (kind, selected) => {
    setError("");
    try {
      if (kind === "banner")
        await validateImage(selected[0], { label: "Event banner", maxMb: 15 });
      if (kind === "thumbnail")
        await validateImage(selected[0], {
          label: "Event thumbnail",
          maxMb: 15,
        });
      if (kind === "routeMap") {
        const file = selected[0];
        if (!file.type.match(/^(image\/(jpeg|png)|application\/pdf)$/))
          throw new Error("Route map must be JPG, PNG, or PDF.");
        if (file.size > 15 * MB)
          throw new Error("Route map must be 15 MB or smaller.");
      }
      if (kind === "gallery") {
        if (selected.length > 6)
          throw new Error("Select no more than 6 gallery images.");
        await Promise.all(
          selected.map((file, index) =>
            validateImage(file, {
              label: `Gallery image ${index + 1}`,
              maxMb: 15,
            })
          )
        );
      }
      setFiles((current) => ({
        ...current,
        [kind]: kind === "gallery" ? selected : selected[0],
      }));
    } catch (err) {
      setError(err.message);
    }
  };

  const validateBeforeSubmit = () => {
    const missingCategoryField = (
      eventCategoryFields[form.category] || []
    ).find((field) => {
      if (!field.required) return false;
      const value = form.categoryDetails?.[field.id];
      return (
        value === undefined ||
        value === null ||
        value === "" ||
        (Array.isArray(value) && !value.length)
      );
    });
    if (missingCategoryField)
      throw new Error(
        `${missingCategoryField.label} is required for ${form.category}.`
      );
    if (!form.bannerImage && !files.banner)
      throw new Error("Event banner is required.");
    if (!form.thumbnailImage && !files.thumbnail)
      throw new Error("Event thumbnail is required.");
    const galleryCount =
      (form.galleryImages || []).length + files.gallery.length;
    if (galleryCount < 5 || galleryCount > 6)
      throw new Error("Gallery must contain 5 or 6 images.");
    if (form.ticketType === "Paid" && !form.packages.length)
      throw new Error("Add at least one pricing package for a paid event.");
    if (
      form.ticketType === "Paid" &&
      form.packages.some(
        (item) =>
          !item.name.trim() || Number(item.price) < 0 || Number(item.seats) < 1 || !item.ticketFor
      )
    )
      throw new Error(
        "Every package needs a name, valid ticket type, price, and at least one seat."
      );
    if (
      form.itinerary.some((item) =>
        item.type === "text"
          ? !item.text.trim()
          : !item.fileUrl && !itineraryFiles[item.id]
      )
    )
      throw new Error("Complete or remove each itinerary item.");
  };

  const submit = async (event) => {
    event.preventDefault();
    if (currentStep !== steps.length - 1) return;
    setSaving(true);
    setError("");
    try {
      validateBeforeSubmit();
      const base = `events/${user.uid}`;
      const [bannerImage, thumbnailImage, routeMap, newGallery] =
        await Promise.all([
          files.banner
            ? uploadFile(files.banner, `${base}/banners`, setProgress)
            : form.bannerImage,
          files.thumbnail
            ? uploadFile(files.thumbnail, `${base}/thumbnails`, setProgress)
            : form.thumbnailImage,
          files.routeMap
            ? uploadFile(files.routeMap, `${base}/route-maps`, setProgress)
            : form.routeMap,
          Promise.all(
            files.gallery.map((file) =>
              uploadFile(file, `${base}/gallery`, setProgress)
            )
          ),
        ]);
      const itinerary = await Promise.all(
        form.itinerary.map(async (item) => ({
          ...item,
          fileUrl: itineraryFiles[item.id]
            ? await uploadFile(
              itineraryFiles[item.id],
              `${base}/itinerary`,
              setProgress
            )
            : item.fileUrl,
        }))
      );
      const packages =
        form.ticketType === "Paid"
          ? form.packages.map((item) => ({
            ...item,
            price: Number(item.price),
            discountPrice: item.discountPrice ? Number(item.discountPrice) : "",
            seats: Number(item.seats),
          }))
          : [];
      const payload = {
        ...form,
        status: eventId ? form.status : "Draft",
        hostId: user.uid,
        hostName: profile?.fullName || "",
        hostPhotoURL: profile?.photoURL || "",
        bannerImage,
        thumbnailImage,
        routeMap,
        itinerary,
        packages,
        galleryImages: [...(form.galleryImages || []), ...newGallery],
        capacity:
          form.ticketType === "Paid"
            ? packages.reduce((sum, item) => sum + item.seats, 0)
            : Number(form.capacity),
        ticketPrice:
          form.ticketType === "Paid"
            ? Math.min(...packages.map((item) => item.price))
            : 0,
      };
      if (eventId) {
        await updateEvent(eventId, payload);
        navigate(`/events/${eventId}`);
      } else {
        const id = await createEvent(payload);
        navigate(`/events/${id}`);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <AppLayout>
        <LoadingState label="Loading event" />
      </AppLayout>
    );

  return (
    <AppLayout>
      <main className="page-shell event-builder">
        <div className="page-heading">
          <div>
            <h1>{eventId ? "Edit Event" : "Create Event"}</h1>
            <p>
              Add event details, approved media, itinerary, and ticket packages.
            </p>
          </div>
        </div>
        <nav className="builder-steps" aria-label="Event form progress">
          {steps.map((step, index) => (
            <button
              key={step}
              type="button"
              className={
                index === currentStep
                  ? "active"
                  : index < currentStep
                    ? "complete"
                    : ""
              }
              onClick={() => index < currentStep && setCurrentStep(index)}
            >
              <b>{index + 1}</b>
              <span>{step}</span>
            </button>
          ))}
        </nav>
        <div className="progress-wrapper">
          <div
            className="progress-fill"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
        {error && (
          <div className="alert error" role="alert">
            {error}
          </div>
        )}
        <form className="event-form" onSubmit={submit}>
          {currentStep === 0 && (
            <section className="form-section">
              <h2>Event details</h2>
              <div className="form-grid two">
                <label className="form-field">
                  <span>Event name</span>
                  <input
                    required
                    value={form.title}
                    onChange={(e) => update("title", e.target.value)}
                  />
                </label>
                <label className="form-field">
                  <span>Category</span>
                  <select
                    required
                    value={form.category}
                    onChange={(e) => updateCategory(e.target.value)}
                  >
                    <option value="">Select category</option>
                    {categories.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                </label>
                <label className="form-field">
                  <span>Sub Category</span>
                  <input
                    value={form.subCategory}
                    onChange={(e) => update("subCategory", e.target.value)}
                    placeholder="e.g. Vintage, Off-road"
                  />
                </label>
                <label className="form-field">
                  <span>Status</span>
                  <select
                    value={form.status}
                    onChange={(e) => update("status", e.target.value)}
                  >
                    <option>Draft</option>
                    <option>Published</option>
                    <option>Completed</option>
                    <option>Cancelled</option>
                  </select>
                </label>
              </div>
              <label className="form-field">
                <span>Description</span>
                <textarea
                  required
                  rows="6"
                  value={form.description}
                  onChange={(e) => update("description", e.target.value)}
                />
              </label>

              <div style={{ marginTop: "20px" }}>
                <StringListBuilder
                  title="Trip Support"
                  placeholder="e.g. Backup Vehicle, Mechanic on duty"
                  items={form.tripSupport || []}
                  onChange={(items) => update("tripSupport", items)}
                />
              </div>

              <div style={{ marginTop: "10px" }}>
                <StringListBuilder
                  title="Mandatory Rider Requirements"
                  placeholder="e.g. Full face helmet, Riding jacket"
                  items={form.mandatoryRequirements || []}
                  onChange={(items) => update("mandatoryRequirements", items)}
                />
              </div>

              {form.category && (
                <div className="category-details">
                  <div className="category-details-heading">
                    <h3>{form.category} details</h3>
                    <p className="section-note">
                      Add the information specific to this event category.
                    </p>
                  </div>
                  <div className="form-grid two">
                    {eventCategoryFields[form.category].map((field) => (
                      <CategoryDetailInput
                        key={field.id}
                        field={field}
                        value={form.categoryDetails?.[field.id]}
                        onChange={(value) =>
                          updateCategoryDetail(field.id, value)
                        }
                      />
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}
          {currentStep === 1 && (
            <section className="form-section">
              <h2>Schedule & location</h2>
              <div className="form-grid two">
                <label className="form-field">
                  <span>Start date</span>
                  <input
                    type="date"
                    required
                    value={form.startDate}
                    onChange={(e) => update("startDate", e.target.value)}
                  />
                </label>
                <label className="form-field">
                  <span>End date</span>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={(e) => update("endDate", e.target.value)}
                  />
                </label>
                <label className="form-field">
                  <span>Start time</span>
                  <input
                    type="time"
                    required
                    value={form.startTime}
                    onChange={(e) => update("startTime", e.target.value)}
                  />
                </label>
                <label className="form-field">
                  <span>End time</span>
                  <input
                    type="time"
                    required
                    value={form.endTime}
                    onChange={(e) => update("endTime", e.target.value)}
                  />
                </label>
                <label className="form-field">
                  <span>Registration opens</span>
                  <input
                    type="date"
                    required
                    value={form.registrationStart}
                    onChange={(e) =>
                      update("registrationStart", e.target.value)
                    }
                  />
                </label>
                <label className="form-field">
                  <span>Registration closes</span>
                  <input
                    type="date"
                    required
                    value={form.registrationEnd}
                    onChange={(e) => update("registrationEnd", e.target.value)}
                  />
                </label>
                <label className="form-field">
                  <span>Venue</span>
                  <input
                    required
                    value={form.venue}
                    onChange={(e) => update("venue", e.target.value)}
                  />
                </label>
                <label className="form-field">
                  <span>City</span>
                  <input
                    required
                    value={form.city}
                    onChange={(e) => update("city", e.target.value)}
                  />
                </label>
                <label className="form-field">
                  <span>State</span>
                  <input
                    required
                    value={form.state}
                    onChange={(e) => update("state", e.target.value)}
                  />
                </label>
              </div>
              <label className="form-field">
                <span>Full address</span>
                <input
                  required
                  value={form.address}
                  onChange={(e) => update("address", e.target.value)}
                />
              </label>
            </section>
          )}
          {currentStep === 2 && (
            <section className="form-section">
              <h2>Event media</h2>
              <p className="section-note">
                Images can be any resolution. Each file can be up to 15 MB.
              </p>
              <div className="media-grid">
                <MediaInput
                  title="Event Banner"
                  required
                  hint="1200 x 628 px · JPG/PNG · Max 15 MB"
                  accept="image/jpeg,image/png"
                  file={files.banner}
                  existing={form.bannerImage}
                  onChange={(items) => chooseMedia("banner", items)}
                />
                <MediaInput
                  title="Your Logo"
                  required
                  hint="600 x 600 px · JPG/PNG · Max 15 MB"
                  accept="image/jpeg,image/png"
                  file={files.thumbnail}
                  existing={form.thumbnailImage}
                  onChange={(items) => chooseMedia("thumbnail", items)}
                />
                <MediaInput
                  title="Route Map Image"
                  hint="Any resolution · JPG/PNG/PDF · Max 15 MB"
                  accept="image/jpeg,image/png,application/pdf"
                  file={files.routeMap}
                  existing={form.routeMap}
                  onChange={(items) => chooseMedia("routeMap", items)}
                />
                <MediaInput
                  title="Gallery Images"
                  required
                  hint="5 required, max 6 · Min 800 x 600 px · Max 15 MB each"
                  accept="image/jpeg,image/png"
                  multiple
                  file={files.gallery}
                  existing={
                    form.galleryImages?.length
                      ? `${form.galleryImages.length} saved images`
                      : ""
                  }
                  onChange={(items) => chooseMedia("gallery", items)}
                />
              </div>
            </section>
          )}
          {currentStep === 3 && (
            <section className="form-section">
              <div className="section-heading">
                <div>
                  <h2>Itinerary</h2>
                  <p className="section-note">
                    Build the event plan with text, images, or PDF documents.
                  </p>
                </div>
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() =>
                    update("itinerary", [
                      ...form.itinerary,
                      emptyItineraryItem(),
                    ])
                  }
                >
                  <Plus size={16} /> Add item
                </button>
              </div>
              {!form.itinerary.length && (
                <div className="empty-builder">No itinerary items yet.</div>
              )}
              {form.itinerary.map((item, index) => (
                <div className="builder-card" key={item.id}>
                  <div className="card-number">{index + 1}</div>
                  <div className="builder-card-body">
                    <div className="form-grid two">
                      <label className="form-field">
                        <span>Title / day</span>
                        <input
                          value={item.title}
                          onChange={(e) =>
                            updateItinerary(item.id, "title", e.target.value)
                          }
                          placeholder="Day 1 · Arrival"
                        />
                      </label>
                      <label className="form-field">
                        <span>Content type</span>
                        <select
                          value={item.type}
                          onChange={(e) =>
                            updateItinerary(item.id, "type", e.target.value)
                          }
                        >
                          <option value="text">Text</option>
                          <option value="image">Image</option>
                          <option value="pdf">PDF</option>
                        </select>
                      </label>
                    </div>
                    {item.type === "text" ? (
                      <label className="form-field">
                        <span>Itinerary details</span>
                        <textarea
                          rows="4"
                          value={item.text}
                          onChange={(e) =>
                            updateItinerary(item.id, "text", e.target.value)
                          }
                        />
                      </label>
                    ) : (
                      <label className="form-field">
                        <span>
                          {item.type === "image" ? "Image" : "PDF document"}
                        </span>
                        <input
                          type="file"
                          accept={
                            item.type === "image"
                              ? "image/jpeg,image/png"
                              : "application/pdf"
                          }
                          onChange={(e) =>
                            setItineraryFiles((current) => ({
                              ...current,
                              [item.id]: e.target.files[0],
                            }))
                          }
                        />
                        <small>
                          {itineraryFiles[item.id]?.name ||
                            (item.fileUrl ? "Saved file" : "No file selected")}
                        </small>
                      </label>
                    )}
                  </div>
                  <button
                    type="button"
                    className="icon-btn danger"
                    aria-label="Remove itinerary item"
                    onClick={() =>
                      update(
                        "itinerary",
                        form.itinerary.filter((entry) => entry.id !== item.id)
                      )
                    }
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              ))}
            </section>
          )}
          {currentStep === 4 && (
            <section className="form-section">
              <h2>Pricing & packages</h2>
              <label className="form-field compact">
                <span>Ticket type</span>
                <select
                  value={form.ticketType}
                  onChange={(e) => update("ticketType", e.target.value)}
                >
                  <option>Free</option>
                  <option>Paid</option>
                </select>
              </label>
              {form.ticketType === "Free" ? (
                <label className="form-field compact">
                  <span>Maximum participants</span>
                  <input
                    type="number"
                    min="1"
                    required
                    value={form.capacity}
                    onChange={(e) => update("capacity", e.target.value)}
                  />
                </label>
              ) : (
                <>
                  <div className="section-heading">
                    <p className="section-note">
                      Create tiers such as Platinum, Plus, or Standard. Total
                      capacity is calculated from package seats.
                    </p>
                    <button
                      type="button"
                      className="secondary-btn"
                      onClick={() =>
                        update("packages", [...form.packages, emptyPackage()])
                      }
                    >
                      <Plus size={16} /> Add package
                    </button>
                  </div>
                  {!form.packages.length && (
                    <div className="empty-builder">
                      Add at least one package for this paid event.
                    </div>
                  )}
                  {form.packages.map((item) => (
                    <div className="builder-card package-card" key={item.id}>
                      <div className="builder-card-body">
                        <div className="form-grid package-grid">
                          <label className="form-field">
                            <span>Package name</span>
                            <input
                              required
                              value={item.name}
                              placeholder="Platinum"
                              onChange={(e) =>
                                updatePackage(item.id, "name", e.target.value)
                              }
                            />
                          </label>
                          <label className="form-field">
                            <span>Price (₹)</span>
                            <input
                              required
                              type="number"
                              min="0"
                              value={item.price}
                              onChange={(e) =>
                                updatePackage(item.id, "price", e.target.value)
                              }
                            />
                          </label>
                          <label className="form-field">
                            <span>Discount Price (₹)</span>
                            <input
                              type="number"
                              min="0"
                              value={item.discountPrice || ""}
                              onChange={(e) =>
                                updatePackage(item.id, "discountPrice", e.target.value)
                              }
                            />
                          </label>
                          <label className="form-field">
                            <span>Available seats</span>
                            <input
                              required
                              type="number"
                              min="1"
                              value={item.seats}
                              onChange={(e) =>
                                updatePackage(item.id, "seats", e.target.value)
                              }
                            />
                          </label>
                        </div>
                        <label className="form-field">
                          <span>Ticket for</span>
                          <select
                            required
                            value={item.ticketFor || ""}
                            onChange={(e) =>
                              updatePackage(item.id, "ticketFor", e.target.value)
                            }
                          >
                            <option value="">Select ticket type</option>
                            {(ticketForCategoryMapping[form.category] || ticketForCategoryMapping.default).map((option) => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                        </label>
                        <label className="form-field">
                          <span>Short Description</span>
                          <input
                            type="text"
                            maxLength={120}
                            value={item.shortDescription}
                            placeholder="Brief description of the package (max 120 chars)"
                            onChange={(e) =>
                              updatePackage(item.id, "shortDescription", e.target.value)
                            }
                          />
                        </label>
                        <div className="form-grid two">
                          <label className="form-field">
                            <span>Inclusions (in points)</span>
                            <textarea
                              rows="3"
                              value={item.inclusions}
                              placeholder="VIP check-in&#10;Meals included&#10;Merchandise..."
                              onChange={(e) =>
                                updatePackage(item.id, "inclusions", e.target.value)
                              }
                            />
                          </label>
                          <label className="form-field">
                            <span>Exclusions (in points)</span>
                            <textarea
                              rows="3"
                              value={item.exclusions}
                              placeholder="Travel&#10;Accommodation..."
                              onChange={(e) =>
                                updatePackage(item.id, "exclusions", e.target.value)
                              }
                            />
                          </label>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="icon-btn danger"
                        aria-label="Remove package"
                        onClick={() =>
                          update(
                            "packages",
                            form.packages.filter(
                              (entry) => entry.id !== item.id
                            )
                          )
                        }
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  ))}
                </>
              )}
            </section>
          )}
          {currentStep === 5 && (
            <section className="form-section">
              <div className="section-header">
                <h2>Coupons</h2>
                <button
                  type="button"
                  className="add-btn"
                  onClick={() =>
                    update("coupons", [...form.coupons, emptyCoupon()])
                  }
                >
                  <Plus size={20} />
                  Add Coupon
                </button>
              </div>
              {form?.coupons?.length === 0 ? (
                <div className="empty-state">
                  <p>No coupons added yet.</p>
                </div>
              ) : (
                <>
                  {form.coupons.map((item, index) => (
                    <div key={item.id} className="package-card">
                      <div className="package-header">
                        <h4>Coupon {index + 1}</h4>
                      </div>
                      <div className="package-body">
                        <div className="form-grid two">
                          <label className="form-field">
                            <span>Coupon Code</span>
                            <input
                              type="text"
                              value={item.code}
                              placeholder="e.g. SUMMER20"
                              onChange={(e) =>
                                updateCoupon(item.id, "code", e.target.value.toUpperCase())
                              }
                            />
                          </label>
                          <label className="form-field">
                            <span>Discount Type</span>
                            <select
                              value={item.discountType}
                              onChange={(e) =>
                                updateCoupon(item.id, "discountType", e.target.value)
                              }
                            >
                              <option value="percentage">Percentage (%)</option>
                              <option value="fixed">Fixed Amount (₹)</option>
                            </select>
                          </label>
                        </div>
                        <div className="form-grid three">
                          <label className="form-field">
                            <span>Discount Value</span>
                            <input
                              type="number"
                              value={item.discountValue}
                              placeholder={
                                item.discountType === "percentage" ? "% off" : "₹ off"
                              }
                              onChange={(e) =>
                                updateCoupon(item.id, "discountValue", e.target.value)
                              }
                            />
                          </label>
                          <label className="form-field">
                            <span>Max Uses (Optional)</span>
                            <input
                              type="number"
                              value={item.maxUses}
                              placeholder="e.g. 100"
                              onChange={(e) =>
                                updateCoupon(item.id, "maxUses", e.target.value)
                              }
                            />
                          </label>
                          <label className="form-field">
                            <span>Valid Till (Optional)</span>
                            <input
                              type="date"
                              value={item.validTill}
                              onChange={(e) =>
                                updateCoupon(item.id, "validTill", e.target.value)
                              }
                            />
                          </label>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="icon-btn danger"
                        aria-label="Remove coupon"
                        onClick={() =>
                          update(
                            "coupons",
                            form.coupons.filter((c) => c.id !== item.id)
                          )
                        }
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  ))}
                </>
              )}
            </section>
          )}
          {currentStep === 6 && (
            <section className="form-section">
              <div className="section-header">
                <h2>Add-ons</h2>
                <button
                  type="button"
                  className="add-btn"
                  onClick={() =>
                    update("addons", [...form.addons, emptyAddon()])
                  }
                >
                  <Plus size={20} />
                  Add Add-on
                </button>
              </div>
              {form?.addons?.length === 0 ? (
                <div className="empty-state">
                  <p>No add-ons added yet.</p>
                </div>
              ) : (
                <>
                  {form.addons.map((item, index) => (
                    <div key={item.id} className="package-card">
                      <div className="package-header">
                        <h4>Add-on {index + 1}</h4>
                      </div>
                      <div className="package-body">
                        <div className="form-grid two">
                          <label className="form-field">
                            <span>Add-on Name</span>
                            <input
                              type="text"
                              value={item.name}
                              placeholder="e.g. Ride protection"
                              onChange={(e) =>
                                updateAddon(item.id, "name", e.target.value)
                              }
                            />
                          </label>
                          <label className="form-field">
                            <span>Price (₹)</span>
                            <input
                              type="number"
                              value={item.price}
                              placeholder="e.g. 199"
                              onChange={(e) =>
                                updateAddon(item.id, "price", e.target.value)
                              }
                            />
                          </label>
                        </div>
                        <label className="form-field">
                          <span>Description</span>
                          <input
                            type="text"
                            value={item.description}
                            placeholder="e.g. Basic accidental assistance and priority support."
                            onChange={(e) =>
                              updateAddon(item.id, "description", e.target.value)
                            }
                          />
                        </label>
                      </div>
                      <button
                        type="button"
                        className="icon-btn danger"
                        aria-label="Remove add-on"
                        onClick={() =>
                          update(
                            "addons",
                            form.addons.filter((a) => a.id !== item.id)
                          )
                        }
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  ))}
                </>
              )}
            </section>
          )}
          {currentStep === 7 && (
            <section className="form-section">
              <h2>Terms & Conditions</h2>
              <label className="form-field">
                <span>Terms and Conditions</span>
                <textarea
                  rows="6"
                  value={form.termsAndConditions}
                  placeholder="Enter the terms and conditions for this event..."
                  onChange={(e) => update("termsAndConditions", e.target.value)}
                />
              </label>
            </section>
          )}
          {currentStep === 8 && (
            <EventPreview form={form} files={files} progress={progress} />
          )}
          <div className="step-actions">
            <button
              type="button"
              className="prev-btn"
              disabled={currentStep === 0 || saving}
              onClick={() => setCurrentStep((step) => step - 1)}
            >
              Previous
            </button>
            {currentStep < steps.length - 1 ? (
              <button
                type="button"
                className="next-btn"
                onClick={() => setCurrentStep((step) => step + 1)}
              >
                {currentStep === steps.length - 2 ? "Preview Event" : "Next"}
              </button>
            ) : (
              <button type="submit" className="submit-btn" disabled={saving}>
                {saving
                  ? "Saving draft..."
                  : eventId
                    ? "Update Event"
                    : "Save as draft"}
              </button>
            )}
          </div>
        </form>
      </main>
    </AppLayout>
  );
};

const MediaInput = ({
  title,
  required,
  hint,
  accept,
  multiple,
  file,
  existing,
  onChange,
}) => (
  <label className="media-input">
    <span className="media-icon">
      {accept.includes("pdf") ? <FileText size={22} /> : <Image size={22} />}
    </span>
    <strong>
      {title} {required && <em>Required</em>}
    </strong>
    <small>{hint}</small>
    <input
      type="file"
      accept={accept}
      multiple={multiple}
      onChange={(e) => onChange(Array.from(e.target.files || []))}
    />
    <span className="file-name">
      {multiple
        ? file?.length
          ? `${file.length} selected`
          : existing || "Choose images"
        : file?.name || (existing ? "Saved file" : "Choose file")}
    </span>
  </label>
);
const CategoryDetailInput = ({ field, value, onChange }) => {
  if (field.type === "boolean")
    return (
      <label className="boolean-field">
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span>
          {field.label}
          {field.required && <em> *</em>}
        </span>
      </label>
    );
  if (field.type === "select")
    return (
      <label className="form-field">
        <span>
          {field.label}
          {field.required && <em> *</em>}
        </span>
        <select
          required={field.required}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">Select {field.label.toLowerCase()}</option>
          {field.options.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      </label>
    );
  if (field.type === "textarea")
    return (
      <label className="form-field category-wide">
        <span>
          {field.label}
          {field.required && <em> *</em>}
        </span>
        <textarea
          required={field.required}
          rows="4"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
        />
      </label>
    );
  if (field.type === "array" || field.type === "tags") {
    const displayValue = Array.isArray(value)
      ? value
        .map((item) => (typeof item === "object" ? item.description : item))
        .join("\n")
      : "";
    const help =
      field.itemType === "object"
        ? "Enter one day or item per line."
        : field.type === "tags"
          ? "Enter one item per line."
          : "Enter one item per line.";
    return (
      <label className="form-field category-wide">
        <span>
          {field.label}
          {field.required && <em> *</em>}
        </span>
        <textarea
          rows="4"
          value={displayValue}
          placeholder={help}
          onChange={(e) => {
            const items = e.target.value
              .split("\n")
              .map((item) => item.trim())
              .filter(Boolean);
            onChange(
              field.itemType === "object"
                ? items.map((description, index) => ({
                  day: index + 1,
                  description,
                }))
                : items
            );
          }}
        />
        <small>{help}</small>
      </label>
    );
  }
  return (
    <label className="form-field">
      <span>
        {field.label}
        {field.required && <em> *</em>}
      </span>
      <input
        required={field.required}
        type={field.type}
        min={field.type === "number" ? "0" : undefined}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
      />
      {field.unit && <small>Value in {field.unit}</small>}
    </label>
  );
};
const Review = ({ label, value }) => (
  <div>
    <span>{label}</span>
    <strong>{value || "Not provided"}</strong>
  </div>
);

const PreviewImage = ({ file, src, alt }) => {
  const [previewSrc, setPreviewSrc] = useState(src || "");
  useEffect(() => {
    if (!file) {
      setPreviewSrc(src || "");
      return undefined;
    }
    const url = URL.createObjectURL(file);
    setPreviewSrc(url);
    return () => URL.revokeObjectURL(url);
  }, [file, src]);
  return previewSrc ? (
    <img src={previewSrc} alt={alt} />
  ) : (
    <div className="preview-placeholder">No image added</div>
  );
};

const EventPreview = ({ form, files, progress }) => (
  <section className="form-section event-preview">
    <span className="preview-badge">Draft preview</span>
    <h2>{form.title || "Untitled event"}</h2>
    <p className="section-note">
      {[form.category, form.subCategory].filter(Boolean).join(" · ")}
    </p>
    <div className="preview-banner">
      <PreviewImage
        file={files.banner}
        src={form.bannerImage}
        alt="Event banner"
      />
    </div>
    <div className="review-grid">
      <Review
        label="Date & time"
        value={`${form.startDate} ${form.startTime} — ${form.endDate || form.startDate
          } ${form.endTime}`}
      />
      <Review
        label="Location"
        value={[form.venue, form.address, form.city, form.state]
          .filter(Boolean)
          .join(", ")}
      />
      <Review
        label="Registration"
        value={`${form.registrationStart} — ${form.registrationEnd}`}
      />
      <Review
        label="Tickets"
        value={
          form.ticketType === "Free"
            ? `Free · ${form.capacity} participants`
            : `${form.packages.length} packages`
        }
      />
    </div>
    <div className="preview-content">
      <div>
        <h3>About this event</h3>
        <p>{form.description || "No description added."}</p>
      </div>
      <div className="preview-thumbnail">
        <PreviewImage
          file={files.thumbnail}
          src={form.thumbnailImage}
          alt="Event thumbnail"
        />
      </div>
    </div>
    <h3>Gallery</h3>
    <div className="preview-gallery">
      {(form.galleryImages || []).map((src, index) => (
        <PreviewImage key={src} src={src} alt={`Gallery ${index + 1}`} />
      ))}
      {files.gallery.map((file, index) => (
        <PreviewImage
          key={`${file.name}-${file.lastModified}`}
          file={file}
          alt={`Gallery ${index + 1}`}
        />
      ))}
    </div>
    {!!form.itinerary.length && (
      <>
        <h3>Itinerary</h3>
        <div className="preview-list">
          {form.itinerary.map((item) => (
            <div key={item.id}>
              <strong>{item.title || "Itinerary item"}</strong>
              <p>
                {item.type === "text"
                  ? item.text
                  : item.fileUrl || "New attachment selected"}
              </p>
            </div>
          ))}
        </div>
      </>
    )}
    {form.ticketType === "Paid" && (
      <>
        <h3>Ticket packages</h3>
        <div className="preview-list">
          {form.packages.map((item) => (
            <div key={item.id}>
              <strong>
                {item.name} · ₹{item.price} {item.discountPrice ? `(Discounted: ₹${item.discountPrice})` : ""}
              </strong>
              <p>
                {item.ticketFor && `${item.ticketFor} · `}{item.seats} seats
              </p>
              {item.shortDescription && <p>{item.shortDescription}</p>}
              {item.inclusions && (
                <div>
                  <strong>Inclusions:</strong>
                  <p style={{ whiteSpace: "pre-wrap", marginTop: "4px" }}>{item.inclusions}</p>
                </div>
              )}
              {item.exclusions && (
                <div>
                  <strong>Exclusions:</strong>
                  <p style={{ whiteSpace: "pre-wrap", marginTop: "4px" }}>{item.exclusions}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </>
    )}
    {form.coupons && form.coupons.length > 0 && (
      <>
        <h3>Coupons</h3>
        <div className="preview-list">
          {form.coupons.map((item) => (
            <div key={item.id}>
              <strong>{item.code}</strong>
              <p>
                {item.discountValue}
                {item.discountType === "percentage" ? "%" : "₹"} off
                {item.maxUses ? ` · Max Uses: ${item.maxUses}` : ""}
                {item.validTill ? ` · Valid Till: ${item.validTill}` : ""}
              </p>
            </div>
          ))}
        </div>
      </>
    )}
    {form.addons && form.addons.length > 0 && (
      <>
        <h3>Add-ons</h3>
        <div className="preview-list">
          {form.addons.map((item) => (
            <div key={item.id}>
              <strong>{item.name}</strong>
              <p>
                ₹{item.price}
                {item.description ? ` · ${item.description}` : ""}
              </p>
            </div>
          ))}
        </div>
      </>
    )}
    {form.termsAndConditions && (
      <>
        <h3>Terms & Conditions</h3>
        <div className="preview-list">
          <div style={{ whiteSpace: "pre-wrap", padding: "14px", border: "1px solid #e2e8f0", borderRadius: "12px", color: "#64748b" }}>
            {form.termsAndConditions}
          </div>
        </div>
      </>
    )}
    {progress > 0 && (
      <p className="upload-progress">Uploading files: {progress}%</p>
    )}
    <p className="section-note">
      Saving will add this event as a draft in My Events.
    </p>
  </section>
);

export default EventForm;
