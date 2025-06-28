"use client";

import { Calendar, momentLocalizer, View, Views } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import moment from "moment";
import "moment/locale/cs";
import { useCallback, useEffect, useState } from "react";
import { Course, Lesson, User } from "@prisma/client";
import CalendarToolbar from "./CalendarToolbar";
import withDragAndDrop, {
  EventInteractionArgs,
} from "react-big-calendar/lib/addons/dragAndDrop";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import Link from "next/link";
import { LessonWithCourseTeacherStudentAndTeacher } from "@/types/LessonType";

const localizer = momentLocalizer(moment);
moment.locale("cs"); // kalendar do cestiny

interface Props {
  lessons: LessonWithCourseTeacherStudentAndTeacher[];
  defaultView?: View;
  availableViews?: View[];
  classNameProp?: string;
  roles?: string[];
}

export default function SmallCalendarComponent({
  lessons,
  defaultView = Views.MONTH,
  availableViews = ["month", "work_week", "day", "agenda"],
  classNameProp = "h-[700px] w-full",
  roles = [],
}: Props) {
  const [view, setView] = useState<View>(defaultView);
  const [filteredViews, setFilteredViews] = useState<View[]>(availableViews);

  const [date, setDate] = useState<Date>(new Date());

  const [events, setEvents] = useState<LessonWithCourseTeacherStudentAndTeacher[]>(lessons);

  const [selectedLesson, setSelectedLesson] =
    useState<LessonWithCourseTeacherStudentAndTeacher | null>(null);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const isAdmin = roles.includes("admin");

  const handleOnChangeView = (selectedView: View) => {
    setView(selectedView);
  };

  const handleSelectedEvent = (event: LessonWithCourseTeacherStudentAndTeacher) => {
    setSelectedLesson(event);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedLesson(null);
    setIsModalOpen(false);
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

  const DragAndDropCalendar =
    withDragAndDrop<LessonWithCourseTeacherStudentAndTeacher>(Calendar);

  const onEventDrop = useCallback(
    async ({
      event,
      start,
      end,
    }: EventInteractionArgs<LessonWithCourseTeacherStudentAndTeacher>) => {
      if (!isAdmin) {
        alert("Pouze administrátor může přesouvat lekce.");
        return;
      }

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
    },
    [events, isAdmin],
  );

  const onEventResize = useCallback(
    async ({
      event,
      start,
      end,
    }: EventInteractionArgs<LessonWithCourseTeacherStudentAndTeacher>) => {
      if (!isAdmin) {
        alert("Pouze administrátor může upravovat délku lekcí.");
        return;
      }

      const response = await fetch("/api/calendar", {
        method: "PUT",
        body: JSON.stringify({
          id: event.id,
          startDate: start,
          endDate: end,
        }),
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        alert("Chyba při úpravě lekce.");
        return;
      }

      const updatedEvents = events.map((existingEvent) =>
        existingEvent.id === event.id
          ? { ...existingEvent, startDate: start as Date, endDate: end as Date }
          : existingEvent,
      );

      setEvents(updatedEvents);
    },
    [events, isAdmin],
  );

  const getCourseType = (course: Course) => {
    if (course.isIndividual) {
      return "Individuální";
    } else if (course.isPair) {
      return "Párový";
    } else {
      return "Skupinový";
    }
  };

  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      setView("day");
      setFilteredViews(["agenda", "work_week", "day"]);
      setIsMobile(true);
    } else {
      setFilteredViews(availableViews);
      setIsMobile(false);
    }
  }, []);

  return (
    <div className={classNameProp}>
      <DragAndDropCalendar
        localizer={localizer}
        events={events}
        views={filteredViews}
        view={view}
        date={date}
        onView={handleOnChangeView}
        onEventDrop={onEventDrop}
        onEventResize={onEventResize}
        titleAccessor={(event) =>
          `${event.course.name} (${event.teacher?.lastName || "lektor neznámý"}) \n ${getCourseType(event.course)}`
        }
        startAccessor="startDate" // vlastnost startDate se bere jako zacatek
        endAccessor="endDate"
        min={new Date(new Date().setHours(8, 0, 0, 0))}
        max={new Date(new Date().setHours(20, 0, 0, 0))}
        culture="cs"
        step={15}
        timeslots={2} // 2 bloky po 15 minutach - pro drag and drop
        popup
        messages={messages}
        onSelectEvent={handleSelectedEvent}
        eventPropGetter={(event) => {
          const backgroundColor =
            view !== "agenda"
              ? event.teacher?.color || "#ff8903"
              : isMobile && view !== "agenda"
                ? "#ccc"
                : "";

          return {
            style: {
              backgroundColor,
              borderColor: backgroundColor,
            },
          };
        }}
        doShowMoreDrillDown
        style={{ height: "100%" }}
        onNavigate={(date) => {
          setDate(new Date(date));
        }}
        components={{
          toolbar: CalendarToolbar,
        }}
        resizable={isAdmin}
        selectable
        draggableAccessor={() => isAdmin}
      />

      {isModalOpen && selectedLesson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.49)]">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-xl font-semibold">
              {selectedLesson.course.name}
            </h2>
            <p className="mb-2">
              <strong>Lektor:</strong>{" "}
              {selectedLesson.teacher?.firstName ?? "neznámý"}{" "}
              {selectedLesson.teacher?.lastName ?? "neznámý"}
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