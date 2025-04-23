"use client";

import { Calendar, momentLocalizer, View, Views } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import moment from "moment";
import "moment/locale/cs";
import { useState } from "react";
import { Course, Lesson, User } from "@prisma/client";
import CalendarToolbar from "./CalendarToolbar";

const localizer = momentLocalizer(moment);
moment.locale("cs");

interface Props {
  lessons: (Lesson & {
    course: Course & {
      teacher: User | null;
    };
  })[];
  defaultView?: View; 
  availableViews?: View[];
  classNameProp?: string;
}

export default function CalendarComponent({
  lessons,
  defaultView = Views.MONTH,
  availableViews = ["month", "work_week", "day", "agenda"],
  classNameProp = "h-[700px] w-full"
}: Props) {
  const [view, setView] = useState<View>(defaultView);
  const [selectedLesson, setSelectedLesson] = useState<
    (typeof lessons)[0] | null
  >(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOnChangeView = (selectedView: View) => {
    setView(selectedView);
  };

  const handleSelectedEvent = (event: (typeof lessons)[0]) => {
    setSelectedLesson(event);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedLesson(null);
  };

  const messages = {
    today: "Dnes",
    previous: "Zpět",
    next: "Další",
    month: "Měsíc",
    week: "Týden",
    work_week: "Týden",
    day: "Den",
    agenda: "Seznam",
    date: "Datum",
    time: "Čas",
    event: "Událost",
    noEventsInRange: "Žádné události v tomto období",
  };

  return (
    <div className={`${classNameProp}`}>
      <Calendar
        localizer={localizer}
        events={lessons}
        views={availableViews}
        view={view}
        onView={handleOnChangeView}
        startAccessor="startDate"
        endAccessor="endDate"
        titleAccessor={(event) =>
          `${event.course.name} (${event.course.teacher?.lastName || "lektor neznámý"})`
        }
        min={new Date(1970, 1, 1, 8, 0)}
        max={new Date(1970, 1, 1, 20, 0)}
        culture="cs"
        step={30}
        timeslots={1}
        popup
        messages={messages}
        onSelectEvent={handleSelectedEvent}
        doShowMoreDrillDown
        style={{height: '100%'}}
        components={{
          toolbar: CalendarToolbar,
        }}
      />

      {/* MODAL */}
      {isModalOpen && selectedLesson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.49)]">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-xl font-semibold">
              {selectedLesson.course.name}
            </h2>
            <p className="mb-2">
              <strong>Lektor:</strong>{" "}
              {selectedLesson.course.teacher?.firstName ?? "neznámý"}
            </p>
            <p className="mb-2">
              <strong>Začátek:</strong>{" "}
              {moment(selectedLesson.startDate).format("D. M. YYYY HH:mm")}
            </p>
            <p className="mb-2">
              <strong>Konec:</strong>{" "}
              {moment(selectedLesson.endDate).format("D. M. YYYY HH:mm")}
            </p>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeModal}
                className="cursor-pointer rounded-lg bg-gray-100 px-4 py-3 font-medium text-gray-800 transition-all hover:bg-orange-100"
              >
                Zavřít
              </button>
              <button className="cursor-pointer rounded-lg bg-orange-400 px-4 py-3 font-medium text-white transition-all hover:bg-orange-500">
                Upravit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
