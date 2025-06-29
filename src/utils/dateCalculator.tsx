// utils/dateCalculator.ts

import { Holiday } from "@prisma/client";

interface ApiHolidayInfo {
  date: string;
  dayNumber: string;
  dayInWeek: string;
  monthNumber: string;
  month: {
    nominative: string;
    genitive: string;
  };
  year: string;
  name: string;
  isHoliday: boolean;
  holidayName: string | null;
}

export async function calculateCourseEndDate(
  startDate: string,
  manualHolidays: Holiday[]
): Promise<string> {
  const REQUIRED_LESSONS = 15;

  try {
    const bufferWeeks = 10; 
    const totalDays = (REQUIRED_LESSONS + bufferWeeks) * 7;

    const response = await fetch(
      `https://svatkyapi.cz/api/day/${startDate}/interval/${totalDays}`,
    );

    if (!response.ok) {
      throw new Error("Chyba při načítání dat o svátcích");
    }

    const holidayData: ApiHolidayInfo[] = await response.json();

    let lessonsPlanned = 0;
    let currentIndex = 0;

    while (lessonsPlanned < REQUIRED_LESSONS && currentIndex < holidayData.length) {
      const dayInfo = holidayData[currentIndex];

      const date = dayInfo.date; // yyyy-mm-dd
      const isManualHoliday = manualHolidays.some(holiday => {
        const d = new Date(date);
        const start = new Date(holiday.startDate);
        const end = new Date(holiday.endDate);
        return d >= start && d <= end;
      });

      if (!dayInfo.isHoliday && !isManualHoliday) {
        lessonsPlanned++;
      }

      currentIndex += 7; // další týden
    }

    const start = new Date(startDate);
    start.setDate(start.getDate() + (currentIndex - 7));

    return start.toISOString().split("T")[0];
  } catch (error) {
    console.error("Chyba při výpočtu koncového data:", error);
    const start = new Date(startDate);
    start.setDate(start.getDate() + REQUIRED_LESSONS * 7 + 7);
    return start.toISOString().split("T")[0];
  }
}


