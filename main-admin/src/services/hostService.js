import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  addDoc
} from 'firebase/firestore';
import { db } from '../firebase/firebase.config';

export const HOST_APPLICATIONS_COLLECTION = 'host_applications';
export const EVENT_HOST_COLLECTION = 'event_host';
export const NOTIFICATIONS_COLLECTION = 'notifications';

/**
 * Real-time listener for host applications
 */
export const subscribeToHostApplications = (onUpdate, onError) => {
  const q = query(
    collection(db, HOST_APPLICATIONS_COLLECTION),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const applications = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data()
      }));
      onUpdate(applications);
    },
    (err) => {
      console.warn('Real-time listener on ordered host_applications failed, trying fallback without sort:', err);
      // Fallback query without orderBy in case index is building
      const fallbackQ = query(collection(db, HOST_APPLICATIONS_COLLECTION));
      return onSnapshot(
        fallbackQ,
        (snapshot) => {
          const applications = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data()
          }));
          onUpdate(applications);
        },
        onError
      );
    }
  );
};

/**
 * Real-time listener for approved event hosts from event_host collection
 */
export const subscribeToEventHosts = (onUpdate, onError) => {
  const q = query(collection(db, EVENT_HOST_COLLECTION));
  return onSnapshot(
    q,
    (snapshot) => {
      const hosts = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data()
      }));
      onUpdate(hosts);
    },
    onError
  );
};

/**
 * Approve Host Application Flow:
 * 1. Guarantees NO DUPLICATE document inside event_host
 * 2. Creates/updates event_host record using all application data
 * 3. Updates application status to 'Approved', approvedAt, approvedBy, isActive = true
 * 4. Sends a success notification
 */
export const approveHostApplication = async ({ application, adminUser }) => {
  if (!application || !application.id) {
    throw new Error('Valid application data is required for approval.');
  }

  const adminName = adminUser?.displayName || adminUser?.email || 'Nitroxx Admin';
  const email = (application.email || '').trim().toLowerCase();
  const phone = (application.phone || application.phoneNumber || '').trim();
  const hostUid = application.uid || application.userId || application.id;

  // STEP 1: Check to never duplicate host documents inside event_host
  let targetHostDocId = null;
  let existingHostData = null;

  // A. Check by direct UID/ID first
  try {
    const directRef = doc(db, EVENT_HOST_COLLECTION, hostUid);
    const directSnap = await getDoc(directRef);
    if (directSnap.exists()) {
      targetHostDocId = hostUid;
      existingHostData = directSnap.data();
    }
  } catch (e) {
    console.warn('Direct check on event_host doc failed:', e);
  }

  // B. If not found by ID, query by email
  if (!targetHostDocId && email) {
    try {
      const emailQuery = query(
        collection(db, EVENT_HOST_COLLECTION),
        where('email', '==', email)
      );
      const emailSnap = await getDocs(emailQuery);
      if (!emailSnap.empty) {
        targetHostDocId = emailSnap.docs[0].id;
        existingHostData = emailSnap.docs[0].data();
      }
    } catch (e) {
      console.warn('Email query check on event_host failed:', e);
    }
  }

  // C. Fallback: query by phone
  if (!targetHostDocId && phone) {
    try {
      const phoneQuery = query(
        collection(db, EVENT_HOST_COLLECTION),
        where('phone', '==', phone)
      );
      const phoneSnap = await getDocs(phoneQuery);
      if (!phoneSnap.empty) {
        targetHostDocId = phoneSnap.docs[0].id;
        existingHostData = phoneSnap.docs[0].data();
      }
    } catch (e) {
      console.warn('Phone query check on event_host failed:', e);
    }
  }

  // Determine final document ID to use for event_host
  const finalHostDocId = targetHostDocId || hostUid;

  // STEP 2: Prepare complete event_host record using all application data
  const hostRecord = {
    uid: finalHostDocId,
    fullName: application.fullName || application.name || existingHostData?.fullName || 'Nitroxx Host',
    name: application.fullName || application.name || existingHostData?.name || 'Nitroxx Host',
    displayName: application.fullName || application.name || existingHostData?.displayName || 'Nitroxx Host',
    email: email || existingHostData?.email || '',
    phone: phone || existingHostData?.phone || '',
    alternatePhone: application.alternatePhone || '',
    organizationName: application.organization || application.organizationName || existingHostData?.organizationName || '',
    organizationType: application.organizationType || 'Club / Organization',
    city: application.city || existingHostData?.city || '',
    state: application.state || existingHostData?.state || '',
    address: application.address || existingHostData?.address || '',
    pinCode: application.pinCode || application.pincode || '',
    country: application.country || 'India',
    photoURL: application.profilePhoto || application.photoURL || existingHostData?.photoURL || '',
    bio: application.bio || application.about || existingHostData?.bio || '',
    role: 'Host',
    isVerified: true,
    isActive: true,
    status: 'active',
    gst: application.gst || application.gstNumber || existingHostData?.gst || '',
    gstNumber: application.gst || application.gstNumber || existingHostData?.gstNumber || '',
    pan: application.pan || application.panNumber || existingHostData?.pan || '',
    panNumber: application.pan || application.panNumber || existingHostData?.panNumber || '',
    documents: application.documents || existingHostData?.documents || [],
    applicationId: application.id,
    approvedAt: serverTimestamp(),
    approvedBy: adminName,
    updatedAt: serverTimestamp(),
    createdAt: existingHostData?.createdAt || application.createdAt || serverTimestamp(),
    totalEventsHosted: existingHostData?.totalEventsHosted ?? 0,
    totalEventsJoined: existingHostData?.totalEventsJoined ?? 0,
    socialLinks: {
      instagram: application.socialLinks?.instagram || existingHostData?.socialLinks?.instagram || '',
      website: application.socialLinks?.website || existingHostData?.socialLinks?.website || '',
      linkedin: application.socialLinks?.linkedin || existingHostData?.socialLinks?.linkedin || ''
    }
  };

  // STEP 3: Save into event_host (create or update, no duplicates)
  await setDoc(doc(db, EVENT_HOST_COLLECTION, finalHostDocId), hostRecord, { merge: true });

  // STEP 4: Update application document status in host_applications
  await updateDoc(doc(db, HOST_APPLICATIONS_COLLECTION, application.id), {
    status: 'Approved',
    approvedAt: serverTimestamp(),
    approvedBy: adminName,
    isActive: true,
    hostDocId: finalHostDocId,
    reviewedAt: serverTimestamp(),
    reviewedBy: adminName,
    rejectionReason: null,
    updatedAt: serverTimestamp()
  });

  // STEP 5: Send success notification
  try {
    await addDoc(collection(db, NOTIFICATIONS_COLLECTION), {
      userId: finalHostDocId,
      recipientId: finalHostDocId,
      type: 'host_approval',
      title: 'Host Application Approved!',
      body: `Congratulations! Your host application for ${application.organization || application.fullName} has been approved. You can now host events on Nitroxx.`,
      read: false,
      createdAt: serverTimestamp()
    });
  } catch (notifErr) {
    console.warn('Could not write notification (non-fatal):', notifErr);
  }

  return { hostDocId: finalHostDocId, hostRecord };
};

/**
 * Reject Host Application Flow:
 * 1. Saves status = 'Rejected'
 * 2. Saves rejectionReason, reviewedAt, reviewedBy
 * 3. Does NOT create event_host document
 * 4. Sends rejection notification
 */
export const rejectHostApplication = async ({ application, reason, adminUser }) => {
  if (!application || !application.id) {
    throw new Error('Valid application data is required for rejection.');
  }
  if (!reason || !reason.trim()) {
    throw new Error('A rejection reason must be provided.');
  }

  const adminName = adminUser?.displayName || adminUser?.email || 'Nitroxx Admin';

  // Update application status
  await updateDoc(doc(db, HOST_APPLICATIONS_COLLECTION, application.id), {
    status: 'Rejected',
    rejectionReason: reason.trim(),
    reviewedAt: serverTimestamp(),
    reviewedBy: adminName,
    isActive: false,
    updatedAt: serverTimestamp()
  });

  // Send notification to applicant
  const hostUid = application.uid || application.userId || application.id;
  try {
    await addDoc(collection(db, NOTIFICATIONS_COLLECTION), {
      userId: hostUid,
      recipientId: hostUid,
      type: 'host_rejection',
      title: 'Host Application Update',
      body: `Your host application was reviewed and not approved at this time. Reason: ${reason.trim()}`,
      read: false,
      createdAt: serverTimestamp()
    });
  } catch (notifErr) {
    console.warn('Could not write notification (non-fatal):', notifErr);
  }

  return true;
};

/**
 * Delete application (admin utility)
 */
export const deleteHostApplication = async (applicationId) => {
  await deleteDoc(doc(db, HOST_APPLICATIONS_COLLECTION, applicationId));
};

/**
 * Seed Sample Applications for immediate verification and testing
 */
export const seedSampleHostApplications = async () => {
  const sampleApplications = [
    {
      fullName: 'Rajesh Sharma',
      email: 'rajesh.sharma@apexriders.in',
      phone: '+91 98201 44521',
      alternatePhone: '+91 98201 44522',
      organization: 'Apex Motorcycle Riding Club',
      organizationType: 'Riding Community & Club',
      bio: 'Leading community of 1,200+ sport tourers and track enthusiasts across western India organizing safety rallies and mountain trails.',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      pinCode: '400050',
      address: 'Plot 42, Bandra Reclamation, Hill Road, Bandra West, Mumbai, MH',
      gst: '27AABCU9603R1ZM',
      pan: 'AABCU9603R',
      profilePhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240&auto=format&fit=crop&q=80',
      status: 'Pending',
      isActive: false,
      createdAt: new Date(),
      appliedDate: new Date(),
      socialLinks: {
        website: 'https://apexriders.in',
        instagram: 'https://instagram.com/apexriders_in',
        linkedin: 'https://linkedin.com/company/apex-riders'
      },
      documents: [
        {
          name: 'Aadhaar Identity Proof',
          type: 'id_proof',
          url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&auto=format&fit=crop&q=80',
          mimeType: 'image/jpeg',
          verified: true
        },
        {
          name: 'Permanent Account Number (PAN) Card',
          type: 'pan_card',
          url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=80',
          mimeType: 'image/jpeg',
          verified: true
        },
        {
          name: 'GST Registration Form REG-06',
          type: 'gst_certificate',
          url: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=800&auto=format&fit=crop&q=80',
          mimeType: 'application/pdf',
          verified: false
        },
        {
          name: 'Motorsport Federation Club Certificate',
          type: 'club_license',
          url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&auto=format&fit=crop&q=80',
          mimeType: 'application/pdf',
          verified: false
        }
      ]
    },
    {
      fullName: 'Vikramaditya Rathore',
      email: 'vikram@re-explorers.org',
      phone: '+91 94140 23891',
      organization: 'Desert Nomads Riding Association',
      organizationType: 'Adventure Touring Org',
      bio: 'Pioneers in high-altitude Himalayan expeditions and Thar desert rallies with 10+ years experience in curated motorcycle adventures.',
      city: 'Jaipur',
      state: 'Rajasthan',
      country: 'India',
      pinCode: '302001',
      address: '77, C-Scheme, Ashok Nagar, Jaipur, Rajasthan',
      gst: '08AAGCD8745E1ZQ',
      pan: 'AAGCD8745E',
      profilePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=240&auto=format&fit=crop&q=80',
      status: 'Pending',
      isActive: false,
      createdAt: new Date(),
      appliedDate: new Date(),
      socialLinks: {
        website: 'https://desertnomads.org',
        instagram: 'https://instagram.com/desertnomads',
        linkedin: ''
      },
      documents: [
        {
          name: 'Identity Proof / Voter ID',
          type: 'id_proof',
          url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&auto=format&fit=crop&q=80',
          mimeType: 'image/jpeg',
          verified: false
        },
        {
          name: 'PAN Card Copy',
          type: 'pan_card',
          url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=80',
          mimeType: 'image/jpeg',
          verified: false
        },
        {
          name: 'Society Registration Certificate',
          type: 'society_registration',
          url: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=800&auto=format&fit=crop&q=80',
          mimeType: 'application/pdf',
          verified: false
        }
      ]
    },
    {
      fullName: 'Ananya Deshmukh',
      email: 'ananya.deshmukh@trailblazers.in',
      phone: '+91 97654 81230',
      organization: 'Western Ghats Adventure Moto',
      organizationType: 'Adventure Group',
      bio: 'Certified trail marshals focusing on off-road enduro trails, wilderness safety workshops, and environmental awareness rides.',
      city: 'Pune',
      state: 'Maharashtra',
      country: 'India',
      pinCode: '411004',
      address: '12, Prabhat Road, Deccan Gymkhana, Pune, Maharashtra',
      gst: '27AAFFT5512B1ZX',
      pan: 'AAFFT5512B',
      profilePhoto: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=240&auto=format&fit=crop&q=80',
      status: 'Approved',
      isActive: true,
      approvedAt: new Date(Date.now() - 86400000 * 2),
      approvedBy: 'Nitroxx Admin',
      createdAt: new Date(Date.now() - 86400000 * 5),
      appliedDate: new Date(Date.now() - 86400000 * 5),
      socialLinks: {
        website: 'https://trailblazers.in',
        instagram: 'https://instagram.com/wg_trailblazers',
        linkedin: 'https://linkedin.com/in/ananya-deshmukh'
      },
      documents: [
        {
          name: 'Aadhaar ID Card',
          type: 'id_proof',
          url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&auto=format&fit=crop&q=80',
          mimeType: 'image/jpeg',
          verified: true
        },
        {
          name: 'PAN Card Verified',
          type: 'pan_card',
          url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=80',
          mimeType: 'image/jpeg',
          verified: true
        },
        {
          name: 'GST Filing Confirmation',
          type: 'gst_certificate',
          url: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=800&auto=format&fit=crop&q=80',
          mimeType: 'application/pdf',
          verified: true
        }
      ]
    },
    {
      fullName: 'Karan Verma',
      email: 'karan.verma@speedwaytrack.com',
      phone: '+91 98110 99882',
      organization: 'Speedway Delhi Track Events',
      organizationType: 'Track Event Management',
      bio: 'Track day organizers for superbike enthusiasts on international circuits with timing transponders and paramedical support.',
      city: 'New Delhi',
      state: 'Delhi',
      country: 'India',
      pinCode: '110001',
      address: '88, Connaught Place, Inner Circle, New Delhi',
      gst: '07AABCV1234F1ZT',
      pan: 'AABCV1234F',
      profilePhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=240&auto=format&fit=crop&q=80',
      status: 'Rejected',
      isActive: false,
      rejectionReason: 'GST certificate uploaded is expired and the registered business address does not match the PAN document verification record.',
      reviewedAt: new Date(Date.now() - 86400000),
      reviewedBy: 'Nitroxx Admin',
      createdAt: new Date(Date.now() - 86400000 * 3),
      appliedDate: new Date(Date.now() - 86400000 * 3),
      socialLinks: {
        website: 'https://speedwaytrack.com',
        instagram: '',
        linkedin: ''
      },
      documents: [
        {
          name: 'Passport Identity Copy',
          type: 'id_proof',
          url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&auto=format&fit=crop&q=80',
          mimeType: 'image/jpeg',
          verified: false
        },
        {
          name: 'PAN Card Copy',
          type: 'pan_card',
          url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=80',
          mimeType: 'image/jpeg',
          verified: false
        }
      ]
    }
  ];

  const addedIds = [];
  for (const app of sampleApplications) {
    const docRef = await addDoc(collection(db, HOST_APPLICATIONS_COLLECTION), {
      ...app,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    addedIds.push(docRef.id);
  }
  return addedIds;
};
