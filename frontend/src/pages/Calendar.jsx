import { useState, useEffect } from 'react';
import { getSchedules } from '../api/client';

export default function Calendar() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    getSchedules().then(res => {
      const active = res.data.filter(s => s.status !== 'cancelled');
      const projected = [];
      const today = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 90);

      active.forEach(s => {
        let current = new Date(s.next_order_date);
        while (current <= endDate) {
          if (current >= today) {
            projected.push({
              date: current.toISOString().split('T')[0],
              product: s.product_name,
              quantity: s.quantity,
              frequency: s.frequency,
              status: s.status,
            });
          }
          if (s.frequency === 'daily') current.setDate(current.getDate() + 1);
          else if (s.frequency === 'weekly') current.setDate(current.getDate() + 7);
          else if (s.frequency === 'monthly') current.setMonth(current.getMonth() + 1);
          else if (s.frequency === 'odd_days') {
            current.setDate(current.getDate() + 1);
            while (current.getDate() % 2 === 0) current.setDate(current.getDate() + 1);
          }
          else if (s.frequency === 'even_days') {
            current.setDate(current.getDate() + 1);
            while (current.getDate() % 2 !== 0) current.setDate(current.getDate() + 1);
          }
          else break;
        }
      });
      setEvents(projected);
    }).finally(() => setLoading(false));
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMo = new Date(year, month + 1, 0).getDate();
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const eventsForDay = (day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(e => e.date === dateStr);
  };

  const today = new Date();
  const isToday = (day) =>
    today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;

  const selectedEvents = selectedDate ? eventsForDay(selectedDate) : [];

  if (loading) return (
    <div className="page">
      <div style={{ color: '#64748B', textAlign: 'center', paddingTop: 60 }}>Loading calendar...</div>
    </div>
  );

  return (
    <div className="page">
      <h1 className="page-title">Delivery Calendar</h1>
      <p className="page-subtitle">View all upcoming scheduled deliveries.</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24 }}>
        {/* Calendar grid */}
        <div className="card" style={{ padding: 28 }}>
          {/* Month navigation */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <button
              onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
              style={{ background: 'none', border: '1px solid #E2E8F0', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', color: '#64748B', fontSize: 16 }}
            >
              &larr;
            </button>
            <div style={{ fontFamily: 'Fraunces, serif', fontSize: 20, fontWeight: 600, color: '#0F172A' }}>
              {monthName}
            </div>
            <button
              onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
              style={{ background: 'none', border: '1px solid #E2E8F0', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', color: '#64748B', fontSize: 16 }}
            >
              &rarr;
            </button>
          </div>

          {/* Day headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 8 }}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} style={{ textAlign: 'center', fontSize: 12, fontWeight: 600, color: '#94A3B8', padding: '4px 0' }}>
                {d}
              </div>
            ))}
          </div>

          {/* Days */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
            {Array(firstDay).fill(null).map((_, i) => <div key={`e-${i}`} />)}
            {Array(daysInMo).fill(null).map((_, i) => {
              const day = i + 1;
              const dayEvents = eventsForDay(day);
              const isTd = isToday(day);
              const isSel = selectedDate === day;

              return (
                <div
                  key={day}
                  onClick={() => setSelectedDate(day)}
                  style={{
                    padding: '8px 4px',
                    textAlign: 'center',
                    borderRadius: 8,
                    cursor: 'pointer',
                    background: isSel ? '#CCFBF1' : isTd ? '#F0FDF4' : 'transparent',
                    border: isSel
                      ? '1.5px solid #99F6E4'
                      : isTd
                        ? '1.5px solid #BBF7D0'
                        : '1.5px solid transparent',
                    transition: 'all 0.1s',
                  }}
                >
                  <div style={{
                    fontSize: 13,
                    fontWeight: isTd ? 700 : 400,
                    color: isTd ? '#16A34A' : isSel ? '#0D9488' : '#0F172A',
                    marginBottom: 4,
                  }}>
                    {day}
                  </div>
                  {dayEvents.length > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
                      {dayEvents.slice(0, 3).map((e, ei) => (
                        <div key={ei} style={{
                          width: 6, height: 6, borderRadius: '50%',
                          background: e.status === 'active' ? '#0D9488' : '#F59E0B',
                        }} />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', gap: 20, marginTop: 20, fontSize: 12, color: '#64748B' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#0D9488' }} />
              Active
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#F59E0B' }} />
              Paused
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="card" style={{ padding: 24, alignSelf: 'start' }}>
          <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: 18, fontWeight: 600, color: '#0F172A', marginBottom: 16 }}>
            {selectedDate
              ? `${currentDate.toLocaleString('default', { month: 'long' })} ${selectedDate}`
              : 'Select a date'}
          </h3>

          {!selectedDate && (
            <p style={{ fontSize: 13, color: '#94A3B8', lineHeight: 1.6 }}>
              Click on any date in the calendar to view scheduled deliveries for that day.
            </p>
          )}

          {selectedDate && selectedEvents.length === 0 && (
            <p style={{ fontSize: 14, color: '#64748B' }}>No deliveries scheduled on this date.</p>
          )}

          {selectedEvents.map((e, i) => (
            <div key={i} style={{
              padding: '14px 16px',
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderLeft: `3px solid ${e.status === 'active' ? '#0D9488' : '#F59E0B'}`,
              borderRadius: 10,
              marginBottom: 10,
            }}>
              <div style={{ fontWeight: 600, fontSize: 14, color: '#0F172A', marginBottom: 4 }}>{e.product}</div>
              <div style={{ fontSize: 12, color: '#64748B' }}>Qty: {e.quantity} &middot; {e.frequency}</div>
              <span className={`badge ${e.status === 'active' ? 'badge-blue' : 'badge-yellow'}`} style={{ marginTop: 8, display: 'inline-flex' }}>
                {e.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}