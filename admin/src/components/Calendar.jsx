import React from 'react'
import { Calendar as ReactCalendar } from 'react-calendar'
import '../index.css'
import 'react-calendar/dist/Calendar.css';


function CalendarWidget({ appointments = [], onDateClick, selectedDate }) {
  // Helper to check if a date has appointments
  const hasAppointment = (date) => {
    return appointments.some(app =>
      new Date(app.date).toDateString() === date.toDateString()
    );
  };

  return (
    <div className="calendar-wrapper p-2">
      <ReactCalendar
        className="w-full border-none rounded-xl shadow-none font-sans"
        onClickDay={onDateClick}
        value={selectedDate}
        tileContent={({ date, view }) => view === 'month' && hasAppointment(date) ? (
          <div className="flex justify-center mt-1">
            <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
          </div>
        ) : null}
      />
      <style>{`
        .react-calendar {
          width: 100%;
          background: white;
          border: none;
          font-family: inherit;
        }
        .react-calendar__tile--active {
          background-color: #9381ff !important;
          color: white !important;
          border-radius: 8px;
        }
        .react-calendar__tile--now {
          background: var(--accent-cream);
          color: black;
          border-radius: 8px;
        }
        .react-calendar__tile:hover {
            background-color: #f3f4f6;
            border-radius: 8px;
        }
        .react-calendar__navigation button {
            color: var(--primary);
            min-width: 44px;
            background: none;
            font-size: 16px;
            margin-top: 8px;
        }
        .react-calendar__month-view__weekdays {
            font-size: 0.8em;
            font-weight: bold;
            color: #9ca3af;
            text-decoration: none;
        }
      `}</style>
    </div>
  )
}

export default CalendarWidget;