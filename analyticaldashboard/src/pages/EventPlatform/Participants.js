import React, { useMemo, useState } from 'react';
import { Download, Trash2 } from 'lucide-react';
import AppLayout from '../../components/AppLayout/AppLayout';
import EmptyState from '../../components/States/EmptyState';
import LoadingState from '../../components/States/LoadingState';
import { useAuth } from '../../context/AuthContext';
import { useRegistrations } from '../../hooks/useRegistrations';
import { downloadCsv, formatDateTime } from '../../utils/formatters';
import { removeRegistration, updateRegistration } from '../../services/firebaseService';
import './EventPlatform.css';
import '../Auth/Auth.css';

const Participants = () => {
  const { user } = useAuth();
  const { registrations, loading, error } = useRegistrations({ hostId: user?.uid });
  const [search, setSearch] = useState('');
  const [attendance, setAttendance] = useState('');
  const rows = useMemo(() => {
    const term = search.toLowerCase();
    return registrations.filter((entry) => {
      const matchesSearch = [entry.participantName, entry.participantEmail, entry.participantPhone, entry.participant?.city]
        .join(' ')
        .toLowerCase()
        .includes(term);
      const matchesAttendance = attendance ? entry.attendanceStatus === attendance : true;
      return matchesSearch && matchesAttendance;
    });
  }, [registrations, search, attendance]);

  const exportRows = () =>
    downloadCsv(
      'participants.csv',
      rows.map((entry) => ({
        name: entry.participantName,
        email: entry.participantEmail,
        phone: entry.participantPhone,
        city: entry.participant?.city,
        registrationDate: formatDateTime(entry.registrationDate),
        attendanceStatus: entry.attendanceStatus,
      }))
    );

  return (
    <AppLayout searchPlaceholder="Search participants">
      <main className="page-shell">
        <div className="page-heading">
          <div>
            <h1>Participants</h1>
            <p>Search registrations, export CSVs, remove participants, and run check-ins.</p>
          </div>
          <button className="ghost-btn" onClick={exportRows}><Download size={16} /> Export CSV</button>
        </div>
        <section className="toolbar">
          <label className="form-field"><span>Search</span><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Name, email, phone, city" /></label>
          <label className="form-field"><span>Attendance</span><select value={attendance} onChange={(e) => setAttendance(e.target.value)}><option value="">All</option><option>Not Checked In</option><option>Checked In</option><option>Absent</option></select></label>
        </section>
        {error && <div className="alert error">{error}</div>}
        {loading ? <LoadingState label="Loading participants" /> : (
          <div className="table-panel">
            {rows.length ? (
              <table className="data-table">
                <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Registration Date</th><th>Attendance Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {rows.map((entry) => (
                    <tr key={entry.id}>
                      <td><strong>{entry.participantName}</strong><p className="muted">{entry.participant?.gender}, {entry.participant?.age}</p></td>
                      <td>{entry.participantEmail}</td>
                      <td>{entry.participantPhone}</td>
                      <td>{formatDateTime(entry.registrationDate)}</td>
                      <td>
                        <select value={entry.attendanceStatus} onChange={(e) => updateRegistration(entry.id, { attendanceStatus: e.target.value })}>
                          <option>Not Checked In</option><option>Checked In</option><option>Absent</option>
                        </select>
                      </td>
                      <td><button className="danger-btn" onClick={() => removeRegistration({ registrationId: entry.id, eventId: entry.eventId })}><Trash2 size={15} /> Remove</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <EmptyState title="No participants found" message="Registrations will appear here in real time." />}
          </div>
        )}
      </main>
    </AppLayout>
  );
};

export default Participants;
