"use client";

import { Calendar, momentLocalizer, View, Views } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import moment from "moment";
import { useState } from "react";
import Button from "./components/Button";

// TODO: cestina
// TODO: cesky timezone
// TODO: casy staci od 10-19h napriklad
// TODO: pridat Agenda view do kalendare jako seznam
// TODO: pridat lekce do kalendare
// TODO: uprava designu kalendare
// TODO: drag and drop

const localizer = momentLocalizer(moment);

export default function Home() {
  const [view, setView] = useState<View>(Views.WORK_WEEK);

  const handleOnChangeView = (selectedView: View) => {
    setView(selectedView);
  };

  return (
    <div className="flex flex-col gap-8 md:flex-row">
      {/* PREHLED LEKCI */}
      <div className="w-full md:w-3/4">
        <h1 className="title">Přehled lekcí</h1>
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
      </div>

      {/* RYCHLE AKCE */}
      <div className="w-full md:w-1/4">
        <h2 className="title">Rychlé akce</h2>
        <div className="flex flex-col gap-3">
          <Button title="Přidat lekci" />
          <Button title="Přidat studenta" />
          <Button title="Přidat kurz" />
        </div>
      </div>
    </div>
  );
}
