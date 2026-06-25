import {
  EmailAuthProvider,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateEmail,
  updatePassword,
  updateProfile,
} from 'firebase/auth';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  limit,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytesResumable,
} from 'firebase/storage';
import { auth, db, googleProvider, storage } from '../firebase/firebase.config';

export const collections = {
  users: 'users',
  events: 'events',
  registrations: 'eventRegistrations',
  notifications: 'notifications',
  bookmarks: 'eventBookmarks',
  bookings: 'bookings',
};

const cleanObject = (value) =>
  Object.fromEntries(
    Object.entries(value).filter(([, entry]) => entry !== undefined && entry !== null)
  );

const timestamped = (data, includeCreated = false) =>
  cleanObject({
    ...data,
    updatedAt: serverTimestamp(),
    ...(includeCreated ? { createdAt: serverTimestamp() } : {}),
  });

export const buildUserProfile = (firebaseUser, extra = {}) => ({
  uid: firebaseUser.uid,
  fullName: extra.fullName || firebaseUser.displayName || '',
  email: firebaseUser.email || extra.email || '',
  photoURL: firebaseUser.photoURL || extra.photoURL || '',
  role: extra.role || 'Participant',
  phone: extra.phone || '',
  city: extra.city || '',
  state: extra.state || '',
  bio: extra.bio || '',
  organizationName: extra.organizationName || '',
  socialLinks: extra.socialLinks || { website: '', instagram: '', linkedin: '' },
  isVerified: firebaseUser.emailVerified || false,
  totalEventsHosted: 0,
  totalEventsJoined: 0,
  lastLogin: serverTimestamp(),
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
});

export const subscribeToUser = (uid, callback, onError) =>
  onSnapshot(doc(db, collections.users, uid), callback, onError);

export const signUpWithEmail = async ({ fullName, email, password, role, phone, city, state }) => {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(credential.user, { displayName: fullName });
  await setDoc(
    doc(db, collections.users, credential.user.uid),
    buildUserProfile(credential.user, { fullName, role, phone, city, state })
  );
  await sendEmailVerification(credential.user);
  return credential.user;
};

export const loginWithEmail = async (email, password) => {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  await setDoc(
    doc(db, collections.users, credential.user.uid),
    timestamped({
      uid: credential.user.uid,
      email: credential.user.email,
      photoURL: credential.user.photoURL || '',
      fullName: credential.user.displayName || '',
      isVerified: credential.user.emailVerified,
      lastLogin: serverTimestamp(),
    }),
    { merge: true }
  );
  return credential.user;
};

export const loginWithGoogle = async (role = 'Participant') => {
  const credential = await signInWithPopup(auth, googleProvider);
  const userRef = doc(db, collections.users, credential.user.uid);
  const snapshot = await getDoc(userRef);
  if (!snapshot.exists()) {
    await setDoc(userRef, buildUserProfile(credential.user, { role }));
  } else {
    await setDoc(
      userRef,
      timestamped({
        photoURL: credential.user.photoURL || '',
        fullName: credential.user.displayName || snapshot.data().fullName || '',
        isVerified: credential.user.emailVerified,
        lastLogin: serverTimestamp(),
      }),
      { merge: true }
    );
  }
  return credential.user;
};

export const logout = () => signOut(auth);
export const resetPassword = (email) => sendPasswordResetEmail(auth, email);
export const resendVerificationEmail = () =>
  auth.currentUser ? sendEmailVerification(auth.currentUser) : Promise.reject(new Error('No signed-in user.'));

export const uploadFile = (file, path, onProgress) =>
  new Promise((resolve, reject) => {
    if (!file) {
      resolve('');
      return;
    }
    const fileRef = ref(storage, `${path}/${Date.now()}-${file.name}`);
    const task = uploadBytesResumable(fileRef, file);
    task.on(
      'state_changed',
      (snapshot) => {
        if (onProgress) {
          onProgress(Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100));
        }
      },
      reject,
      async () => resolve(await getDownloadURL(task.snapshot.ref))
    );
  });

export const deleteStorageFile = async (url) => {
  if (!url) return;
  try {
    await deleteObject(ref(storage, url));
  } catch (error) {
    if (error.code !== 'storage/object-not-found') throw error;
  }
};

export const updateUserProfile = async (uid, data) => {
  const profile = timestamped(data);
  await updateDoc(doc(db, collections.users, uid), profile);
  if (auth.currentUser?.uid === uid) {
    if (data.fullName || data.photoURL) {
      await updateProfile(auth.currentUser, {
        displayName: data.fullName || auth.currentUser.displayName,
        photoURL: data.photoURL || auth.currentUser.photoURL,
      });
    }
    if (data.email && data.email !== auth.currentUser.email) await updateEmail(auth.currentUser, data.email);
    if (data.password) {
      EmailAuthProvider.credential(auth.currentUser.email, data.currentPassword || '');
      await updatePassword(auth.currentUser, data.password);
    }
  }
};

export const subscribeToEvents = ({ hostId, status, search, city, category, ticketType } = {}, callback, onError) => {
  const constraints = [];
  if (hostId) constraints.push(where('hostId', '==', hostId));
  if (status && status !== 'all') constraints.push(where('status', '==', status));
  if (city) constraints.push(where('city', '==', city));
  if (category) constraints.push(where('category', '==', category));
  if (ticketType) constraints.push(where('ticketType', '==', ticketType));
  constraints.push(orderBy('startDate', 'asc'));

  return onSnapshot(query(collection(db, collections.events), ...constraints), (snapshot) => {
    const events = snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() }));
    const normalizedSearch = search?.toLowerCase().trim();
    callback(
      normalizedSearch
        ? events.filter((event) =>
            [event.title, event.category, event.city, event.venue]
              .join(' ')
              .toLowerCase()
              .includes(normalizedSearch)
          )
        : events
    );
  }, onError);
};

export const getEvent = async (eventId) => {
  const eventSnap = await getDoc(doc(db, collections.events, eventId));
  if (!eventSnap.exists()) throw new Error('Event not found.');
  return { id: eventSnap.id, ...eventSnap.data() };
};

export const createEvent = async (event) => {
  const eventRef = await addDoc(
    collection(db, collections.events),
    timestamped(
      {
        ...event,
        registeredCount: 0,
        views: 0,
        revenue: 0,
      },
      true
    )
  );
  await updateDoc(eventRef, { eventId: eventRef.id });
  await updateDoc(doc(db, collections.users, event.hostId), {
    totalEventsHosted: increment(1),
    updatedAt: serverTimestamp(),
  });
  return eventRef.id;
};

export const updateEvent = (eventId, event) =>
  updateDoc(doc(db, collections.events, eventId), timestamped(event));

export const deleteEvent = async (eventId) => {
  await deleteDoc(doc(db, collections.events, eventId));
};

export const duplicateEvent = async (event) => {
  const { id, eventId, createdAt, updatedAt, registeredCount, views, revenue, ...copy } = event;
  return createEvent({
    ...copy,
    title: `${event.title} Copy`,
    status: 'Draft',
    registeredCount: 0,
    views: 0,
    revenue: 0,
  });
};

export const incrementEventView = (eventId) =>
  updateDoc(doc(db, collections.events, eventId), {
    views: increment(1),
    updatedAt: serverTimestamp(),
  });

export const registerForEvent = async ({ eventId, hostId, userId, participant, ticketPrice = 0 }) => {
  const eventRef = doc(db, collections.events, eventId);
  const userRef = doc(db, collections.users, userId);
  const registrationKey = `${eventId}_${userId}`;
  const registrationRef = doc(db, collections.registrations, registrationKey);

  await runTransaction(db, async (transaction) => {
    const [eventSnap, registrationSnap] = await Promise.all([
      transaction.get(eventRef),
      transaction.get(registrationRef),
    ]);
    if (!eventSnap.exists()) throw new Error('Event not found.');
    if (registrationSnap.exists()) throw new Error('You are already registered for this event.');

    const event = eventSnap.data();
    if (event.status !== 'Published') throw new Error('Registration is only open for published events.');
    if ((event.registeredCount || 0) >= Number(event.capacity || 0)) throw new Error('This event is full.');

    transaction.set(registrationRef, {
      registrationId: registrationKey,
      eventId,
      userId,
      hostId,
      participant,
      participantName: participant.fullName,
      participantEmail: participant.email,
      participantPhone: participant.phone,
      registrationDate: serverTimestamp(),
      status: 'Confirmed',
      ticketNumber: `NX-${Date.now().toString(36).toUpperCase()}`,
      attendanceStatus: 'Not Checked In',
      ticketPrice: Number(ticketPrice || 0),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    transaction.update(eventRef, {
      registeredCount: increment(1),
      revenue: increment(Number(ticketPrice || 0)),
      updatedAt: serverTimestamp(),
    });
    transaction.update(userRef, {
      totalEventsJoined: increment(1),
      updatedAt: serverTimestamp(),
    });
  });

  await createNotification({
    userId,
    title: 'Registration confirmed',
    message: 'Your event registration has been confirmed.',
    type: 'registration-confirmed',
  });
};

export const subscribeToRegistrations = ({ hostId, eventId, userId } = {}, callback, onError) => {
  const constraints = [];
  if (hostId) constraints.push(where('hostId', '==', hostId));
  if (eventId) constraints.push(where('eventId', '==', eventId));
  if (userId) constraints.push(where('userId', '==', userId));
  constraints.push(orderBy('registrationDate', 'desc'));
  return onSnapshot(query(collection(db, collections.registrations), ...constraints), (snapshot) => {
    callback(snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() })));
  }, onError);
};

export const subscribeToEventBookings = (eventId, callback, onError) => {
  const constraints = [where('eventId', '==', eventId), orderBy('createdAt', 'desc')];
  return onSnapshot(query(collection(db, collections.bookings), ...constraints), (snapshot) => {
    callback(snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() })));
  }, onError);
};

export const updateRegistration = (registrationId, data) =>
  updateDoc(doc(db, collections.registrations, registrationId), timestamped(data));

export const removeRegistration = async ({ registrationId, eventId }) => {
  await runTransaction(db, async (transaction) => {
    const registrationRef = doc(db, collections.registrations, registrationId);
    const eventRef = doc(db, collections.events, eventId);
    transaction.delete(registrationRef);
    transaction.update(eventRef, {
      registeredCount: increment(-1),
      updatedAt: serverTimestamp(),
    });
  });
};

export const createNotification = (notification) =>
  addDoc(
    collection(db, collections.notifications),
    timestamped(
      {
        ...notification,
        isRead: false,
      },
      true
    )
  );

export const subscribeToNotifications = (userId, callback, onError) =>
  onSnapshot(
    query(
      collection(db, collections.notifications),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(20)
    ),
    (snapshot) => callback(snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() }))),
    onError
  );

export const markNotificationRead = (notificationId) =>
  updateDoc(doc(db, collections.notifications, notificationId), { isRead: true });

export const toggleBookmark = async ({ userId, eventId }) => {
  const bookmarkId = `${userId}_${eventId}`;
  const bookmarkRef = doc(db, collections.bookmarks, bookmarkId);
  const bookmarkSnap = await getDoc(bookmarkRef);
  if (bookmarkSnap.exists()) {
    await deleteDoc(bookmarkRef);
    return false;
  }
  await setDoc(bookmarkRef, {
    bookmarkId,
    userId,
    eventId,
    createdAt: serverTimestamp(),
  });
  return true;
};

export const getHostAnalytics = async (hostId) => {
  const [eventsSnap, registrationsSnap] = await Promise.all([
    getDocs(query(collection(db, collections.events), where('hostId', '==', hostId))),
    getDocs(query(collection(db, collections.registrations), where('hostId', '==', hostId))),
  ]);
  const events = eventsSnap.docs.map((entry) => ({ id: entry.id, ...entry.data() }));
  const registrations = registrationsSnap.docs.map((entry) => ({ id: entry.id, ...entry.data() }));
  return calculateAnalytics(events, registrations);
};

export const calculateAnalytics = (events = [], registrations = []) => {
  const now = new Date();
  const totalRevenue = events.reduce((sum, event) => sum + Number(event.revenue || 0), 0);
  const activeEvents = events.filter((event) => event.status === 'Published').length;
  const completedEvents = events.filter((event) => event.status === 'Completed').length;
  const upcomingEvents = events.filter((event) => event.startDate && new Date(event.startDate) >= now).length;
  const totalViews = events.reduce((sum, event) => sum + Number(event.views || 0), 0);
  const attended = registrations.filter((entry) => entry.attendanceStatus === 'Checked In').length;
  const monthMap = new Map();
  registrations.forEach((registration) => {
    const rawDate = registration.registrationDate?.toDate?.() || new Date();
    const key = rawDate.toLocaleString('default', { month: 'short' });
    monthMap.set(key, (monthMap.get(key) || 0) + 1);
  });

  return {
    totalEvents: events.length,
    activeEvents,
    completedEvents,
    upcomingEvents,
    totalRegistrations: registrations.length,
    totalRevenue,
    totalViews,
    conversionRate: totalViews ? Math.round((registrations.length / totalViews) * 100) : 0,
    attendanceRate: registrations.length ? Math.round((attended / registrations.length) * 100) : 0,
    registrationsPerMonth: Array.from(monthMap.entries()).map(([month, registrations]) => ({
      month,
      registrations,
    })),
    revenueByEvent: events.map((event) => ({
      name: event.title,
      revenue: Number(event.revenue || 0),
      registrations: Number(event.registeredCount || 0),
    })),
    genderDistribution: groupBy(registrations, 'participant.gender'),
    cityDistribution: groupBy(registrations, 'participant.city'),
    ageDistribution: groupAges(registrations),
  };
};

const getNested = (source, path) =>
  path.split('.').reduce((current, key) => (current ? current[key] : undefined), source);

const groupBy = (items, path) =>
  Object.entries(
    items.reduce((acc, item) => {
      const key = getNested(item, path) || 'Unknown';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

const groupAges = (items) => {
  const buckets = { 'Under 18': 0, '18-24': 0, '25-34': 0, '35-44': 0, '45+': 0 };
  items.forEach((item) => {
    const age = Number(item.participant?.age || 0);
    if (age < 18) buckets['Under 18'] += 1;
    else if (age <= 24) buckets['18-24'] += 1;
    else if (age <= 34) buckets['25-34'] += 1;
    else if (age <= 44) buckets['35-44'] += 1;
    else buckets['45+'] += 1;
  });
  return Object.entries(buckets).map(([name, value]) => ({ name, value }));
};
