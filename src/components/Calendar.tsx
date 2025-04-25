"use client";

import {
  Calendar,
  momentLocalizer,
  View,
  Views,
  stringOrDate,
} from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import moment from "moment";
import "moment/locale/cs";
import { useCallback, useState } from "react";
import { Course, Lesson, User } from "@prisma/client";
import CalendarToolbar from "./CalendarToolbar";
import withDragAndDrop, {
  EventInteractionArgs,
} from "react-big-calendar/lib/addons/dragAndDrop";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import Link from "next/link";

const localizer = momentLocalizer(moment);
moment.locale("cs");

type LessonType = Lesson & {
  course: Course & {
    teacher: User | null;
  };
};

interface Props {
  lessons: LessonType[];
  defaultView?: View;
  availableViews?: View[];
  classNameProp?: string;
}

export default function CalendarComponent({
  lessons,
  defaultView = Views.MONTH,
  availableViews = ["month", "work_week", "day", "agenda"],
  classNameProp = "h-[700px] w-full",
}: Props) {
  const [view, setView] = useState<View>(defaultView);
  const [date, setDate] = useState<Date>(new Date());

  const [events, setEvents] = useState<LessonType[]>(lessons);

  const [selectedLesson, setSelectedLesson] = useState<LessonType | null>(null);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const handleOnChangeView = (selectedView: View) => {
    setView(selectedView);
  };

  const handleSelectedEvent = (event: LessonType) => {
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

  const DragAndDropCalendar = withDragAndDrop<LessonType>(Calendar);

  const onEventDrop = useCallback(
    async ({ event, start, end }: EventInteractionArgs<LessonType>) => {
      const response = await fetch("/api/calendar", {
        method: "PUT",
        body: JSON.stringify({ id: event.id, startDate: start, endDate: end }),
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        alert("Chyba při úpravě lekce.");
        return;
      }

      const updatedEvents = events.map((existingEvent) =>
        existingEvent.id === event.id
          ? {
              ...existingEvent,
              startDate: start as Date,
              endDate: end as Date,
            }
          : existingEvent,
      );

      setEvents(updatedEvents);
      console.log("Event moved:", { event, start, end });
    },
    [events],
  );

  const onEventResize = useCallback(
    async ({ event, start, end }: EventInteractionArgs<LessonType>) => {
      const newStart = typeof start === "string" ? new Date(start) : start;
      const newEnd = typeof end === "string" ? new Date(end) : end;

      const response = await fetch("/api/calendar", {
        method: "PUT",
        body: JSON.stringify({
          id: event.id,
          startDate: newStart,
          endDate: newEnd,
        }),
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        alert("Chyba při úpravě lekce.");
        return;
      }

      const updatedEvents = events.map((existingEvent) =>
        existingEvent.id === event.id
          ? { ...existingEvent, startDate: newStart, endDate: newEnd }
          : existingEvent,
      );

      setEvents(updatedEvents);
    },
    [events],
  );

  return (
    <div className={classNameProp}>
      <DragAndDropCalendar
        localizer={localizer}
        events={events}
        views={availableViews}
        view={view}
        date={date}
        onView={handleOnChangeView}
        onEventDrop={onEventDrop}
        onEventResize={onEventResize}
        titleAccessor={(event) =>
          `${event.course.name} (${event.course.teacher?.lastName || "lektor neznámý"})`
        }
        startAccessor={(event) => new Date(event.startDate)}
        endAccessor={(event) => new Date(event.endDate)}
        min={new Date(1970, 1, 1, 8, 0)}
        max={new Date(1970, 1, 1, 20, 0)}
        culture="cs"
        step={30}
        timeslots={1}
        popup
        messages={messages}
        onSelectEvent={handleSelectedEvent}
        doShowMoreDrillDown
        style={{ height: "100%" }}
        onNavigate={(date) => {
          setDate(new Date(date));
        }}
        components={{
          toolbar: CalendarToolbar,
        }}
        resizable
        selectable
        draggableAccessor={() => true}
      />

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
              <Link href={`/lekce/${selectedLesson.id}`}>
                <button className="cursor-pointer rounded-lg bg-orange-400 px-4 py-3 font-medium text-white transition-all hover:bg-orange-500">
                  Přejít na detail
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
