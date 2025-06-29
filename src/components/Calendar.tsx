"use client";

import { Calendar, momentLocalizer, View, Views } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import moment from "moment";
import "moment/locale/cs";
import { useCallback, useEffect, useState } from "react";
import { Course, Holiday, Lesson, User } from "@prisma/client";
import CalendarToolbar from "./CalendarToolbar";
import withDragAndDrop, {
  EventInteractionArgs,
} from "react-big-calendar/lib/addons/dragAndDrop";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import Link from "next/link";
import { LessonWithCourseTeacherStudentAndTeacher } from "@/types/LessonType";
import { CzechHoliday } from "@/types/CzechHolidays";
import { set } from "react-hook-form";
import CreateUpdateHolidaysModal from "./forms/CreateUpdateHolidaysModal";

const localizer = momentLocalizer(moment);
moment.locale("cs");

// Typ pro kombinaci lekcí a svátků
type CalendarEvent =
  | LessonWithCourseTeacherStudentAndTeacher
  | CzechHoliday
  | Holiday;

interface Props {
  lessons: LessonWithCourseTeacherStudentAndTeacher[];
  manualHolidays?: Holiday[];
  defaultView?: View;
  availableViews?: View[];
  classNameProp?: string;
  roles?: string[];
  showHolidays?: boolean;
}

export default function CalendarComponent({
  lessons,
  manualHolidays = [],
  defaultView = Views.MONTH,
  availableViews = ["month", "work_week", "day", "agenda"],
  classNameProp = "h-[700px] w-full",
  roles = [],
  showHolidays = true,
}: Props) {
  const [view, setView] = useState<View>(defaultView);
  const [filteredViews, setFilteredViews] = useState<View[]>(availableViews);
  const [date, setDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [holidays, setHolidays] = useState<CzechHoliday[]>([]);
  const [manualHolidaysState, setManualHolidaysState] = useState<Holiday[]>([]);
  const [holidaysLoading, setHolidaysLoading] = useState<boolean>(false);
  const [selectedLesson, setSelectedLesson] =
    useState<LessonWithCourseTeacherStudentAndTeacher | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const [selectedManualHoliday, setSelectedManualHoliday] =
    useState<Holiday | null>(null);
  const [showManualHolidays, setShowManualHolidays] = useState<boolean>(false);

  const isAdmin = roles.includes("admin");

  const fetchHolidays = async (year: number): Promise<CzechHoliday[]> => {
    try {
      const response = await fetch(
        `https://svatkyapi.cz/api/day/${year}-01-01/interval/365`,
      );

      if (!response.ok) {
        console.warn(`Nepodařilo se načíst svátky pro rok ${year}`);
        return [];
      }

      const data = await response.json();

      return data
        .map((day: any) => {
          if (day.date === `${year}-05-01`) {
            return {
              ...day,
              isHoliday: true,
              holidayName: "Svátek práce",
            };
          }

          return day;
        })
        .filter((day: any) => day.isHoliday === true && day.holidayName)
        .map((holiday: any) => ({
          id: `holiday-${year}-${holiday.date}`,
          title: holiday.holidayName,
          startDate: new Date(holiday.date),
          endDate: new Date(holiday.date),
          isHoliday: true as const,
          date: holiday.date,
        }));
    } catch (error) {
      console.error(`Chyba při načítání svátků pro rok ${year}:`, error);
      return [];
    }
  };

  useEffect(() => {
    if (!showHolidays) {
      setHolidays([]);
      return;
    }

    const loadHolidays = async () => {
      setHolidaysLoading(true);

      const currentYear = new Date().getFullYear();
      const viewYear = date.getFullYear();

      const yearsToLoad = Array.from(
        new Set([currentYear, viewYear, viewYear - 1, viewYear + 1]),
      );

      try {
        const holidayPromises = yearsToLoad.map((year) => fetchHolidays(year));
        const holidayArrays = await Promise.all(holidayPromises);
        const allHolidays = holidayArrays.flat();

        setHolidays(allHolidays);
      } catch (error) {
        console.error("Chyba při načítání svátků:", error);
      } finally {
        setHolidaysLoading(false);
      }
    };

    loadHolidays();
  }, [showHolidays, date.getFullYear()]);

  useEffect(() => {
    const combinedEvents: CalendarEvent[] = [...lessons];

    if (manualHolidays.length > 0) {
      combinedEvents.push(...manualHolidays);
    }

    if (showHolidays && holidays.length > 0) {
      combinedEvents.push(...holidays);
    }

    setEvents(combinedEvents);
  }, [lessons, holidays, showHolidays, manualHolidays]);

  const handleOnChangeView = (selectedView: View) => {
    setView(selectedView);
  };

  const handleSelectedEvent = (event: CalendarEvent) => {
    // Kontrola, jestli je to lekce nebo svátek
    if ("isHoliday" in event) {
      return;
    } else if (
      "name" in event &&
      "startDate" in event &&
      "endDate" in event &&
      !("isHoliday" in event)
    ) {
      setSelectedManualHoliday(event as Holiday);
      setShowManualHolidays(true);
      return;
    } else {
      // Je to lekce
      setSelectedLesson(event as LessonWithCourseTeacherStudentAndTeacher);
      setIsModalOpen(true);
    }
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

  const DragAndDropCalendar = withDragAndDrop<CalendarEvent>(Calendar);

const onEventDrop = useCallback(
  async ({ event, start, end }: EventInteractionArgs<CalendarEvent>) => {
    // Zabránit přesunu státních svátků
    if ("isHoliday" in event && event.isHoliday === true) {
      alert("Státní svátky nelze přesouvat.");
      return;
    }

    // Zpracování manuálních prázdnin/svátků
    if (
      "name" in event &&
      "startDate" in event &&
      "endDate" in event &&
      !("isHoliday" in event)
    ) {
      if (!isAdmin) {
        alert("Pouze administrátor může přesouvat manuální prázdniny.");
        return;
      }

      const manualHoliday = event as Holiday;

      try {
        const response = await fetch("/api/holidays", {
          method: "PUT",
          body: JSON.stringify({ 
            id: manualHoliday.id, 
            startDate: start, 
            endDate: end 
          }),
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
          const errorData = await response.json();
          alert(`Chyba při úpravě prázdnin: ${errorData.message || 'Neznámá chyba'}`);
          return;
        }

        // Aktualizace stavu - najdeme a aktualizujeme manuální prázdninu
        const updatedEvents = events.map((existingEvent) => {
          if (
            "id" in existingEvent && 
            existingEvent.id === manualHoliday.id &&
            "name" in existingEvent &&
            !("isHoliday" in existingEvent)
          ) {
            return {
              ...existingEvent,
              startDate: start as Date,
              endDate: end as Date,
            };
          }
          return existingEvent;
        });

        setEvents(updatedEvents);

        // Aktualizace také stavu manuálních prázdnin
        setManualHolidaysState(prev => 
          prev.map(holiday => 
            holiday.id === manualHoliday.id 
              ? { ...holiday, startDate: start as Date, endDate: end as Date }
              : holiday
          )
        );

      } catch (error) {
        console.error("Chyba při přesunu manuální prázdniny:", error);
        alert("Došlo k chybě při přesunu prázdniny.");
      }
      return;
    }

    // Zpracování lekcí (původní logika)
    if (!isAdmin) {
      alert("Pouze administrátor může přesouvat lekce.");
      return;
    }

    const lesson = event as LessonWithCourseTeacherStudentAndTeacher;

    try {
      const response = await fetch("/api/calendar", {
        method: "PUT",
        body: JSON.stringify({ id: lesson.id, startDate: start, endDate: end }),
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(`Chyba při úpravě lekce: ${errorData.message || 'Neznámá chyba'}`);
        return;
      }

      const updatedEvents = events.map((existingEvent) =>
        "id" in existingEvent && existingEvent.id === lesson.id
          ? {
              ...existingEvent,
              startDate: start as Date,
              endDate: end as Date,
            }
          : existingEvent,
      );

      setEvents(updatedEvents);

    } catch (error) {
      console.error("Chyba při přesunu lekce:", error);
      alert("Došlo k chybě při přesunu lekce.");
    }
  },
  [events, isAdmin],
);

const onEventResize = useCallback(
  async ({ event, start, end }: EventInteractionArgs<CalendarEvent>) => {
    // Zabránit změně velikosti státních svátků
    if ("isHoliday" in event && event.isHoliday === true) {
      alert("Státní svátky nelze upravovat.");
      return;
    }

    // Zpracování manuálních prázdnin/svátků
    if (
      "name" in event &&
      "startDate" in event &&
      "endDate" in event &&
      !("isHoliday" in event)
    ) {
      if (!isAdmin) {
        alert("Pouze administrátor může upravovat velikost manuálních prázdnin.");
        return;
      }

      const manualHoliday = event as Holiday;

      try {
        const response = await fetch("/api/holidays", {
          method: "PUT",
          body: JSON.stringify({
            id: manualHoliday.id,
            startDate: start,
            endDate: end,
          }),
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
          const errorData = await response.json();
          alert(`Chyba při úpravě prázdnin: ${errorData.message || 'Neznámá chyba'}`);
          return;
        }

        // Aktualizace stavu - najdeme a aktualizujeme manuální prázdninu
        const updatedEvents = events.map((existingEvent) => {
          if (
            "id" in existingEvent && 
            existingEvent.id === manualHoliday.id &&
            "name" in existingEvent &&
            !("isHoliday" in existingEvent)
          ) {
            return {
              ...existingEvent,
              startDate: start as Date,
              endDate: end as Date,
            };
          }
          return existingEvent;
        });

        setEvents(updatedEvents);

        // Aktualizace také stavu manuálních prázdnin
        setManualHolidaysState(prev => 
          prev.map(holiday => 
            holiday.id === manualHoliday.id 
              ? { ...holiday, startDate: start as Date, endDate: end as Date }
              : holiday
          )
        );

      } catch (error) {
        console.error("Chyba při změně velikosti manuální prázdniny:", error);
        alert("Došlo k chybě při úpravě prázdniny.");
      }
      return;
    }

    // Zpracování lekcí (původní logika)
    if (!isAdmin) {
      alert("Pouze administrátor může upravovat délku lekcí.");
      return;
    }

    const lesson = event as LessonWithCourseTeacherStudentAndTeacher;

    try {
      const response = await fetch("/api/calendar", {
        method: "PUT",
        body: JSON.stringify({
          id: lesson.id,
          startDate: start,
          endDate: end,
        }),
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(`Chyba při úpravě lekce: ${errorData.message || 'Neznámá chyba'}`);
        return;
      }

      const updatedEvents = events.map((existingEvent) =>
        "id" in existingEvent && existingEvent.id === lesson.id
          ? { ...existingEvent, startDate: start as Date, endDate: end as Date }
          : existingEvent,
      );

      setEvents(updatedEvents);

    } catch (error) {
      console.error("Chyba při změne velikosti lekce:", error);
      alert("Došlo k chybě při úpravě lekce.");
    }
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
      {/* Indikátor načítání svátků */}
      {holidaysLoading && (
        <div className="mb-2 text-sm text-gray-600">Načítám svátky...</div>
      )}

      <DragAndDropCalendar
        localizer={localizer}
        events={events}
        views={filteredViews}
        view={view}
        date={date}
        onView={handleOnChangeView}
        onEventDrop={onEventDrop}
        onEventResize={onEventResize}
        titleAccessor={(event: CalendarEvent) => {
          // Kontrola typu události
          if ("isHoliday" in event) {
            return `🎉 ${event.title}`;
          }

          if (
            "name" in event &&
            "startDate" in event &&
            "endDate" in event &&
            !("isHoliday" in event)
          ) {
            return `🎉 ${(event as Holiday).name}`;
          }

          const lesson = event as LessonWithCourseTeacherStudentAndTeacher;
          return `${lesson.course.name} (${lesson.teacher?.lastName || "lektor neznámý"}) \n ${getCourseType(lesson.course)}`;
        }}
        startAccessor="startDate"
        endAccessor="endDate"
        min={new Date(new Date().setHours(8, 0, 0, 0))}
        max={new Date(new Date().setHours(20, 0, 0, 0))}
        culture="cs"
        step={15}
        timeslots={2}
        popup
        messages={messages}
        onSelectEvent={handleSelectedEvent}
        eventPropGetter={(event: CalendarEvent) => {
          if (
            "isHoliday" in event ||
            ("name" in event &&
              "startDate" in event &&
              "endDate" in event &&
              !("isHoliday" in event))
          ) {
            const backgroundColor =
              view !== "agenda"
                ? "#3175AE"
                : isMobile && view !== "agenda"
                  ? "#ccc"
                  : "";
            return {
              style: {
                backgroundColor: backgroundColor,
                borderColor: backgroundColor,
              },
            };
          }

          const lesson = event as LessonWithCourseTeacherStudentAndTeacher;
          const backgroundColor =
            view !== "agenda"
              ? lesson.teacher?.color || "#ff8903"
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
        onNavigate={(newDate) => {
          setDate(new Date(newDate));
        }}
        components={{
          toolbar: CalendarToolbar,
        }}
        resizable={isAdmin}
        selectable
        draggableAccessor={(event: CalendarEvent) => {
          return isAdmin && !("isHoliday" in event);
        }}
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

      {showManualHolidays && selectedManualHoliday && (
        <CreateUpdateHolidaysModal
          isOpen={true}
          onClose={() => setShowManualHolidays(false)}
          data={selectedManualHoliday}
          type="update"
        />
      )}
    </div>
  );
}