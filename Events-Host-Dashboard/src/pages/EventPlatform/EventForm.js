import React, { useEffect, useState, useRef, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
  Image, 
  FileText, 
  Plus, 
  Trash2,
  CalendarDays,
  Ticket,
  Percent,
  Gift,
  ShieldCheck,
  Eye,
  Layers,
  Check,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  UploadCloud,
  AlertCircle
} from "lucide-react";
import AppLayout from "../../components/AppLayout/AppLayout";
import LoadingState from "../../components/States/LoadingState";
import { useAuth } from "../../context/AuthContext";
import {
  createEvent,
  getEvent,
  updateEvent,
  uploadFile,
  subscribeToTicketTemplates,
} from "../../services/firebaseService";
import {
  eventCategories as categories,
  eventCategoryFields,
} from "./eventCategoryFields";
import { TicketPassView } from "./ticketDesigns";
import "./TicketDesigns.css";
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
  ticketDesign: "",
  ticketTemplateId: "",
  ticketTemplateUrl: "",
  ticketTemplateName: "",
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
  "Ticket Design",
  "Itinerary",
  "Pricing",
  "Coupons",
  "Add-ons",
  "Terms & Conditions",
  "Preview",
];


const MB = 1024 * 1024;

const getImageDimensions = (file) => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      return reject(new Error("Selected file is not an image."));
    }
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      const width = img.naturalWidth || img.width;
      const height = img.naturalHeight || img.height;
      URL.revokeObjectURL(url);
      resolve({ width, height });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Unable to read image dimensions. Please check the image file."));
    };
    img.src = url;
  });
};

const validateImage = async (file, { label, maxMb, require16by9 = false }) => {
  if (!file.type.match(/^image\/(jpeg|png|jpg|webp)$/i))
    throw new Error(`${label} must be a JPG, PNG, or WEBP file.`);
  if (file.size > maxMb * MB)
    throw new Error(`${label} must be ${maxMb} MB or smaller.`);

  if (require16by9) {
    const { width, height } = await getImageDimensions(file);
    if (!width || !height) {
      throw new Error(`Unable to detect ${label.toLowerCase()} dimensions.`);
    }
    const ratio = width / height;
    const targetRatio = 16 / 9; // ~1.7777777777777777
    const diff = Math.abs(ratio - targetRatio);
    // Allow slight rounding tolerance (0.015) for standard displays like 1366x768 and 854x480
    if (diff > 0.015) {
      const currentRatio = (width / height).toFixed(2);
      throw new Error(
        `${label} resolution must strictly be 16:9 (e.g. 1920×1080, 1600×900, 1280×720). Uploaded resolution is ${width}×${height} (aspect ratio ${currentRatio}:1). No other resolution is accepted.`
      );
    }
  }
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
    <div className="string-list-builder-box">
      <div className="form-field">
        <span className="field-label-text">{title}</span>
        <div className="string-builder-input-row">
          <input
            className="form-input"
            value={val}
            onChange={(e) => setVal(e.target.value)}
            placeholder={placeholder}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                add();
              }
            }}
          />
          <button type="button" className="string-builder-add-btn" onClick={add}>
            <Plus size={15} />
            <span>Add Tag</span>
          </button>
        </div>
      </div>
      {items.length > 0 && (
        <div className="string-chips-container">
          {items.map((item, i) => (
            <span key={i} className="string-tag-pill">
              <span className="string-tag-text">{item}</span>
              <button
                type="button"
                className="string-tag-del-btn"
                onClick={() => onChange(items.filter((_, idx) => idx !== i))}
                title={`Remove ${item}`}
              >
                <Trash2 size={12} />
              </button>
            </span>
          ))}
        </div>
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
  const [firestoreTemplates, setFirestoreTemplates] = useState([]);

  // Subscribe to Firestore collection `ticket_tamplate` in real-time
  useEffect(() => {
    const unsub = subscribeToTicketTemplates(
      (templates) => {
        setFirestoreTemplates(templates);
      },
      (err) => {
        console.warn("Could not fetch ticket_tamplate collection:", err);
      }
    );
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!eventId) return;
    getEvent(eventId)
      .then((event) =>
        setForm({
          ...initialForm,
          ...event,
          ticketDesign: event.ticketDesign || event.ticketTemplateId || "",
          ticketTemplateId: event.ticketTemplateId || event.ticketDesign || "",
          ticketTemplateUrl: event.ticketTemplateUrl || "",
          ticketTemplateName: event.ticketTemplateName || "",
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

  // Only show fetched data from Firestore `ticket_tamplate` collection
  const availableTemplates = useMemo(() => {
    return (firestoreTemplates || []).map((t, idx) => ({
      id: t.id,
      name: t.name || t.title || `Template #${idx + 1}`,
      image: t.image || t.imageUrl || t.downloadUrl || '',
      imageUrl: t.imageUrl || t.image || t.downloadUrl || '',
      source: 'ticket_tamplate',
    }));
  }, [firestoreTemplates]);

  // When templates are fetched and no template is selected yet, default to the first fetched template
  useEffect(() => {
    if (firestoreTemplates && firestoreTemplates.length > 0) {
      if (!form.ticketTemplateId && !form.ticketTemplateUrl) {
        const first = firestoreTemplates[0];
        setForm((prev) => ({
          ...prev,
          ticketDesign: first.id,
          ticketTemplateId: first.id,
          ticketTemplateUrl: first.image || first.imageUrl || first.downloadUrl || '',
          ticketTemplateName: first.name || first.title || '',
        }));
      }
    }
  }, [firestoreTemplates, form.ticketTemplateId, form.ticketTemplateUrl]);


  // Host choose ONE template only
  const handleChooseTemplate = (template) => {
    setForm((prev) => ({
      ...prev,
      ticketDesign: template.id,
      ticketTemplateId: template.id,
      ticketTemplateUrl: template.image || template.imageUrl || '',
      ticketTemplateName: template.name || '',
    }));
  };

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
      if (!selected || selected.length === 0) return;
      if (kind === "banner")
        await validateImage(selected[0], {
          label: "Event banner",
          maxMb: 15,
          require16by9: true,
        });
      if (kind === "thumbnail")
        await validateImage(selected[0], {
          label: "Event thumbnail",
          maxMb: 15,
        });
      if (kind === "routeMap") {
        const file = selected[0];
        if (!file.type.match(/^(image\/(jpeg|png|jpg|webp)|application\/pdf)$/i))
          throw new Error("Route map must be JPG, PNG, WEBP, or PDF.");
        if (file.size > 15 * MB)
          throw new Error("Route map must be 15 MB or smaller.");
      }
      setFiles((current) => ({
        ...current,
        [kind]: selected[0],
      }));
    } catch (err) {
      setError(err.message);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const removeMedia = (kind) => {
    setError("");
    if (kind === "banner") {
      setFiles((prev) => ({ ...prev, banner: null }));
      update("bannerImage", "");
    } else if (kind === "thumbnail") {
      setFiles((prev) => ({ ...prev, thumbnail: null }));
      update("thumbnailImage", "");
    } else if (kind === "routeMap") {
      setFiles((prev) => ({ ...prev, routeMap: null }));
      update("routeMap", "");
    }
  };

  const addGalleryFiles = async (newSelected) => {
    setError("");
    try {
      if (!newSelected || !newSelected.length) return;
      const currentSavedCount = (form.galleryImages || []).length;
      const currentFilesCount = (files.gallery || []).length;
      const currentTotal = currentSavedCount + currentFilesCount;
      if (currentTotal + newSelected.length > 6) {
        throw new Error(
          `Gallery allows a maximum of 6 images. You currently have ${currentTotal} images.`
        );
      }
      await Promise.all(
        newSelected.map((file, index) =>
          validateImage(file, {
            label: `Gallery image ${currentTotal + index + 1}`,
            maxMb: 15,
          })
        )
      );
      setFiles((prev) => ({
        ...prev,
        gallery: [...(prev.gallery || []), ...newSelected],
      }));
    } catch (err) {
      setError(err.message);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const removeGalleryFile = (index) => {
    setFiles((prev) => ({
      ...prev,
      gallery: (prev.gallery || []).filter((_, idx) => idx !== index),
    }));
  };

  const removeGalleryExisting = (index) => {
    setForm((prev) => ({
      ...prev,
      galleryImages: (prev.galleryImages || []).filter((_, idx) => idx !== index),
    }));
  };

  const clearAllGallery = () => {
    setFiles((prev) => ({ ...prev, gallery: [] }));
    setForm((prev) => ({ ...prev, galleryImages: [] }));
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
      throw new Error("Event banner is required (16:9 aspect ratio).");
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
        ticketDesign: form.ticketDesign || form.ticketTemplateId || "design-1",
        ticketTemplateId: form.ticketTemplateId || form.ticketDesign || "",
        ticketTemplateUrl: form.ticketTemplateUrl || "",
        ticketTemplateName: form.ticketTemplateName || "",
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

  // Enhanced step navigation handlers (Smooth scrolling to top on transition)
  const handleNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleJumpToStep = (index) => {
    if (index < currentStep || index === currentStep) {
      setCurrentStep(index);
      window.scrollTo({ top: 0, behavior: "smooth" });
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
        {/* Full-width Header Banner */}
        <div className="builder-header-banner">
          <div className="builder-header-title-block">
            <div className="builder-badge-icon">
              <CalendarDays size={22} strokeWidth={2} />
            </div>
            <div>
              <h1 className="builder-main-title">{eventId ? "Edit Event" : "Create New Event"}</h1>
              <p className="builder-sub-title">
                Configure event details, schedules, media assets, ticket packages, and pricing tiers.
              </p>
            </div>
          </div>
          {form.status && (
            <span className={`event-status-pill status-${form.status.toLowerCase()}`}>
              <span className="status-dot-indicator" />
              {form.status}
            </span>
          )}
        </div>

        {/* Advanced Connected 9-Step Stepper (NO SLIDER) */}
        <nav className="advanced-stepper-container" aria-label="Event form progress">
          <div className="stepper-grid-layout">
            {steps.map((step, index) => {
              const isComplete = index < currentStep;
              const isActive = index === currentStep;

              return (
                <button
                  key={step}
                  type="button"
                  className={`stepper-step-node ${isActive ? "active" : ""} ${isComplete ? "complete" : ""}`}
                  onClick={() => isComplete && handleJumpToStep(index)}
                  title={`Step ${index + 1}: ${step}`}
                >
                  <div className="stepper-node-top">
                    <div className="stepper-node-badge">
                      {isComplete ? (
                        <Check size={13} strokeWidth={3} />
                      ) : (
                        <span>{index + 1}</span>
                      )}
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`stepper-track-connector ${index < currentStep ? "filled" : ""}`} />
                    )}
                  </div>
                  <div className="stepper-node-content">
                    <span className="stepper-node-title">{step}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </nav>

        {error && (
          <div className="builder-alert-error" role="alert">
            <AlertCircle size={18} className="alert-icon-error" />
            <div className="alert-error-content">
              <strong>Error updating event</strong>
              <p>{error}</p>
            </div>
          </div>
        )}

        <form className="event-form" onSubmit={submit}>
          {/* STEP 0: DETAILS */}
          {currentStep === 0 && (
            <section className="form-section">
              <div className="section-title-wrap">
                <div className="section-title-icon-box">
                  <FileText size={18} />
                </div>
                <div>
                  <h2 className="section-main-heading">Event Details</h2>
                  <p className="section-sub-heading">
                    Core event metadata, classifications, trip support amenities, and mandatory safety requirements.
                  </p>
                </div>
              </div>

              <div className="form-grid two">
                <label className="form-field">
                  <span className="field-label-text">
                    Event Name <em className="required-star">*</em>
                  </span>
                  <input
                    required
                    className="form-input"
                    placeholder="e.g. Manali–Leh–Manali Adventure Tour"
                    value={form.title}
                    onChange={(e) => update("title", e.target.value)}
                  />
                </label>

                <label className="form-field">
                  <span className="field-label-text">
                    Category <em className="required-star">*</em>
                  </span>
                  <div className="select-input-container">
                    <select
                      required
                      className="form-select"
                      value={form.category}
                      onChange={(e) => updateCategory(e.target.value)}
                    >
                      <option value="">Select category</option>
                      {categories.map((item) => (
                        <option key={item} value={item}>{item}</option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="select-dropdown-chevron" />
                  </div>
                </label>

                <label className="form-field">
                  <span className="field-label-text">Sub Category</span>
                  <input
                    className="form-input"
                    value={form.subCategory}
                    onChange={(e) => update("subCategory", e.target.value)}
                    placeholder="e.g. Vintage, Off-road, Enduro"
                  />
                </label>

                <label className="form-field">
                  <span className="field-label-text">Status</span>
                  <div className="select-input-container">
                    <select
                      className="form-select"
                      value={form.status}
                      onChange={(e) => update("status", e.target.value)}
                    >
                      <option value="Draft">Draft</option>
                      <option value="Published">Published</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                    <ChevronDown size={14} className="select-dropdown-chevron" />
                  </div>
                </label>
              </div>

              <label className="form-field" style={{ marginTop: "16px" }}>
                <span className="field-label-text">
                  Description <em className="required-star">*</em>
                </span>
                <textarea
                  required
                  rows="5"
                  className="form-textarea"
                  placeholder="Provide an overview, key highlights, terrain expectations, and itinerary synopsis..."
                  value={form.description}
                  onChange={(e) => update("description", e.target.value)}
                />
              </label>

              <div className="field-divider" />

              <div className="string-builders-group">
                <StringListBuilder
                  title="Trip Support & Amenities"
                  placeholder="e.g. Backup Vehicle, Mechanic on duty, Luggage Truck"
                  items={form.tripSupport || []}
                  onChange={(items) => update("tripSupport", items)}
                />

                <StringListBuilder
                  title="Mandatory Rider Requirements"
                  placeholder="e.g. Full face DOT/ECE helmet, Armored riding jacket, Riding boots"
                  items={form.mandatoryRequirements || []}
                  onChange={(items) => update("mandatoryRequirements", items)}
                />
              </div>

              {form.category && (
                <div className="category-details">
                  <div className="category-details-heading">
                    <h3 className="category-details-title">{form.category} Details</h3>
                    <p className="section-note">
                      Specific operational metrics and attributes configured for this event category.
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

          {/* STEP 1: SCHEDULE & LOCATION */}
          {currentStep === 1 && (
            <section className="form-section">
              <div className="section-title-wrap">
                <div className="section-title-icon-box">
                  <CalendarDays size={18} />
                </div>
                <div>
                  <h2 className="section-main-heading">Schedule & Location</h2>
                  <p className="section-sub-heading">
                    Event calendar dates, daily operating hours, booking registration windows, and geographic venue coordinates.
                  </p>
                </div>
              </div>

              <div className="form-grid two">
                <label className="form-field">
                  <span className="field-label-text">
                    Start Date <em className="required-star">*</em>
                  </span>
                  <input
                    type="date"
                    required
                    className="form-input"
                    value={form.startDate}
                    onChange={(e) => update("startDate", e.target.value)}
                  />
                </label>

                <label className="form-field">
                  <span className="field-label-text">End Date</span>
                  <input
                    type="date"
                    className="form-input"
                    value={form.endDate}
                    onChange={(e) => update("endDate", e.target.value)}
                  />
                </label>

                <label className="form-field">
                  <span className="field-label-text">
                    Daily Start Time <em className="required-star">*</em>
                  </span>
                  <input
                    type="time"
                    required
                    className="form-input"
                    value={form.startTime}
                    onChange={(e) => update("startTime", e.target.value)}
                  />
                </label>

                <label className="form-field">
                  <span className="field-label-text">
                    Daily End Time <em className="required-star">*</em>
                  </span>
                  <input
                    type="time"
                    required
                    className="form-input"
                    value={form.endTime}
                    onChange={(e) => update("endTime", e.target.value)}
                  />
                </label>

                <label className="form-field">
                  <span className="field-label-text">
                    Registration Opens <em className="required-star">*</em>
                  </span>
                  <input
                    type="date"
                    required
                    className="form-input"
                    value={form.registrationStart}
                    onChange={(e) =>
                      update("registrationStart", e.target.value)
                    }
                  />
                </label>

                <label className="form-field">
                  <span className="field-label-text">
                    Registration Closes <em className="required-star">*</em>
                  </span>
                  <input
                    type="date"
                    required
                    className="form-input"
                    value={form.registrationEnd}
                    onChange={(e) => update("registrationEnd", e.target.value)}
                  />
                </label>

                <label className="form-field">
                  <span className="field-label-text">
                    Venue / Flag-off Point <em className="required-star">*</em>
                  </span>
                  <input
                    required
                    className="form-input"
                    placeholder="e.g. Phoenix Marketcity South Atrium"
                    value={form.venue}
                    onChange={(e) => update("venue", e.target.value)}
                  />
                </label>

                <label className="form-field">
                  <span className="field-label-text">
                    City <em className="required-star">*</em>
                  </span>
                  <input
                    required
                    className="form-input"
                    placeholder="e.g. Pune, Mumbai, Leh"
                    value={form.city}
                    onChange={(e) => update("city", e.target.value)}
                  />
                </label>

                <label className="form-field">
                  <span className="field-label-text">
                    State / Province <em className="required-star">*</em>
                  </span>
                  <input
                    required
                    className="form-input"
                    placeholder="e.g. Maharashtra, Ladakh, Karnataka"
                    value={form.state}
                    onChange={(e) => update("state", e.target.value)}
                  />
                </label>
              </div>

              <label className="form-field" style={{ marginTop: "16px" }}>
                <span className="field-label-text">
                  Full Street Address & Landmark <em className="required-star">*</em>
                </span>
                <input
                  required
                  className="form-input"
                  placeholder="Complete street address for navigation & participant check-in"
                  value={form.address}
                  onChange={(e) => update("address", e.target.value)}
                />
              </label>
            </section>
          )}

          {/* STEP 2: MEDIA */}
          {currentStep === 2 && (
            <section className="form-section">
              <div className="section-title-wrap">
                <div className="section-title-icon-box">
                  <Image size={18} />
                </div>
                <div>
                  <h2 className="section-main-heading">Event Media & Assets</h2>
                  <p className="section-sub-heading">
                    Upload official promotional banners, host logos, GPS route diagrams, and 5-6 gallery showcase photos.
                  </p>
                </div>
              </div>

              <div className="media-grid">
                <div className="media-grid-full-width">
                  <MediaInput
                    title="Event Banner"
                    required
                    aspectBadge="Strict 16:9 Ratio Only"
                    aspectRatio="16/9"
                    hint="Strict 16:9 aspect ratio required (e.g. 1920×1080, 1600×900, 1280×720) · JPG/PNG · Max 15 MB"
                    accept="image/jpeg,image/png,image/webp"
                    file={files.banner}
                    existing={form.bannerImage}
                    onChange={(items) => chooseMedia("banner", items)}
                    onDelete={() => removeMedia("banner")}
                  />
                </div>

                <MediaInput
                  title="Your Logo / Thumbnail"
                  required
                  aspectBadge="1:1 Ratio"
                  aspectRatio="1/1"
                  hint="Square 1:1 recommended (e.g. 600×600 px) · JPG/PNG · Max 15 MB"
                  accept="image/jpeg,image/png,image/webp"
                  file={files.thumbnail}
                  existing={form.thumbnailImage}
                  onChange={(items) => chooseMedia("thumbnail", items)}
                  onDelete={() => removeMedia("thumbnail")}
                />

                <MediaInput
                  title="Route Map Image / GPX"
                  hint="Any resolution · JPG/PNG/WEBP or PDF roadbook · Max 15 MB"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  file={files.routeMap}
                  existing={form.routeMap}
                  onChange={(items) => chooseMedia("routeMap", items)}
                  onDelete={() => removeMedia("routeMap")}
                />

                <div className="media-grid-full-width">
                  <GalleryMediaInput
                    title="Gallery Photos"
                    required
                    hint="5 required, max 6 · Min 800×600 px · Max 15 MB each"
                    accept="image/jpeg,image/png,image/webp"
                    files={files.gallery}
                    existing={form.galleryImages || []}
                    onAdd={addGalleryFiles}
                    onDeleteFile={removeGalleryFile}
                    onDeleteExisting={removeGalleryExisting}
                    onClearAll={clearAllGallery}
                  />
                </div>
              </div>
            </section>
          )}

          {/* STEP 3: CHOOSE TICKET TEMPLATE */}
          {currentStep === 3 && (
            <section className="form-section">
              <div className="section-title-wrap">
                <div className="section-title-icon-box">
                  <Ticket size={18} />
                </div>
                <div>
                  <h2 className="section-main-heading">Choose Ticket Template</h2>
                  <p className="section-sub-heading">
                    Select 1 ticket image for this event from the <code>ticket_tamplate</code> collection. Click any image to choose it.
                  </p>
                </div>
              </div>

              {/* Simple Grid Option to Choose Image (No preview) - strictly fetched data only */}
              {availableTemplates.length === 0 ? (
                <div className="empty-builder-state">
                  <Ticket size={36} className="empty-state-icon" />
                  <h4>No Ticket Templates Found</h4>
                  <p>
                    No ticket templates are currently uploaded in the <code>ticket_tamplate</code> collection. Please upload templates from the Admin Dashboard.
                  </p>
                </div>
              ) : (
                <div className="simple-ticket-template-grid">
                  {availableTemplates.map((t, index) => {
                    const isChosen =
                      form.ticketTemplateId === t.id ||
                      form.ticketDesign === t.id;
                    const imageUrl = t.image || t.imageUrl;

                    return (
                      <div
                        key={t.id}
                        className={`simple-template-card ${isChosen ? 'is-selected' : ''}`}
                        onClick={() => handleChooseTemplate(t)}
                        role="button"
                        tabIndex={0}
                      >
                        <div className="simple-template-image-box">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={t.name || 'Ticket Template'}
                              className="simple-template-img"
                              loading="lazy"
                            />
                          ) : (
                            <div className="simple-template-gradient-fallback" />
                          )}

                          <div className="simple-template-select-pill">
                            {isChosen ? (
                              <span className="pill-badge selected">
                                <CheckCircle2 size={13} /> Selected
                              </span>
                            ) : (
                              <span className="pill-badge unselected">
                                Select
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="simple-template-info">
                          <span className="simple-template-title">{t.name || `Template #${index + 1}`}</span>
                          <span className="simple-template-meta">1080 × 1920 px</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {/* STEP 4: ITINERARY */}
          {currentStep === 4 && (
            <section className="form-section">
              <div className="section-heading">
                <div className="section-title-wrap">
                  <div className="section-title-icon-box">
                    <Layers size={18} />
                  </div>
                  <div>
                    <h2 className="section-main-heading">Itinerary & Milestones</h2>
                    <p className="section-sub-heading">
                      Build the day-by-day plan with scheduled halts, briefing timings, or downloadable route roadbooks.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  className="builder-add-action-btn"
                  onClick={() =>
                    update("itinerary", [
                      ...form.itinerary,
                      emptyItineraryItem(),
                    ])
                  }
                >
                  <Plus size={15} /> 
                  <span>Add Day / Milestone</span>
                </button>
              </div>

              {!form.itinerary.length && (
                <div className="empty-builder-state">
                  <Layers size={32} className="empty-state-icon" />
                  <h4>No itinerary items added yet</h4>
                  <p>Click "Add Day / Milestone" above to define each step of the journey.</p>
                </div>
              )}

              {form.itinerary.map((item, index) => (
                <div className="builder-item-card" key={item.id}>
                  <div className="card-index-indicator">{index + 1}</div>
                  <div className="builder-card-body">
                    <div className="form-grid two">
                      <label className="form-field">
                        <span className="field-label-text">Title / Day</span>
                        <input
                          className="form-input"
                          value={item.title}
                          onChange={(e) =>
                            updateItinerary(item.id, "title", e.target.value)
                          }
                          placeholder="e.g. Day 1 · Basecamp Assembly & Briefing"
                        />
                      </label>
                      <label className="form-field">
                        <span className="field-label-text">Content Type</span>
                        <div className="select-input-container">
                          <select
                            className="form-select"
                            value={item.type}
                            onChange={(e) =>
                              updateItinerary(item.id, "type", e.target.value)
                            }
                          >
                            <option value="text">Text Description</option>
                            <option value="image">Image Attachment</option>
                            <option value="pdf">PDF Roadbook Document</option>
                          </select>
                          <ChevronDown size={14} className="select-dropdown-chevron" />
                        </div>
                      </label>
                    </div>

                    {item.type === "text" ? (
                      <label className="form-field" style={{ marginTop: "12px" }}>
                        <span className="field-label-text">Itinerary Details</span>
                        <textarea
                          rows="3"
                          className="form-textarea"
                          placeholder="Describe route, distance, checkpoints, meal halts, and safety notes..."
                          value={item.text}
                          onChange={(e) =>
                            updateItinerary(item.id, "text", e.target.value)
                          }
                        />
                      </label>
                    ) : (
                      <div className="form-field" style={{ marginTop: "12px" }}>
                        <span className="field-label-text">
                          {item.type === "image" ? "Image File" : "PDF Document"}
                        </span>
                        <div className="styled-file-picker-box">
                          <input
                            type="file"
                            className="styled-native-file-input"
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
                          <div className="file-picker-feedback">
                            <UploadCloud size={16} />
                            <span>
                              {itineraryFiles[item.id]?.name ||
                                (item.fileUrl ? "Saved file on server" : "Click to select file")}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    className="card-del-btn"
                    aria-label="Remove itinerary item"
                    onClick={() =>
                      update(
                        "itinerary",
                        form.itinerary.filter((entry) => entry.id !== item.id)
                      )
                    }
                    title="Remove item"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </section>
          )}

          {/* STEP 5: PRICING & PACKAGES */}
          {currentStep === 5 && (
            <section className="form-section">
              <div className="section-title-wrap">
                <div className="section-title-icon-box">
                  <Ticket size={18} />
                </div>
                <div>
                  <h2 className="section-main-heading">Pricing & Ticket Packages</h2>
                  <p className="section-sub-heading">
                    Offer free community admission with total seats, or establish tiered VIP/Standard packages.
                  </p>
                </div>
              </div>

              <div className="pricing-mode-toggle-card">
                <label className="form-field compact">
                  <span className="field-label-text">Ticket Type</span>
                  <div className="select-input-container">
                    <select
                      className="form-select"
                      value={form.ticketType}
                      onChange={(e) => update("ticketType", e.target.value)}
                    >
                      <option value="Free">Free Admission</option>
                      <option value="Paid">Paid Registration</option>
                    </select>
                    <ChevronDown size={14} className="select-dropdown-chevron" />
                  </div>
                </label>
              </div>

              {form.ticketType === "Free" ? (
                <div className="free-capacity-box">
                  <label className="form-field compact">
                    <span className="field-label-text">
                      Maximum Participant Capacity <em className="required-star">*</em>
                    </span>
                    <input
                      type="number"
                      min="1"
                      required
                      className="form-input"
                      placeholder="e.g. 150"
                      value={form.capacity}
                      onChange={(e) => update("capacity", e.target.value)}
                    />
                  </label>
                  <p className="section-note" style={{ marginTop: "6px" }}>
                    Once registrations reach this ceiling, the event will automatically display "Sold Out".
                  </p>
                </div>
              ) : (
                <>
                  <div className="section-heading" style={{ marginTop: "16px" }}>
                    <p className="section-note">
                      Create packages such as Platinum Rider, Pillion Explorer, or Pit Pass. Total capacity is automatically computed from package seats.
                    </p>
                    <button
                      type="button"
                      className="builder-add-action-btn"
                      onClick={() =>
                        update("packages", [...form.packages, emptyPackage()])
                      }
                    >
                      <Plus size={15} /> 
                      <span>Add Package Tier</span>
                    </button>
                  </div>

                  {!form.packages.length && (
                    <div className="empty-builder-state">
                      <Ticket size={32} className="empty-state-icon" />
                      <h4>No pricing packages defined</h4>
                      <p>Click "Add Package Tier" above to define ticket pricing and inclusions.</p>
                    </div>
                  )}

                  {form.packages.map((item, pIdx) => (
                    <div className="builder-item-card package-item-card" key={item.id}>
                      <div className="builder-card-body">
                        <div className="package-tier-header">
                          <span className="package-tier-badge">Tier #{pIdx + 1}</span>
                          <span className="package-tier-title-preview">{item.name || "Untitled Tier"}</span>
                        </div>

                        <div className="form-grid package-grid">
                          <label className="form-field">
                            <span className="field-label-text">
                              Package Name <em className="required-star">*</em>
                            </span>
                            <input
                              required
                              className="form-input"
                              value={item.name}
                              placeholder="e.g. Platinum Rider"
                              onChange={(e) =>
                                updatePackage(item.id, "name", e.target.value)
                              }
                            />
                          </label>

                          <label className="form-field">
                            <span className="field-label-text">
                              Price (₹) <em className="required-star">*</em>
                            </span>
                            <input
                              required
                              type="number"
                              min="0"
                              className="form-input"
                              placeholder="25000"
                              value={item.price}
                              onChange={(e) =>
                                updatePackage(item.id, "price", e.target.value)
                              }
                            />
                          </label>

                          <label className="form-field">
                            <span className="field-label-text">Discount Price (₹)</span>
                            <input
                              type="number"
                              min="0"
                              className="form-input"
                              placeholder="Optional promo price"
                              value={item.discountPrice || ""}
                              onChange={(e) =>
                                updatePackage(item.id, "discountPrice", e.target.value)
                              }
                            />
                          </label>

                          <label className="form-field">
                            <span className="field-label-text">
                              Available Seats <em className="required-star">*</em>
                            </span>
                            <input
                              required
                              type="number"
                              min="1"
                              className="form-input"
                              placeholder="50"
                              value={item.seats}
                              onChange={(e) =>
                                updatePackage(item.id, "seats", e.target.value)
                              }
                            />
                          </label>
                        </div>

                        <div className="form-grid two" style={{ marginTop: "12px" }}>
                          <label className="form-field">
                            <span className="field-label-text">
                              Ticket For Category <em className="required-star">*</em>
                            </span>
                            <div className="select-input-container">
                              <select
                                required
                                className="form-select"
                                value={item.ticketFor || ""}
                                onChange={(e) =>
                                  updatePackage(item.id, "ticketFor", e.target.value)
                                }
                              >
                                <option value="">Select ticket classification</option>
                                {(ticketForCategoryMapping[form.category] || ticketForCategoryMapping.default).map((option) => (
                                  <option key={option} value={option}>{option}</option>
                                ))}
                              </select>
                              <ChevronDown size={14} className="select-dropdown-chevron" />
                            </div>
                          </label>

                          <label className="form-field">
                            <span className="field-label-text">Short Description</span>
                            <input
                              type="text"
                              maxLength={120}
                              className="form-input"
                              value={item.shortDescription}
                              placeholder="Brief highlight of package (max 120 chars)"
                              onChange={(e) =>
                                updatePackage(item.id, "shortDescription", e.target.value)
                              }
                            />
                          </label>
                        </div>

                        <div className="form-grid two" style={{ marginTop: "12px" }}>
                          <label className="form-field">
                            <span className="field-label-text">Inclusions (per point)</span>
                            <textarea
                              rows="3"
                              className="form-textarea"
                              value={item.inclusions}
                              placeholder="VIP paddock access&#10;Buffet lunch & hydration&#10;Exclusive team jersey..."
                              onChange={(e) =>
                                updatePackage(item.id, "inclusions", e.target.value)
                              }
                            />
                          </label>

                          <label className="form-field">
                            <span className="field-label-text">Exclusions (per point)</span>
                            <textarea
                              rows="3"
                              className="form-textarea"
                              value={item.exclusions}
                              placeholder="Motorcycle rental&#10;Fuel expenses&#10;Personal hotel accommodations..."
                              onChange={(e) =>
                                updatePackage(item.id, "exclusions", e.target.value)
                              }
                            />
                          </label>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="card-del-btn"
                        aria-label="Remove package"
                        onClick={() =>
                          update(
                            "packages",
                            form.packages.filter(
                              (entry) => entry.id !== item.id
                            )
                          )
                        }
                        title="Remove package"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </>
              )}
            </section>
          )}

          {/* STEP 6: COUPONS */}
          {currentStep === 6 && (
            <section className="form-section">
              <div className="section-heading">
                <div className="section-title-wrap">
                  <div className="section-title-icon-box">
                    <Percent size={18} />
                  </div>
                  <div>
                    <h2 className="section-main-heading">Discount Coupons</h2>
                    <p className="section-sub-heading">
                      Issue early-bird promo codes, sponsor rebates, or club member percentage discounts.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  className="builder-add-action-btn"
                  onClick={() =>
                    update("coupons", [...form.coupons, emptyCoupon()])
                  }
                >
                  <Plus size={15} />
                  <span>Add Coupon</span>
                </button>
              </div>

              {form?.coupons?.length === 0 ? (
                <div className="empty-builder-state">
                  <Percent size={32} className="empty-state-icon" />
                  <h4>No discount coupons added yet</h4>
                  <p>Click "Add Coupon" above to create promotional discount codes.</p>
                </div>
              ) : (
                <>
                  {form.coupons.map((item, index) => (
                    <div key={item.id} className="builder-item-card coupon-item-card">
                      <div className="builder-card-body">
                        <div className="package-tier-header">
                          <span className="package-tier-badge coupon-badge">Coupon #{index + 1}</span>
                          <span className="package-tier-title-preview">{item.code || "UNTITLED CODE"}</span>
                        </div>

                        <div className="form-grid two">
                          <label className="form-field">
                            <span className="field-label-text">Coupon Code</span>
                            <input
                              type="text"
                              className="form-input text-uppercase font-mono"
                              value={item.code}
                              placeholder="e.g. MONSOON20"
                              onChange={(e) =>
                                updateCoupon(item.id, "code", e.target.value.toUpperCase())
                              }
                            />
                          </label>

                          <label className="form-field">
                            <span className="field-label-text">Discount Type</span>
                            <div className="select-input-container">
                              <select
                                className="form-select"
                                value={item.discountType}
                                onChange={(e) =>
                                  updateCoupon(item.id, "discountType", e.target.value)
                                }
                              >
                                <option value="percentage">Percentage Off (%)</option>
                                <option value="fixed">Fixed Amount Off (₹)</option>
                              </select>
                              <ChevronDown size={14} className="select-dropdown-chevron" />
                            </div>
                          </label>
                        </div>

                        <div className="form-grid three" style={{ marginTop: "12px" }}>
                          <label className="form-field">
                            <span className="field-label-text">Discount Value</span>
                            <input
                              type="number"
                              className="form-input"
                              value={item.discountValue}
                              placeholder={
                                item.discountType === "percentage" ? "e.g. 20 (%)" : "e.g. 500 (₹)"
                              }
                              onChange={(e) =>
                                updateCoupon(item.id, "discountValue", e.target.value)
                              }
                            />
                          </label>

                          <label className="form-field">
                            <span className="field-label-text">Max Redemptions (Optional)</span>
                            <input
                              type="number"
                              className="form-input"
                              value={item.maxUses}
                              placeholder="e.g. 100 uses"
                              onChange={(e) =>
                                updateCoupon(item.id, "maxUses", e.target.value)
                              }
                            />
                          </label>

                          <label className="form-field">
                            <span className="field-label-text">Valid Until (Optional)</span>
                            <input
                              type="date"
                              className="form-input"
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
                        className="card-del-btn"
                        aria-label="Remove coupon"
                        onClick={() =>
                          update(
                            "coupons",
                            form.coupons.filter((c) => c.id !== item.id)
                          )
                        }
                        title="Remove coupon"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </>
              )}
            </section>
          )}

          {/* STEP 7: ADD-ONS */}
          {currentStep === 7 && (
            <section className="form-section">
              <div className="section-heading">
                <div className="section-title-wrap">
                  <div className="section-title-icon-box">
                    <Gift size={18} />
                  </div>
                  <div>
                    <h2 className="section-main-heading">Optional Add-ons & Extras</h2>
                    <p className="section-sub-heading">
                      Offer optional upgrades like road assistance insurance, commemorative apparel, or bike transport.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  className="builder-add-action-btn"
                  onClick={() =>
                    update("addons", [...form.addons, emptyAddon()])
                  }
                >
                  <Plus size={15} />
                  <span>Add Add-on</span>
                </button>
              </div>

              {form?.addons?.length === 0 ? (
                <div className="empty-builder-state">
                  <Gift size={32} className="empty-state-icon" />
                  <h4>No optional add-ons defined</h4>
                  <p>Click "Add Add-on" above to configure ancillary upgrades for participants.</p>
                </div>
              ) : (
                <>
                  {form.addons.map((item, index) => (
                    <div key={item.id} className="builder-item-card addon-item-card">
                      <div className="builder-card-body">
                        <div className="package-tier-header">
                          <span className="package-tier-badge addon-badge">Add-on #{index + 1}</span>
                          <span className="package-tier-title-preview">{item.name || "Untitled Extra"}</span>
                        </div>

                        <div className="form-grid two">
                          <label className="form-field">
                            <span className="field-label-text">Add-on Title</span>
                            <input
                              type="text"
                              className="form-input"
                              value={item.name}
                              placeholder="e.g. Emergency Roadside Assistance & Towing"
                              onChange={(e) =>
                                updateAddon(item.id, "name", e.target.value)
                              }
                            />
                          </label>

                          <label className="form-field">
                            <span className="field-label-text">Price (₹)</span>
                            <input
                              type="number"
                              className="form-input"
                              value={item.price}
                              placeholder="e.g. 999"
                              onChange={(e) =>
                                updateAddon(item.id, "price", e.target.value)
                              }
                            />
                          </label>
                        </div>

                        <label className="form-field" style={{ marginTop: "12px" }}>
                          <span className="field-label-text">Service Inclusions / Description</span>
                          <input
                            type="text"
                            className="form-input"
                            value={item.description}
                            placeholder="e.g. Covers flat-bed breakdown support, spare fuel delivery, and medic transport."
                            onChange={(e) =>
                              updateAddon(item.id, "description", e.target.value)
                            }
                          />
                        </label>
                      </div>

                      <button
                        type="button"
                        className="card-del-btn"
                        aria-label="Remove add-on"
                        onClick={() =>
                          update(
                            "addons",
                            form.addons.filter((a) => a.id !== item.id)
                          )
                        }
                        title="Remove add-on"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </>
              )}
            </section>
          )}

          {/* STEP 8: TERMS & CONDITIONS */}
          {currentStep === 8 && (
            <section className="form-section">
              <div className="section-title-wrap">
                <div className="section-title-icon-box">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <h2 className="section-main-heading">Terms & Conditions</h2>
                  <p className="section-sub-heading">
                    Disclaimers, cancellation policies, weather indemnity, and event safety protocols.
                  </p>
                </div>
              </div>

              <label className="form-field" style={{ marginTop: "16px" }}>
                <span className="field-label-text">Terms, Cancellation & Safety Regulations</span>
                <textarea
                  rows="8"
                  className="form-textarea"
                  value={form.termsAndConditions}
                  placeholder="Enter detailed legal and operational terms for participants (refund policy, mandatory waiver requirements, alcohol/drug zero-tolerance, etc.)..."
                  onChange={(e) => update("termsAndConditions", e.target.value)}
                />
              </label>
            </section>
          )}

          {/* STEP 9: PREVIEW */}
          {currentStep === 9 && (
            <EventPreview form={form} files={files} progress={progress} />
          )}

          {/* FIXED FLOATING POPUP BAR AT BOTTOM (PREVIOUS & NEXT ACTIONS) */}
          <div className="builder-floating-dock-bar">
            <button
              type="button"
              className="dock-action-btn prev"
              disabled={currentStep === 0 || saving}
              onClick={handlePrevStep}
              title={currentStep === 0 ? "You are on the first step" : "Return to previous step"}
            >
              <ChevronLeft size={16} />
              <span>Previous</span>
            </button>

            <div className="dock-step-tracker">
              <span className="dock-step-counter-pill">
                Step {currentStep + 1} of {steps.length}
              </span>
              <span className="dock-step-title-text">
                {steps[currentStep]}
              </span>
            </div>

            <div className="dock-action-right">
              {currentStep < steps.length - 1 ? (
                <button
                  type="button"
                  className="dock-action-btn next"
                  onClick={handleNextStep}
                  title="Proceed to next step"
                >
                  <span>{currentStep === steps.length - 2 ? "Preview Event" : "Next"}</span>
                  {currentStep === steps.length - 2 ? <Eye size={16} /> : <ChevronRight size={16} />}
                </button>
              ) : (
                <button type="submit" className="dock-action-btn submit" disabled={saving}>
                  {saving ? (
                    <>
                      <span className="dock-spinner-icon" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={16} />
                      <span>{eventId ? "Update Event" : "Save as Draft"}</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </form>
      </main>
    </AppLayout>
  );
};

const MediaInput = ({
  title,
  required,
  aspectBadge,
  aspectRatio = "auto",
  hint,
  accept = "image/jpeg,image/png,image/webp",
  file,
  existing,
  onChange,
  onDelete,
}) => {
  const fileInputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [dimensions, setDimensions] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const isPdf = Boolean(
    (file && file.type === "application/pdf") ||
    (typeof existing === "string" && existing.toLowerCase().includes(".pdf"))
  );

  useEffect(() => {
    if (file instanceof File) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      if (file.type.startsWith("image/")) {
        const img = new window.Image();
        img.onload = () => {
          setDimensions({
            width: img.naturalWidth || img.width,
            height: img.naturalHeight || img.height,
          });
        };
        img.src = url;
      } else {
        setDimensions(null);
      }
      return () => URL.revokeObjectURL(url);
    } else if (typeof existing === "string" && existing) {
      setPreviewUrl(existing);
      setDimensions(null);
    } else {
      setPreviewUrl("");
      setDimensions(null);
    }
  }, [file, existing]);

  const hasMedia = Boolean(previewUrl);

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files || []);
    if (selected.length > 0) {
      onChange(selected);
    }
    e.target.value = "";
  };

  const handleChangeClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  const handleDeleteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (onDelete) onDelete();
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files || []);
    if (droppedFiles.length > 0) {
      onChange(droppedFiles);
    }
  };

  return (
    <div className={`media-upload-container ${hasMedia ? "has-media" : ""}`}>
      <input
        ref={fileInputRef}
        type="file"
        className="native-hidden-file-input"
        accept={accept}
        onChange={handleFileChange}
      />

      {!hasMedia ? (
        <div
          className={`media-input-box ${isDragging ? "drag-active" : ""}`}
          onClick={handleChangeClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleChangeClick(e);
            }
          }}
        >
          <div className="media-input-top-bar">
            <span className="media-icon-badge">
              {accept.includes("pdf") ? <FileText size={18} /> : <Image size={18} />}
            </span>
            <div className="media-chips-group">
              {aspectBadge && <span className="media-aspect-chip">{aspectBadge}</span>}
              {required && <span className="media-required-chip">Required</span>}
            </div>
          </div>

          <div className="media-text-meta">
            <strong className="media-label-title">{title}</strong>
            <p className="media-hint-caption">{hint}</p>
          </div>

          <div className="media-upload-pill">
            <UploadCloud size={14} />
            <span>Choose File</span>
          </div>
        </div>
      ) : (
        <div className="media-preview-card">
          <div className="media-preview-header">
            <div className="media-preview-header-meta">
              <span className="media-icon-badge small">
                {isPdf ? <FileText size={16} /> : <Image size={16} />}
              </span>
              <div>
                <div className="media-header-title-row">
                  <strong className="media-preview-title">{title}</strong>
                  {aspectBadge && <span className="media-aspect-chip">{aspectBadge}</span>}
                </div>
                <span className="media-meta-subtext">
                  {dimensions
                    ? `${dimensions.width} × ${dimensions.height} px`
                    : file?.name || "Uploaded image"}
                </span>
              </div>
            </div>

            <div className="media-actions-row">
              <button
                type="button"
                className="media-action-button change-btn"
                onClick={handleChangeClick}
                title="Change image"
              >
                <UploadCloud size={13} />
                <span>Change</span>
              </button>
              <button
                type="button"
                className="media-action-button delete-btn"
                onClick={handleDeleteClick}
                title="Delete image"
              >
                <Trash2 size={13} />
                <span>Delete</span>
              </button>
            </div>
          </div>

          <div className="media-preview-frame-wrap">
            {isPdf ? (
              <div className="media-pdf-preview-box">
                <FileText size={32} className="media-pdf-icon" />
                <div className="media-pdf-details">
                  <strong className="media-pdf-name">{file?.name || "Route Map (PDF)"}</strong>
                  <span className="media-pdf-badge">PDF Document</span>
                </div>
              </div>
            ) : (
              <div
                className={`media-image-frame ${
                  aspectRatio === "16/9"
                    ? "ratio-16-9"
                    : aspectRatio === "1/1"
                    ? "ratio-1-1"
                    : ""
                }`}
              >
                <img src={previewUrl} alt={title} className="media-frame-img" />
                {aspectRatio === "16/9" && (
                  <div className="media-badge-overlay-16-9">
                    <CheckCircle2 size={12} />
                    <span>16:9 Banner Verified</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const GalleryFileThumbnail = ({ file, index, onDelete }) => {
  const [url, setUrl] = useState("");
  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  return (
    <div className="gallery-thumbnail-card">
      {url ? (
        <img src={url} alt={file.name} className="gallery-thumb-img" />
      ) : (
        <div className="gallery-thumb-placeholder">Loading...</div>
      )}
      <div className="gallery-thumb-overlay">
        <span className="gallery-index-tag">#{index}</span>
        <button
          type="button"
          className="gallery-thumb-del-btn"
          onClick={onDelete}
          title={`Delete photo #${index}`}
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
};

const GalleryMediaInput = ({
  title = "Gallery Photos",
  required,
  hint,
  accept = "image/jpeg,image/png,image/webp",
  files = [],
  existing = [],
  onAdd,
  onDeleteFile,
  onDeleteExisting,
  onClearAll,
}) => {
  const fileInputRef = useRef(null);
  const totalCount = existing.length + files.length;
  const hasRoom = totalCount < 6;

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files || []);
    if (selected.length > 0) {
      onAdd(selected);
    }
    e.target.value = "";
  };

  const handleOpenPicker = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="media-gallery-section-box">
      <input
        ref={fileInputRef}
        type="file"
        className="native-hidden-file-input"
        accept={accept}
        multiple
        onChange={handleFileChange}
      />

      <div className="media-gallery-header">
        <div className="media-gallery-header-left">
          <span className="media-icon-badge">
            <Image size={18} />
          </span>
          <div>
            <div className="media-gallery-title-row">
              <strong className="media-label-title">{title}</strong>
              {required && <span className="media-required-chip">5 required, max 6</span>}
            </div>
            <p className="media-hint-caption">{hint}</p>
          </div>
        </div>

        <div className="media-gallery-header-right">
          <span
            className={`gallery-counter-pill ${
              totalCount >= 5 && totalCount <= 6
                ? "status-valid"
                : totalCount > 0
                ? "status-warning"
                : "status-empty"
            }`}
          >
            {totalCount >= 5 && totalCount <= 6 ? (
              <CheckCircle2 size={13} />
            ) : (
              <AlertCircle size={13} />
            )}
            <span>
              {totalCount} / 6 Photos
              {totalCount < 5 && ` (${5 - totalCount} more required)`}
            </span>
          </span>

          {totalCount > 0 && (
            <button
              type="button"
              className="gallery-clear-all-btn"
              onClick={onClearAll}
              title="Remove all gallery photos"
            >
              <Trash2 size={13} />
              <span>Clear All</span>
            </button>
          )}
        </div>
      </div>

      {totalCount === 0 ? (
        <div
          className="media-input-box gallery-dropzone"
          onClick={handleOpenPicker}
          role="button"
          tabIndex={0}
        >
          <div className="gallery-empty-content">
            <UploadCloud size={28} className="gallery-empty-icon" />
            <strong>Upload Event Gallery Photos</strong>
            <p>Select 5 to 6 high resolution showcase photos (JPG/PNG)</p>
            <div className="media-upload-pill">
              <UploadCloud size={14} />
              <span>Choose 5 to 6 Photos</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="gallery-preview-grid">
          {/* Saved existing photos */}
          {existing.map((url, idx) => (
            <div key={`existing-${idx}`} className="gallery-thumbnail-card">
              <img src={url} alt={`Gallery item ${idx + 1}`} className="gallery-thumb-img" />
              <div className="gallery-thumb-overlay">
                <span className="gallery-index-tag">#{idx + 1}</span>
                <button
                  type="button"
                  className="gallery-thumb-del-btn"
                  onClick={() => onDeleteExisting(idx)}
                  title={`Delete photo #${idx + 1}`}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}

          {/* Newly chosen files */}
          {files.map((file, idx) => (
            <GalleryFileThumbnail
              key={`${file.name}-${file.lastModified}-${idx}`}
              file={file}
              index={existing.length + idx + 1}
              onDelete={() => onDeleteFile(idx)}
            />
          ))}

          {/* Add more slot */}
          {hasRoom && (
            <button
              type="button"
              className="gallery-add-tile-btn"
              onClick={handleOpenPicker}
              title="Add more photos"
            >
              <Plus size={20} />
              <span>Add Photo</span>
              <small>{6 - totalCount} slot{6 - totalCount > 1 ? "s" : ""} left</small>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

const CategoryDetailInput = ({ field, value, onChange }) => {
  if (field.type === "boolean")
    return (
      <label className="boolean-field-card">
        <input
          type="checkbox"
          className="custom-toggle-checkbox"
          checked={Boolean(value)}
          onChange={(e) => onChange(e.target.checked)}
        />
        <div className="boolean-info-col">
          <span className="boolean-title-label">
            {field.label}
            {field.required && <em className="required-star"> *</em>}
          </span>
          {field.unit && <small className="field-unit-note">{field.unit}</small>}
        </div>
      </label>
    );

  if (field.type === "select")
    return (
      <label className="form-field">
        <span className="field-label-text">
          {field.label}
          {field.required && <em className="required-star"> *</em>}
        </span>
        <div className="select-input-container">
          <select
            className="form-select"
            required={field.required}
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
          >
            <option value="">Select {field.label.toLowerCase()}</option>
            {field.options.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          <ChevronDown size={14} className="select-dropdown-chevron" />
        </div>
      </label>
    );

  if (field.type === "textarea")
    return (
      <label className="form-field category-wide">
        <span className="field-label-text">
          {field.label}
          {field.required && <em className="required-star"> *</em>}
        </span>
        <textarea
          className="form-textarea"
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
        <span className="field-label-text">
          {field.label}
          {field.required && <em className="required-star"> *</em>}
        </span>
        <textarea
          className="form-textarea"
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
        <small className="field-help-caption">{help}</small>
      </label>
    );
  }

  return (
    <label className="form-field">
      <span className="field-label-text">
        {field.label}
        {field.required && <em className="required-star"> *</em>}
      </span>
      <div className="input-with-unit-wrap">
        <input
          className="form-input"
          required={field.required}
          type={field.type}
          min={field.type === "number" ? "0" : undefined}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
        />
        {field.unit && <span className="field-unit-tag">{field.unit}</span>}
      </div>
    </label>
  );
};

const Review = ({ label, value }) => (
  <div className="review-pill-card">
    <span className="review-label">{label}</span>
    <strong className="review-value">{value || "Not provided"}</strong>
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
    <div className="preview-top-badge-row">
      <span className="preview-badge">Draft preview</span>
      <span className="preview-category-chip">
        {[form.category, form.subCategory].filter(Boolean).join(" · ")}
      </span>
    </div>

    <h2 className="preview-event-title">{form.title || "Untitled event"}</h2>

    <div className="preview-banner">
      <PreviewImage
        file={files.banner}
        src={form.bannerImage}
        alt="Event banner"
      />
    </div>

    {/* Chosen Ticket Design in Event Preview */}
    <div style={{ marginBottom: "24px" }}>
      <h3 className="preview-block-title">Official Event Ticket Pass</h3>
      <TicketPassView
        designId={form.ticketDesign || "design-1"}
        templateUrl={form.ticketTemplateUrl || ""}
        event={form}
        participant={{
          name: "Sample Participant",
          phone: "+91 98765 43210",
          email: "rider@nitroxx.com",
          bibNumber: "007",
          tickets: form.ticketType === "Free" ? 1 : 2,
        }}
        ticketsCount={form.ticketType === "Free" ? 1 : 2}
        ticketNumber="NX-PREVIEW-PASS"
        surroundBg="#111827"
      />
    </div>

    <div className="review-grid">
      <Review
        label="Date & Time"
        value={`${form.startDate} ${form.startTime} — ${form.endDate || form.startDate
          } ${form.endTime}`}
      />
      <Review
        label="Location & Venue"
        value={[form.venue, form.address, form.city, form.state]
          .filter(Boolean)
          .join(", ")}
      />
      <Review
        label="Registration Window"
        value={`${form.registrationStart} — ${form.registrationEnd}`}
      />
      <Review
        label="Ticket Configuration"
        value={
          form.ticketType === "Free"
            ? `Free · ${form.capacity} participants capacity`
            : `${form.packages.length} tier packages`
        }
      />
    </div>

    <div className="preview-content">
      <div>
        <h3 className="preview-block-title">About this event</h3>
        <p className="preview-desc-body">{form.description || "No description added."}</p>
      </div>
      <div className="preview-thumbnail">
        <PreviewImage
          file={files.thumbnail}
          src={form.thumbnailImage}
          alt="Event thumbnail"
        />
      </div>
    </div>

    <h3 className="preview-block-title">Gallery Photos</h3>
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
        <h3 className="preview-block-title">Itinerary Schedule</h3>
        <div className="preview-list">
          {form.itinerary.map((item) => (
            <div key={item.id} className="preview-list-card">
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
        <h3 className="preview-block-title">Ticket Packages</h3>
        <div className="preview-list">
          {form.packages.map((item) => (
            <div key={item.id} className="preview-list-card">
              <strong>
                {item.name} · ₹{item.price} {item.discountPrice ? `(Discounted: ₹${item.discountPrice})` : ""}
              </strong>
              <p>
                {item.ticketFor && `${item.ticketFor} · `}{item.seats} seats
              </p>
              {item.shortDescription && <p>{item.shortDescription}</p>}
              {item.inclusions && (
                <div style={{ marginTop: "6px" }}>
                  <strong>Inclusions:</strong>
                  <p style={{ whiteSpace: "pre-wrap", marginTop: "3px" }}>{item.inclusions}</p>
                </div>
              )}
              {item.exclusions && (
                <div style={{ marginTop: "6px" }}>
                  <strong>Exclusions:</strong>
                  <p style={{ whiteSpace: "pre-wrap", marginTop: "3px" }}>{item.exclusions}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </>
    )}

    {form.coupons && form.coupons.length > 0 && (
      <>
        <h3 className="preview-block-title">Coupons</h3>
        <div className="preview-list">
          {form.coupons.map((item) => (
            <div key={item.id} className="preview-list-card">
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
        <h3 className="preview-block-title">Add-ons</h3>
        <div className="preview-list">
          {form.addons.map((item) => (
            <div key={item.id} className="preview-list-card">
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
        <h3 className="preview-block-title">Terms & Conditions</h3>
        <div className="preview-list">
          <div className="preview-terms-box">
            {form.termsAndConditions}
          </div>
        </div>
      </>
    )}

    {progress > 0 && (
      <p className="upload-progress">Uploading files: {progress}%</p>
    )}
    <p className="section-note" style={{ marginTop: "16px" }}>
      Saving will add this event as a draft in My Events.
    </p>
  </section>
);

export default EventForm;
