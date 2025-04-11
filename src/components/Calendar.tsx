"use client";

import { Calendar, momentLocalizer, View, Views } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import moment from "moment";
import { useState } from "react";
import { Course, Lesson, User } from "@prisma/client";

// TODO: cestina
// TODO: cesky timezone
// TODO: casy staci od 10-19h napriklad
// TODO: pridat Agenda view do kalendare jako seznam
// TODO: pridat lekce do kalendare
// TODO: uprava designu kalendare
// TODO: drag and drop

const localizer = momentLocalizer(moment);

interface Props {
  lessons: (Lesson & {
    course: Course & {
      teacher: User | null;
    };
  })[];
}

export default function CalendarComponent({ lessons }: Props) {
  const [view, setView] = useState<View>(Views.WORK_WEEK);

  const handleOnChangeView = (selectedView: View) => {
    setView(selectedView);
  };

  return (
    <Calendar
      localizer={localizer}
      events={lessons}
      views={["work_week", "day"]}
      view={view}
      onView={handleOnChangeView}
      startAccessor="startDate"
      endAccessor="endDate"
      titleAccessor={(event) => event.course.name}
      min={new Date(1970, 1, 1, 10, 0)}
      max={new Date(1970, 1, 1, 19, 0)}
      culture="cs"
      step={30} 
      timeslots={1} 
    />
  );
}
