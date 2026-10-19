import { doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/firebase.config';

/**
 * Checks whether an account has an active suspension, expired suspension, or is normal.
 * @param {Object} account - Document data for host or vendor
 * @returns {Object} { isSuspended: boolean, isExpired: boolean, startDate, endDate, reason }
 */
export const checkAccountSuspension = (account) => {
  if (!account) return { isSuspended: false, isExpired: false };

  const rawStatus = (account.status || account.verificationStatus || '').toLowerCase();
  const hasSuspensionDates = Boolean(account.suspensionEndDate || account.suspensionStartDate);
  const isSuspendedStatus = rawStatus === 'suspended';

  if (!isSuspendedStatus && !hasSuspensionDates) {
    return { isSuspended: false, isExpired: false };
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const startDate = account.suspensionStartDate || '';
  const endDate = account.suspensionEndDate || '';

  // If suspension period has expired (endDate is in the past)
  if (endDate && endDate < todayStr) {
    return {
      isSuspended: false,
      isExpired: true,
      startDate,
      endDate,
      reason: account.suspensionReason || ''
    };
  }

  return {
    isSuspended: true,
    isExpired: false,
    startDate,
    endDate,
    reason: account.suspensionReason || ''
  };
};

/**
 * Suspend a host or vendor account for a custom range of dates.
 */
export const suspendAccount = async ({ accountType, accountId, startDate, endDate, reason }) => {
  if (!accountId) throw new Error('Account ID is required for suspension.');

  const collectionName = accountType === 'host' ? 'event_host' : 'vendors';
  const targetRef = doc(db, collectionName, accountId);

  const payload = {
    status: 'suspended',
    isActive: false,
    suspensionStartDate: startDate,
    suspensionEndDate: endDate,
    suspensionReason: reason || 'Account temporarily suspended by administration',
    suspendedAt: serverTimestamp(),
    suspendedBy: 'Admin'
  };

  if (accountType === 'vendor') {
    payload.verificationStatus = 'suspended';
  }

  await updateDoc(targetRef, payload);
  return true;
};

/**
 * Lift suspension and reactivate a host or vendor account.
 */
export const reactivateAccount = async ({ accountType, accountId }) => {
  if (!accountId) throw new Error('Account ID is required for reactivation.');

  const collectionName = accountType === 'host' ? 'event_host' : 'vendors';
  const targetRef = doc(db, collectionName, accountId);

  const payload = {
    status: 'active',
    isActive: true,
    suspensionStartDate: null,
    suspensionEndDate: null,
    suspensionReason: null,
    unsuspendedAt: serverTimestamp(),
    unsuspendedBy: 'Admin'
  };

  if (accountType === 'vendor') {
    payload.verificationStatus = 'verified';
  }

  await updateDoc(targetRef, payload);
  return true;
};

/**
 * Permanently delete a host or vendor account from Firestore.
 */
export const deleteAccount = async ({ accountType, accountId }) => {
  if (!accountId) throw new Error('Account ID is required for deletion.');

  const collectionName = accountType === 'host' ? 'event_host' : 'vendors';
  const targetRef = doc(db, collectionName, accountId);

  await deleteDoc(targetRef);
  return true;
};
