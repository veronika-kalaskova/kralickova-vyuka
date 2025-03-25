"use client";

import { Calendar, momentLocalizer, View, Views } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import moment from "moment";
import { useState } from "react";

// TODO: cestina
// TODO: cesky timezone
// TODO: casy staci od 10-19h napriklad
// TODO: pridat Agenda view do kalendare jako seznam
// TODO: pridat lekce do kalendare
// TODO: uprava designu kalendare
// TODO: drag and drop

const localizer = momentLocalizer(moment);

// interface props {
//   users: Uzivatel[];
//   roles: UzivatelRole[];
// }

export default function CalendarComponent() {
  const [view, setView] = useState<View>(Views.WORK_WEEK);

  const handleOnChangeView = (selectedView: View) => {
    setView(selectedView);
  };

  return (
    <Calendar
      localizer={localizer}
      events={[]}
      views={["work_week", "day"]}
      view={view}
      onView={handleOnChangeView}
      startAccessor="start"
      endAccessor="end"
      style={{ height: 500 }}
    />
  );
}
