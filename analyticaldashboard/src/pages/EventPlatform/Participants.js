import React, { useMemo, useState } from 'react';
import { CheckCircle2, Download, Eye, Search, ShieldAlert, Ticket, Trash2, UserCheck, Users } from 'lucide-react';
import AppLayout from '../../components/AppLayout/AppLayout';
import EmptyState from '../../components/States/EmptyState';
import LoadingState from '../../components/States/LoadingState';
import { useAuth } from '../../context/AuthContext';
import { useRegistrations } from '../../hooks/useRegistrations';
import { currency, downloadCsv, formatDateTime } from '../../utils/formatters';
import { removeRegistration, updateRegistration } from '../../services/firebaseService';
import './EventPlatform.css';
import './EventManagementFlow.css';
import '../Auth/Auth.css';

const getParticipantValue = (entry, field) => entry[field] || entry.participant?.[field] || '';
const getAmount = (entry) => Number(entry.amount || entry.totalAmount || entry.ticketPrice || entry.price || 0);

const Participants = () => {
  const { user } = useAuth();
  const { registrations, loading, error } = useRegistrations({ hostId: user?.uid });
  const [search, setSearch] = useState('');
  const [attendance, setAttendance] = useState('');
  const [ticketStatus, setTicketStatus] = useState('');
  const [selected, setSelected] = useState(null);

  const rows = useMemo(() => {
    const term = search.toLowerCase();
    return registrations.filter((entry) => {
      const matchesSearch = [
        entry.participantName,
        entry.participantEmail,
        entry.participantPhone,
        entry.eventTitle,
        entry.ticketNumber,
        entry.participant?.city,
        entry.participant?.club,
        entry.participant?.vehicleNumber,
      ]
        .join(' ')
        .toLowerCase()
        .includes(term);
      const matchesAttendance = attendance ? entry.attendanceStatus === attendance : true;
      const matchesTicket = ticketStatus ? entry.status === ticketStatus : true;
      return matchesSearch && matchesAttendance && matchesTicket;
    });
  }, [registrations, search, attendance, ticketStatus]);

  const stats = useMemo(() => {
    const checkedIn = registrations.filter((entry) => entry.attendanceStatus === 'Checked In').length;
    const absent = registrations.filter((entry) => entry.attendanceStatus === 'Absent').length;
    const revenue = registrations.reduce((sum, entry) => sum + getAmount(entry), 0);
    return {
      total: registrations.length,
      checkedIn,
      pending: registrations.length - checkedIn - absent,
      absent,
      revenue,
      attendanceRate: registrations.length ? Math.round((checkedIn / registrations.length) * 100) : 0,
    };
  }, [registrations]);

  const exportRows = () =>
    downloadCsv(
      'participants.csv',
      rows.map((entry) => ({
        registrationId: entry.registrationId || entry.id,
        ticketNumber: entry.ticketNumber,
        eventId: entry.eventId,
        eventTitle: entry.eventTitle,
        name: entry.participantName,
        email: entry.participantEmail,
        phone: entry.participantPhone,
        gender: entry.participant?.gender,
        age: entry.participant?.age,
        city: entry.participant?.city,
        club: entry.participant?.club,
        vehicleNumber: entry.participant?.vehicleNumber,
        emergencyContact: entry.participant?.emergencyContact,
        registrationDate: formatDateTime(entry.registrationDate),
        ticketStatus: entry.status,
        attendanceStatus: entry.attendanceStatus,
        amount: getAmount(entry),
      }))
    );

  const setAttendanceStatus = (entry, nextStatus) =>
    updateRegistration(entry.id, {
      attendanceStatus: nextStatus,
      checkInTime: nextStatus === 'Checked In' ? new Date().toISOString() : entry.checkInTime || null,
    });

  return (
    <AppLayout searchPlaceholder="Search participants, ticket IDs, vehicles, clubs, or cities">
      <main className="page-shell management-flow">
        <div className="flow-hero compact participant-hero">
          <div>
            <span className="eyebrow">Participant operations</span>
            <h1>Check-ins, attendee records, and customer support in one directory.</h1>
            <p>Run gate operations, inspect profiles, export lists, and update attendance directly against Firestore registrations.</p>
          </div>
          <button className="ghost-btn" onClick={exportRows}><Download size={16} /> Export CSV</button>
        </div>

        <section className="ops-metric-grid">
          <div className="ops-metric"><Users size={18} /><span>Total Participants</span><strong>{stats.total}</strong><p>{rows.length} visible after filters</p></div>
          <div className="ops-metric"><UserCheck size={18} /><span>Checked In</span><strong>{stats.checkedIn}</strong><p>{stats.attendanceRate}% attendance rate</p></div>
          <div className="ops-metric"><ShieldAlert size={18} /><span>Pending Gate</span><strong>{stats.pending}</strong><p>{stats.absent} marked absent</p></div>
          <div className="ops-metric"><Ticket size={18} /><span>Ticket Value</span><strong>{currency(stats.revenue)}</strong><p>From registration records</p></div>
        </section>

        <section className="toolbar enterprise-toolbar participant-toolbar">
          <label className="form-field search-field"><span>Search</span><div className="input-icon-wrap"><Search size={16} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Name, email, phone, club, city, ticket" /></div></label>
          <label className="form-field"><span>Attendance</span><select value={attendance} onChange={(e) => setAttendance(e.target.value)}><option value="">All</option><option>Not Checked In</option><option>Checked In</option><option>Absent</option></select></label>
          <label className="form-field"><span>Ticket Status</span><select value={ticketStatus} onChange={(e) => setTicketStatus(e.target.value)}><option value="">All</option><option>Confirmed</option><option>Pending</option><option>Rejected</option><option>Cancelled</option></select></label>
        </section>

        {error && <div className="alert error">{error}</div>}
        {loading ? <LoadingState label="Loading participants" /> : (
          <section className="participant-workspace">
            <div className="table-panel enterprise-table-panel">
              {rows.length ? (
                <table className="data-table enterprise-table">
                  <thead><tr><th>Participant</th><th>Contact</th><th>Ticket</th><th>Profile Data</th><th>Attendance</th><th>Actions</th></tr></thead>
                  <tbody>
                    {rows.map((entry) => (
                      <tr key={entry.id}>
                        <td>
                          <div className="participant-cell">
                            <div className="avatar-token">{(entry.participantName || 'G').slice(0, 1)}</div>
                            <div>
                              <strong>{entry.participantName || 'Guest attendee'}</strong>
                              <p className="muted">{entry.eventTitle || 'Event registration'}</p>
                              <span className="micro-id">{entry.ticketNumber || entry.registrationId || entry.id}</span>
                            </div>
                          </div>
                        </td>
                        <td>{entry.participantEmail || 'No email'}<p className="muted">{entry.participantPhone || 'No phone'}</p></td>
                        <td><span className={`badge ${entry.status === 'Confirmed' ? 'success' : entry.status === 'Rejected' ? 'danger' : 'warning'}`}>{entry.status || 'Confirmed'}</span><p className="muted">{currency(getAmount(entry))}</p></td>
                        <td>{getParticipantValue(entry, 'city') || 'City not set'}<p className="muted">{getParticipantValue(entry, 'gender') || 'Gender'} · {getParticipantValue(entry, 'age') || 'Age'}</p></td>
                        <td>
                          <select value={entry.attendanceStatus || 'Not Checked In'} onChange={(e) => setAttendanceStatus(entry, e.target.value)}>
                            <option>Not Checked In</option><option>Checked In</option><option>Absent</option>
                          </select>
                        </td>
                        <td>
                          <div className="action-row">
                            <button className="ghost-btn" onClick={() => setSelected(entry)}><Eye size={15} /> View</button>
                            <button className="ghost-btn" onClick={() => setAttendanceStatus(entry, 'Checked In')}><CheckCircle2 size={15} /> Check In</button>
                            <button className="danger-btn" onClick={() => removeRegistration({ registrationId: entry.id, eventId: entry.eventId })}><Trash2 size={15} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : <EmptyState title="No participants found" message="Registrations will appear here in real time." />}
            </div>

            <aside className="profile-drawer">
              {selected ? (
                <>
                  <div className="drawer-head">
                    <div className="avatar-token large">{(selected.participantName || 'G').slice(0, 1)}</div>
                    <div>
                      <h2>{selected.participantName || 'Guest attendee'}</h2>
                      <p className="muted">{selected.participantEmail || 'No email'} · {selected.participantPhone || 'No phone'}</p>
                    </div>
                  </div>
                  <div className="drawer-grid">
                    <div><span>Ticket</span><strong>{selected.ticketNumber || selected.id}</strong></div>
                    <div><span>Status</span><strong>{selected.status || 'Confirmed'}</strong></div>
                    <div><span>Attendance</span><strong>{selected.attendanceStatus || 'Not Checked In'}</strong></div>
                    <div><span>Registered</span><strong>{formatDateTime(selected.registrationDate)}</strong></div>
                  </div>
                  <section className="drawer-section">
                    <h3>Participant Profile</h3>
                    <p><strong>City:</strong> {getParticipantValue(selected, 'city') || 'Not provided'}</p>
                    <p><strong>Gender/Age:</strong> {getParticipantValue(selected, 'gender') || 'Not provided'} / {getParticipantValue(selected, 'age') || 'Not provided'}</p>
                    <p><strong>Club:</strong> {getParticipantValue(selected, 'club') || 'Not provided'}</p>
                    <p><strong>Vehicle:</strong> {getParticipantValue(selected, 'vehicleNumber') || getParticipantValue(selected, 'bikeModel') || 'Not provided'}</p>
                    <p><strong>Emergency:</strong> {getParticipantValue(selected, 'emergencyContact') || 'Not provided'}</p>
                  </section>
                  <section className="drawer-section">
                    <h3>Operational Notes</h3>
                    <p className="muted">{getParticipantValue(selected, 'medicalNotes') || getParticipantValue(selected, 'specialRequests') || 'No medical notes or special requests recorded.'}</p>
                  </section>
                </>
              ) : (
                <EmptyState title="Select a participant" message="Open a row to inspect profile, ticket, check-in, and support data." />
              )}
            </aside>
          </section>
        )}
      </main>
    </AppLayout>
  );
};

export default Participants;
