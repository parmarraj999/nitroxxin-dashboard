import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import {
  QrCode,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowLeft,
  RefreshCw,
  Flashlight,
  Volume2,
  VolumeX,
  Search,
  KeyRound,
  Lock,
  Mail,
  ChevronRight,
  ExternalLink,
  Sparkles,
  Camera,
} from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { useAuth } from '../../context/AuthContext';
import {
  subscribeToEvent,
  subscribeToEventBookings,
  checkInParticipantTicket,
  lookupTicketDirect
} from '../../services/firebaseService';
import { saveSessionMemory } from '../../utils/sessionMemory';
import { useRegistrations } from '../../hooks/useRegistrations';
import { formatDateTime } from '../../utils/formatters';
import './EventCheckInMobile.css';

// Sound effect generator using Web Audio API (Zero external assets required)
const playChime = (type = 'success') => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'success') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(784, ctx.currentTime); // G5
      osc.frequency.exponentialRampToValueAtTime(1568, ctx.currentTime + 0.16); // G6
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.16);
      osc.start();
      osc.stop(ctx.currentTime + 0.16);
    } else if (type === 'warning') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.setValueAtTime(330, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } else {
      osc.type = 'square';
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.setValueAtTime(160, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    }
  } catch (e) {
    // Audio context not allowed before user gesture
  }
};

// Downscale high-resolution mobile photos (12-48MP) to 1000px for instant ZXing decoding
const downscaleImageForScan = (file, maxWidth = 1000) => {
  return new Promise((resolve) => {
    try {
      const img = new window.Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        let { width, height } = img;
        if (!width || !height) return resolve(file);

        if (width > maxWidth || height > maxWidth) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxWidth) / height);
            height = maxWidth;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(file);
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const downscaledFile = new File([blob], file.name || 'qr_scan.jpg', {
                type: 'image/jpeg',
              });
              resolve(downscaledFile);
            } else {
              resolve(file);
            }
          },
          'image/jpeg',
          0.92
        );
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(file);
      };
      img.src = url;
    } catch (e) {
      resolve(file);
    }
  });
};

// Intelligent QR payload parser
const parseScannedText = (raw) => {
  if (!raw) return '';
  let text = String(raw).trim();
  // Strip surrounding quotes
  if ((text.startsWith('"') && text.endsWith('"')) || (text.startsWith("'") && text.endsWith("'"))) {
    text = text.slice(1, -1).trim();
  }
  // Strip leading hashtag
  if (text.startsWith('#')) {
    text = text.slice(1).trim();
  }
  if (text.startsWith('{') && text.endsWith('}')) {
    try {
      const parsed = JSON.parse(text);
      return (
        parsed.ticketNumber ||
        parsed.ticketCode ||
        parsed.code ||
        parsed.bookingId ||
        parsed.orderId ||
        parsed.id ||
        parsed.registrationId ||
        text
      );
    } catch (e) {}
  }
  if (text.includes('?') || text.includes('://')) {
    try {
      const url = new URL(text, window.location.origin);
      const code =
        url.searchParams.get('ticket') ||
        url.searchParams.get('ticketNumber') ||
        url.searchParams.get('code') ||
        url.searchParams.get('id') ||
        url.searchParams.get('data');
      if (code) return code;
      const parts = url.pathname.split('/').filter(Boolean);
      if (parts.length > 0) return parts[parts.length - 1];
    } catch (e) {}
  }
  return text;
};

const EventCheckInMobile = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, profile, isAuthenticated, login, loginWithGoogle, loading: authLoading } = useAuth();

  // Auto-authorization when opened from host dashboard QR scan
  const autoGate = searchParams.get('autoGate') === '1' || searchParams.get('source') === 'qr';
  const urlHostUid = searchParams.get('hostUid');
  const urlHostEmail = searchParams.get('hostEmail');

  useEffect(() => {
    if (autoGate && urlHostUid) {
      saveSessionMemory({
        uid: urlHostUid,
        email: urlHostEmail || 'host@nitroxx.com',
        displayName: 'Gate Host',
        role: 'Host',
      });
    }
  }, [autoGate, urlHostUid, urlHostEmail]);

  const isAuthorizedGate = isAuthenticated || (autoGate && Boolean(urlHostUid));

  // Event & attendee state
  const [event, setEvent] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loadingEvent, setLoadingEvent] = useState(true);
  const { registrations } = useRegistrations({ eventId });

  // Scanner state
  const [scannerActive, setScannerActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [torchOn, setTorchOn] = useState(false);
  const [facingMode, setFacingMode] = useState('environment'); // 'environment' | 'user'

  // Scan Verification State
  const [scanResult, setScanResult] = useState(null); // { status: 'success'|'warning'|'error', participant, code, time }
  const [isProcessing, setIsProcessing] = useState(false);
  const [recentCheckIns, setRecentCheckIns] = useState([]);

  // Manual fallback input
  const [manualCode, setManualCode] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);

  // Host inline login state (if opened directly on phone without previous session)
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const html5QrCodeRef = useRef(null);
  const isScannerRunningRef = useRef(false);
  const resumeTimerRef = useRef(null);
  const fileInputRef = useRef(null);

  // 1. Subscribe to Event metadata
  useEffect(() => {
    if (!eventId) return;
    const unsub = subscribeToEvent(
      eventId,
      (ev) => {
        setEvent(ev);
        setLoadingEvent(false);
      },
      (err) => {
        setCameraError(err.message);
        setLoadingEvent(false);
      }
    );
    return () => unsub && unsub();
  }, [eventId]);

  // 2. Subscribe to Bookings
  useEffect(() => {
    if (!eventId) return;
    const unsub = subscribeToEventBookings(
      eventId,
      (list) => setBookings(list),
      (err) => console.warn('Bookings fetch warning:', err)
    );
    return () => unsub && unsub();
  }, [eventId]);

  // 3. Consolidated Participants Index
  const participantsList = useMemo(() => {
    const list = [];
    const seenEmails = new Set();
    const seenIds = new Set();

    // From registrations
    (registrations || []).forEach((r, idx) => {
      const id = String(r.id || r.registrationId || `reg-${idx}`);
      const email = (r.participantEmail || r.participant?.email || r.email || '').toLowerCase().trim();
      seenIds.add(id);
      if (email) seenEmails.add(email);

      const name = r.participantName || r.participant?.fullName || r.fullName || 'Participant';
      const ticketNumber = r.ticketNumber || `NX-${id.slice(0, 6).toUpperCase()}`;
      const isCheckedIn = r.attendanceStatus === 'Checked In' || r.status === 'Checked In' || r.gateStatus === 'Done';

      list.push({
        id,
        name,
        email: email || 'N/A',
        phone: r.participantPhone || r.participant?.phone || r.phone || 'N/A',
        tierName: r.tierName || r.ticketType || 'General Entry',
        ticketCode: r.ticketCode || ticketNumber,
        ticketNumber,
        bibNumber: r.bibNumber || (ticketNumber ? `BIB-${ticketNumber.slice(-3)}` : `BIB-${101 + idx}`),
        ticketsCount: Number(r.ticketsCount || r.tickets || 1),
        isCheckedIn,
        attendanceStatus: isCheckedIn ? 'Checked In' : 'Not Checked In',
        checkInTime: r.checkInTime || null,
        registrationId: r.registrationId || r.id,
        rawRegistration: r,
        rawBooking: null,
      });
    });

    // From bookings
    (bookings || []).forEach((b, idx) => {
      const regId = b.registrationId || `${b.eventId}_${b.userId}_${b.id}`;
      const email = (b.bookingContact?.email || b.attendee?.email || b.email || '').toLowerCase().trim();

      if (!seenIds.has(regId) && (!email || !seenEmails.has(email))) {
        seenIds.add(regId);
        if (email) seenEmails.add(email);

        const name = b.bookingContact?.name || b.attendee?.name || b.name || 'Attendee';
        const ticketNumber = b.ticketNumber || `NX-${(b.id || String(idx)).slice(0, 6).toUpperCase()}`;
        const isCheckedIn = b.attendanceStatus === 'Checked In' || b.status === 'Checked In' || b.gateStatus === 'Done';

        list.push({
          id: b.id || `bkg-${idx}`,
          name,
          email: email || 'N/A',
          phone: b.bookingContact?.phone || b.attendee?.phone || b.phone || 'N/A',
          tierName: b.tierName || b.packageName || b.joinAs || 'Confirmed Pass',
          ticketNumber,
          bibNumber: b.bibNumber || (ticketNumber ? `BIB-${ticketNumber.slice(-3)}` : `BIB-${201 + idx}`),
          ticketsCount: Number(b.totalTickets || 1),
          isCheckedIn,
          attendanceStatus: isCheckedIn ? 'Checked In' : 'Not Checked In',
          checkInTime: b.checkInTime || null,
          bookingId: b.id || b.bookingId,
          registrationId: b.registrationId || null,
          rawBooking: b,
          rawRegistration: null,
        });
      }
    });

    return list;
  }, [registrations, bookings]);

  // Gate statistics
  const checkedInCount = useMemo(
    () => participantsList.filter((p) => p.isCheckedIn).length,
    [participantsList]
  );
  const pendingCount = Math.max(0, participantsList.length - checkedInCount);

  // Match attendee by scanned code
  const matchParticipant = useCallback(
    (codeToMatch) => {
      if (!codeToMatch) return null;
      const clean = String(codeToMatch).trim().toLowerCase();
      const cleanAlpha = clean.replace(/[^a-z0-9]/g, '');

      return participantsList.find((p) => {
        const tCode = String(p.ticketCode || '').trim().toLowerCase();
        const tNum = String(p.ticketNumber || '').trim().toLowerCase();
        const bib = String(p.bibNumber || '').trim().toLowerCase();
        const id = String(p.id || '').trim().toLowerCase();
        const regId = String(p.registrationId || '').trim().toLowerCase();
        const bkgId = String(p.bookingId || p.rawBooking?.bookingId || p.rawBooking?.id || '').trim().toLowerCase();
        const ordId = String(p.rawBooking?.orderId || '').trim().toLowerCase();
        const email = String(p.email || '').trim().toLowerCase();
        const phone = String(p.phone || '').trim();

        // 1. Direct exact matches
        if (
          tCode === clean ||
          tNum === clean ||
          bib === clean ||
          id === clean ||
          regId === clean ||
          bkgId === clean ||
          ordId === clean ||
          email === clean ||
          phone === clean
        ) {
          return true;
        }

        // 2. Normalized alphanumeric matches (ignoring dashes and casing)
        if (cleanAlpha.length >= 3) {
          const tCodeAlpha = tCode.replace(/[^a-z0-9]/g, '');
          const tNumAlpha = tNum.replace(/[^a-z0-9]/g, '');
          const bibAlpha = bib.replace(/[^a-z0-9]/g, '');
          const idAlpha = id.replace(/[^a-z0-9]/g, '');
          const bkgAlpha = bkgId.replace(/[^a-z0-9]/g, '');
          const ordAlpha = ordId.replace(/[^a-z0-9]/g, '');

          if (
            tCodeAlpha === cleanAlpha ||
            tNumAlpha === cleanAlpha ||
            bibAlpha === cleanAlpha ||
            idAlpha === cleanAlpha ||
            bkgAlpha === cleanAlpha ||
            ordAlpha === cleanAlpha
          ) {
            return true;
          }

          if (
            (cleanAlpha.length >= 5 && (tNumAlpha.includes(cleanAlpha) || cleanAlpha.includes(tNumAlpha))) ||
            (bibAlpha.length >= 3 && bibAlpha.endsWith(cleanAlpha))
          ) {
            return true;
          }
        }

        return false;
      });
    },
    [participantsList]
  );

  // Process ticket check-in action
  const handleVerifyCode = useCallback(
    async (rawCode) => {
      if (isProcessing) return;
      const parsedCode = parseScannedText(rawCode);
      if (!parsedCode) return;

      setIsProcessing(true);
      let matched = matchParticipant(parsedCode);

      // If not in memory list, query Firestore directly as instant fallback
      if (!matched && eventId) {
        try {
          const directFound = await lookupTicketDirect({ eventId, code: parsedCode });
          if (directFound) {
            matched = directFound;
          }
        } catch (e) {
          console.warn('Direct Firestore ticket lookup failed:', e);
        }
      }

      if (!matched) {
        if (soundEnabled) playChime('error');
        setScanResult({
          status: 'error',
          code: parsedCode,
          message: 'Ticket not found for this event',
        });
        setIsProcessing(false);
        return;
      }

      // Check if already admitted - Single-use enforcement
      if (matched.isCheckedIn || matched.gateStatus === 'Done' || matched.status === 'Checked In') {
        if (soundEnabled) playChime('warning');
        setScanResult({
          status: 'warning',
          title: 'ALREADY USED',
          participant: matched,
          code: parsedCode,
          message: 'ALREADY USED',
          time: matched.checkInTime ? formatDateTime(matched.checkInTime) : 'Earlier today',
        });
        setIsProcessing(false);
        return;
      }

      // Perform Live Check-In
      try {
        await checkInParticipantTicket({
          eventId,
          ticketCode: matched.ticketNumber || matched.ticketCode || parsedCode,
          bookingId: matched.bookingId || matched.rawBooking?.id,
          registrationId: matched.registrationId || matched.rawRegistration?.id,
          hostUserId: urlHostUid || user?.uid || 'gate_host',
        });

        if (soundEnabled) playChime('success');
        if (navigator.vibrate) {
          try { navigator.vibrate([100, 50, 100]); } catch (e) {}
        }

        const checkInTimeStr = new Date().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        });

        const successObj = {
          status: 'success',
          participant: { ...matched, isCheckedIn: true },
          code: parsedCode,
          message: 'Admitted Successfully',
          time: checkInTimeStr,
        };

        setScanResult(successObj);
        setRecentCheckIns((prev) => [
          {
            id: matched.id + '-' + Date.now(),
            name: matched.name,
            ticketNumber: matched.ticketNumber,
            tierName: matched.tierName,
            time: checkInTimeStr,
          },
          ...prev.slice(0, 7),
        ]);
      } catch (err) {
        console.error('Check-in error:', err);
        setScanResult({
          status: 'error',
          code: parsedCode,
          message: err.message || 'Check-in failed. Please try again.',
        });
      } finally {
        setIsProcessing(false);
      }
    },
    [eventId, isProcessing, matchParticipant, soundEnabled, urlHostUid, user?.uid]
  );

  // Handle fallback native photo / file scan via Html5Qrcode.scanFile
  const handleFileInputScan = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsProcessing(true);
    setCameraError('');
    try {
      // 1. Temporarily stop live stream to prevent camera hardware locks
      if (html5QrCodeRef.current && isScannerRunningRef.current) {
        try {
          await html5QrCodeRef.current.stop();
          isScannerRunningRef.current = false;
        } catch (e) {}
      }

      // 2. Downscale huge phone camera photos (12-48MP) to crisp 1000px for ZXing speed
      const scaledFile = await downscaleImageForScan(file, 1000);

      // 3. Scan using dedicated temp instance
      const scanner = new Html5Qrcode('mobile-qr-reader-file-temp', {
        experimentalFeatures: { useBarCodeDetectorIfSupported: true },
        verbose: false,
      });
      const decodedText = await scanner.scanFile(scaledFile, false);
      try {
        await scanner.clear();
      } catch (e) {}

      handleVerifyCode(decodedText);
    } catch (err) {
      console.warn('File scan error:', err);
      setCameraError('No readable QR code found in photo. Hold camera steady and close to the ticket, or enter code below.');
      setTimeout(() => {
        startCamera();
      }, 500);
    } finally {
      setIsProcessing(false);
      if (e.target) e.target.value = '';
    }
  };

  // Initialize and control camera scanner
  const startCamera = useCallback(async () => {
    setCameraError('');
    try {
      const el = document.getElementById('mobile-qr-reader');
      if (!el) {
        setTimeout(startCamera, 150);
        return;
      }

      // Clean up previous instance before fresh start
      if (html5QrCodeRef.current) {
        try {
          if (isScannerRunningRef.current || html5QrCodeRef.current.isScanning) {
            await html5QrCodeRef.current.stop();
          }
        } catch (e) {}
        try {
          await html5QrCodeRef.current.clear();
        } catch (e) {}
        html5QrCodeRef.current = null;
        isScannerRunningRef.current = false;
      }

      const qrScanner = new Html5Qrcode('mobile-qr-reader', {
        experimentalFeatures: {
          useBarCodeDetectorIfSupported: true,
        },
        verbose: false,
      });
      html5QrCodeRef.current = qrScanner;

      // On mobile devices, using facingMode: "environment" allows the mobile OS
      // to pick the primary rear autofocus camera without selecting broken macro/depth lenses.
      const cameraConfig = { facingMode: facingMode || 'environment' };

      const qrConfig = {
        fps: 20,
        qrbox: (viewfinderWidth, viewfinderHeight) => {
          const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
          const edge = Math.max(Math.floor(minEdge * 0.78), 220);
          return { width: edge, height: edge };
        },
        disableFlip: false,
      };

      await qrScanner.start(
        cameraConfig,
        qrConfig,
        (decodedText) => {
          handleVerifyCode(decodedText);
        },
        () => {}
      );

      isScannerRunningRef.current = true;
      setScannerActive(true);
    } catch (err) {
      console.warn('Camera start error:', err);
      const isSecure = window.isSecureContext || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      let errorMsg = 'Unable to start camera.';
      if (!isSecure) {
        errorMsg = 'Live camera stream is restricted over HTTP on local network IP by browser security. Tap "Snap Ticket Photo" below to scan tickets!';
      } else if (err?.name === 'NotAllowedError' || err?.message?.includes('Permission')) {
        errorMsg = 'Camera permission denied. Please allow camera access in browser site settings and retry.';
      } else if (err?.name === 'NotFoundError') {
        errorMsg = 'No camera hardware found on this device.';
      } else if (err?.name === 'NotReadableError' || err?.message?.includes('NotReadableError')) {
        errorMsg = 'Camera is in use by another app. Please close other camera apps and retry.';
      } else {
        errorMsg = err?.message || 'Unable to start camera. Use "Snap Ticket Photo" or enter code below.';
      }
      setCameraError(errorMsg);
      setScannerActive(false);
      isScannerRunningRef.current = false;
    }
  }, [facingMode, handleVerifyCode]);

  const stopCamera = useCallback(async () => {
    if (html5QrCodeRef.current) {
      try {
        if (isScannerRunningRef.current || html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop();
        }
      } catch (e) {
        console.warn('Camera stop error:', e);
      }
      try {
        await html5QrCodeRef.current.clear();
      } catch (e) {}
      html5QrCodeRef.current = null;
      isScannerRunningRef.current = false;
      setScannerActive(false);
    }
  }, []);

  // Manage camera lifecycle
  useEffect(() => {
    if (isAuthorizedGate && !scanResult) {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isAuthorizedGate, scanResult, startCamera, stopCamera]);

  // Flip camera (environment <-> user)
  const toggleFacingMode = async () => {
    await stopCamera();
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Toggle Torch if supported
  const toggleTorch = async () => {
    if (html5QrCodeRef.current && isScannerRunningRef.current) {
      try {
        const capabilities = html5QrCodeRef.current.getRunningTrackCapabilities();
        if (capabilities.torch) {
          const nextTorch = !torchOn;
          await html5QrCodeRef.current.applyVideoConstraints({
            advanced: [{ torch: nextTorch }],
          });
          setTorchOn(nextTorch);
        } else {
          alert('Torch / Flashlight is not supported on this device camera.');
        }
      } catch (e) {
        console.warn('Torch toggle error:', e);
      }
    }
  };

  // Reset scan result to scan next attendee
  const handleScanNext = () => {
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    setScanResult(null);
  };

  // Auto-resume camera after 4 seconds if successful
  useEffect(() => {
    if (scanResult) {
      resumeTimerRef.current = setTimeout(() => {
        setScanResult(null);
      }, 4000);
    }
    return () => {
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    };
  }, [scanResult]);

  // Handle manual code submit
  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    handleVerifyCode(manualCode.trim());
    setManualCode('');
    setShowManualInput(false);
  };

  // Inline Host Login submission
  const handleHostLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');
    try {
      await login(loginEmail, loginPassword, true);
    } catch (err) {
      setLoginError(err.message || 'Login failed. Please verify host credentials.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoginLoading(true);
    setLoginError('');
    try {
      await loginWithGoogle();
    } catch (err) {
      setLoginError(err.message || 'Google sign-in failed.');
    } finally {
      setLoginLoading(false);
    }
  };

  // -------------------------------------------------------------------------
  // RENDER: Unauthenticated Host Login View (Only if not auto-authorized via host QR)
  // -------------------------------------------------------------------------
  if (!authLoading && !isAuthorizedGate) {
    return (
      <div className="mobile-gate-container">
        <div className="mobile-gate-auth-card">
          <div className="mobile-gate-auth-header">
            <div className="gate-brand-pill">
              <Sparkles size={14} className="text-orange" />
              <span>NitroXX Gate Scanner</span>
            </div>
            <h2>Host Check-In Login</h2>
            <p>
              Log in with your official NitroXX host credentials to unlock live ticket scanning for{' '}
              <strong>{event?.title || 'this event'}</strong>.
            </p>
          </div>

          {loginError && (
            <div className="mobile-gate-alert-box error">
              <XCircle size={16} />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleHostLogin} className="mobile-gate-form">
            <div className="mobile-gate-field">
              <label>Host Email Address</label>
              <div className="mobile-gate-input-wrap">
                <Mail size={16} className="field-icon" />
                <input
                  type="email"
                  placeholder="host@nitroxxin.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="mobile-gate-field">
              <label>Password</label>
              <div className="mobile-gate-input-wrap">
                <Lock size={16} className="field-icon" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="mobile-gate-primary-btn" disabled={loginLoading}>
              {loginLoading ? 'Authenticating...' : 'Unlock Gate Scanner'}
              <ChevronRight size={16} />
            </button>

            <div className="mobile-gate-divider">
              <span>OR</span>
            </div>

            <button
              type="button"
              className="mobile-gate-google-btn"
              onClick={handleGoogleLogin}
              disabled={loginLoading}
            >
              Sign In with Google
            </button>
          </form>

          <div className="mobile-gate-auth-footer">
            <span>Powered by NitroXX Live Gate Operations</span>
          </div>
        </div>
      </div>
    );
  }

  if (loadingEvent && !event) {
    return (
      <div className="mobile-gate-container">
        <div className="mobile-gate-auth-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '260px' }}>
          <RefreshCw className="animate-spin text-orange" size={32} />
          <p style={{ marginTop: '16px', color: '#94a3b8', fontSize: '14px' }}>Connecting to event gate operations...</p>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // RENDER: Authenticated Mobile Scanner View
  // -------------------------------------------------------------------------
  return (
    <div className="mobile-gate-container">
      {/* Top Mobile App Bar */}
      <header className="mobile-gate-topbar">
        <button
          type="button"
          className="mobile-gate-icon-btn"
          onClick={() => navigate(`/events/${eventId}`)}
          title="Back to Event Management"
        >
          <ArrowLeft size={18} />
        </button>

        <div className="mobile-gate-event-info">
          <div className="gate-live-status-row">
            <span className="gate-live-pulse-dot" />
            <span className="gate-live-tag">LIVE GATE SCANNER</span>
          </div>
          <h1 className="mobile-gate-title">{event?.title || 'Event Check-In'}</h1>
        </div>

        <button
          type="button"
          className={`mobile-gate-icon-btn ${soundEnabled ? 'active' : ''}`}
          onClick={() => setSoundEnabled((prev) => !prev)}
          title={soundEnabled ? 'Sound Enabled' : 'Sound Muted'}
        >
          {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>
      </header>

      {/* Gate Metrics Strip */}
      <section className="mobile-gate-metrics-strip">
        <div className="mobile-metric-item">
          <span className="metric-val text-green">{checkedInCount}</span>
          <span className="metric-lbl">Checked In</span>
        </div>
        <div className="mobile-metric-divider" />
        <div className="mobile-metric-item">
          <span className="metric-val text-amber">{pendingCount}</span>
          <span className="metric-lbl">Pending Gate</span>
        </div>
        <div className="mobile-metric-divider" />
        <div className="mobile-metric-item">
          <span className="metric-val">{participantsList.length}</span>
          <span className="metric-lbl">Total Booked</span>
        </div>
      </section>

      {/* Main Viewfinder Section */}
      <main className="mobile-gate-scanner-section">
        {/* Scanner Viewfinder Box */}
        <div className="mobile-viewfinder-wrapper">
          <div id="mobile-qr-reader" className="mobile-camera-surface" />

          {/* Holographic Target Overlay */}
          {!scanResult && (
            <div className="mobile-scanner-overlay" aria-hidden="true">
              <div className="scanner-target-corners">
                <span className="corner top-left" />
                <span className="corner top-right" />
                <span className="corner bottom-left" />
                <span className="corner bottom-right" />
              </div>
              <div className="scanner-laser-beam" />
              <div className="scanner-helper-text">
                <QrCode size={14} />
                <span>{scannerActive ? 'Center attendee ticket QR inside box' : 'Starting camera feed...'}</span>
              </div>
            </div>
          )}

          {/* Hidden temp element for file scan to prevent DOM collisions */}
          <div id="mobile-qr-reader-file-temp" style={{ display: 'none' }} />

          {/* Hidden native camera capture input for 100% reliable camera scan */}
          <input
            type="file"
            accept="image/*"
            capture="environment"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleFileInputScan}
          />

          {/* Controls Bar Overlaid on Camera */}
          <div className="mobile-camera-controls-bar">
            <button
              type="button"
              className="camera-tool-btn snap"
              onClick={() => fileInputRef.current?.click()}
              title="Snap Ticket with Phone Camera"
            >
              <Camera size={16} />
              <span>Snap</span>
            </button>

            <button
              type="button"
              className={`camera-tool-btn ${torchOn ? 'active' : ''}`}
              onClick={toggleTorch}
              title="Toggle Flashlight"
            >
              <Flashlight size={16} />
              <span>Torch</span>
            </button>

            <button
              type="button"
              className="camera-tool-btn"
              onClick={toggleFacingMode}
              title="Flip Camera"
            >
              <RefreshCw size={16} />
              <span>Flip</span>
            </button>

            <button
              type="button"
              className="camera-tool-btn"
              onClick={() => setShowManualInput(true)}
              title="Enter Code Manually"
            >
              <KeyRound size={16} />
              <span>Code</span>
            </button>
          </div>

          {/* Camera Permission / Access Notice */}
          {cameraError && (
            <div className="mobile-camera-error-banner">
              <AlertTriangle size={24} className="text-amber" />
              <div style={{ flex: 1 }}>
                <h4>Camera Notice</h4>
                <p>{cameraError}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="retry-btn"
                    style={{ background: '#f97316', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Camera size={15} />
                    <span>Snap Ticket with Camera</span>
                  </button>
                  <button
                    type="button"
                    onClick={startCamera}
                    className="retry-btn"
                    style={{ background: 'rgba(255, 255, 255, 0.15)', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <RefreshCw size={14} />
                    <span>Retry Live Video</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Action Buttons directly under Viewfinder */}
        <div style={{ display: 'flex', gap: '10px', margin: '14px 16px 0 16px' }}>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '12px 14px',
              background: 'linear-gradient(135deg, #ea580c 0%, #f97316 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              fontWeight: '700',
              fontSize: '13.5px',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(249, 115, 22, 0.4)',
            }}
          >
            <Camera size={18} />
            <span>Snap Ticket Photo</span>
          </button>
          <button
            type="button"
            onClick={() => setShowManualInput(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '12px 16px',
              background: '#1f2937',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '12px',
              fontWeight: '600',
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            <KeyRound size={16} />
            <span>Enter Code</span>
          </button>
        </div>

        {/* Scan Result Overlay Card */}
        {scanResult && (
          <div className={`mobile-scan-result-card ${scanResult.status}`}>
            <div className="scan-result-header">
              <div className="result-badge-icon">
                {scanResult.status === 'success' && <CheckCircle2 size={32} className="text-green" />}
                {scanResult.status === 'warning' && <AlertTriangle size={32} className="text-amber" />}
                {scanResult.status === 'error' && <XCircle size={32} className="text-red" />}
              </div>
              <div className="result-badge-text">
                <span className="result-status-tag">
                  {scanResult.status === 'success' && 'ADMISSION CONFIRMED'}
                  {scanResult.status === 'warning' && (scanResult.title || 'ALREADY USED')}
                  {scanResult.status === 'error' && 'TICKET NOT FOUND'}
                </span>
                <h3>{scanResult.message}</h3>
              </div>
            </div>

            {/* Attendee Details Card */}
            {scanResult.participant ? (
              <div className="result-attendee-card">
                <div className="attendee-name-row">
                  <span className="attendee-name-val">{scanResult.participant.name}</span>
                  <span className="attendee-tier-pill">{scanResult.participant.tierName}</span>
                </div>
                <div className="attendee-meta-grid">
                  <div className="meta-box">
                    <span className="meta-lbl">Ticket Number</span>
                    <span className="meta-val mono">{scanResult.participant.ticketNumber}</span>
                  </div>
                  <div className="meta-box">
                    <span className="meta-lbl">Admitted At</span>
                    <span className="meta-val">{scanResult.time || 'Just now'}</span>
                  </div>
                  <div className="meta-box">
                    <span className="meta-lbl">Pass Quantity</span>
                    <span className="meta-val">
                      {scanResult.participant.ticketsCount} Ticket
                      {scanResult.participant.ticketsCount > 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="meta-box">
                    <span className="meta-lbl">Gate Status</span>
                    <span className="meta-val text-green">Done (Admitted)</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="result-code-card">
                <p>Scanned code: <strong className="mono">{scanResult.code}</strong></p>
                <p className="subtext">Verify that this ticket was purchased for this specific event.</p>
              </div>
            )}

            <button type="button" className="scan-next-btn" onClick={handleScanNext}>
              Scan Next Ticket
            </button>
          </div>
        )}
      </main>

      {/* Manual Code Input Modal / Drawer */}
      {showManualInput && (
        <div className="mobile-manual-backdrop" onClick={() => setShowManualInput(false)}>
          <div className="mobile-manual-modal" onClick={(e) => e.stopPropagation()}>
            <div className="manual-modal-header">
              <h3>Manual Ticket Check-In</h3>
              <p>Type the attendee ticket number or booking ID</p>
            </div>

            <form onSubmit={handleManualSubmit}>
              <div className="manual-input-box">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="e.g. NX-89214, BK-1001"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  autoFocus
                  required
                />
              </div>

              <div className="manual-modal-actions">
                <button
                  type="button"
                  className="manual-cancel-btn"
                  onClick={() => setShowManualInput(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="manual-submit-btn">
                  Verify & Admit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Recent Check-Ins History Feed */}
      {recentCheckIns.length > 0 && (
        <section className="mobile-gate-recent-section">
          <div className="recent-section-header">
            <h4>Recently Admitted ({recentCheckIns.length})</h4>
          </div>
          <div className="recent-list-scroll">
            {recentCheckIns.map((item) => (
              <div key={item.id} className="recent-attendee-row">
                <div className="recent-avatar-circle">{item.name.charAt(0).toUpperCase()}</div>
                <div className="recent-details">
                  <span className="recent-name">{item.name}</span>
                  <span className="recent-meta">
                    {item.ticketNumber} · {item.tierName}
                  </span>
                </div>
                <div className="recent-timestamp">
                  <CheckCircle2 size={12} className="text-green" />
                  <span>{item.time}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Mobile Footer */}
      <footer className="mobile-gate-bottom-nav">
        <Link to={`/events/${eventId}`} className="bottom-nav-link">
          <ExternalLink size={14} />
          <span>Exit to Dashboard</span>
        </Link>
        <span className="bottom-host-tag">
          Host: {profile?.fullName || user?.displayName || user?.email || 'Host Official'}
        </span>
      </footer>
    </div>
  );
};

export default EventCheckInMobile;
