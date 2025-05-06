"use client";
import { useState } from "react";
import { Calendar, DollarSign, Clock, Users } from "lucide-react";
import { Course, Lesson } from "@prisma/client";

type LessonType = Lesson & { course: Course };

interface Props {
  data: LessonType[];
}

export default function Calculator({ data }: Props) {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [lessons, setLessons] = useState<LessonType[]>(data);
  const [filteredLessons, setFilteredLessons] = useState<LessonType[]>([]);

  const [totalPayment, setTotalPayment] = useState(0);
  const [showResults, setShowResults] = useState(false);

  const pricelist = [
    { type: "individuál", duration: 45, price: 250 },
    { type: "individuál", duration: 60, price: 300 },
    { type: "individuál", duration: 90, price: 500 },
    { type: "dvojice", duration: 60, price: 300 },
    { type: "kurz", duration: 45, price: 300 },
  ];

  const showLessons = () => {
    if (!fromDate && !toDate) return;

    const from = new Date(fromDate);
    const to = new Date(toDate);

    if (to) to.setDate(to.getDate() + 1); // aby to zahrnovalo cely den

    const filteredLessons = lessons.filter((lesson) => {
      const lessonDate = new Date(lesson.startDate);
      return from <= lessonDate && lessonDate < to;
    });

    setFilteredLessons(filteredLessons);
    sumPrice(filteredLessons);
    setShowResults(true);
  };

  const sumPrice = (filteredLessons: LessonType[]) => {
    let totalPrice = 0;
    let price = 0;

    for (const lesson of filteredLessons) {
      const type = lesson.course.isIndividual
        ? "individuál"
        : lesson.course.isPair
          ? "dvojice"
          : "kurz";

      const match = pricelist.find(
        (item) => item.type === type && item.duration === lesson.duration,
      );

      if (match) {
        price = match.price;
      } else {
        price = 0;
      }

      totalPrice += price;
    }

    setTotalPayment(totalPrice);
  };

  const getLessonStats = () => {
    const counts = {
      individuál: 0,
      dvojice: 0,
      kurz: 0,
    };

    const earnings = {
      individuál: 0,
      dvojice: 0,
      kurz: 0,
    };

    filteredLessons.forEach((lesson) => {
      const type = lesson.course.isIndividual
        ? "individuál"
        : lesson.course.isPair
          ? "dvojice"
          : "kurz";

      counts[type]++;

      const match = pricelist.find(
        (item) => item.type === type && item.duration === lesson.duration,
      );

      if (match) {
        earnings[type] += match.price;
      }
    });

    return { counts, earnings };
  };

  const { counts, earnings } = getLessonStats();

  return (
    <div className="mt-10">
      <h2 className="title mb-6">Kalkulačka výdělku</h2>

      <div className="mb-6 space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="flex w-full flex-col">
            <label className="mb-1 flex items-center text-sm font-medium text-gray-700">
              <Calendar className="mr-1 h-4 w-4 text-orange-500" />
              Od:
            </label>
            <input
              type="date"
              className="rounded-md border border-gray-300 px-3 py-2 focus:outline-none"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>

          <div className="flex w-full flex-col">
            <label className="mb-1 flex items-center text-sm font-medium text-gray-700">
              <Calendar className="mr-1 h-4 w-4 text-orange-500" />
              Do:
            </label>
            <input
              type="date"
              className="rounded-md border border-gray-300 px-3 py-2 focus:outline-none"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>
        </div>

        <button
          onClick={showLessons}
          className="w-full cursor-pointer rounded-lg bg-orange-400 px-4 py-3 font-medium text-white transition-all hover:bg-orange-500"
        >
          Vypočítat odměnu
        </button>
      </div>

      {showResults && (
        <div className="">
          <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-md bg-gray-50 p-3">
              <div className="mb-2 flex items-center">
                <Clock className="mr-2 h-4 w-4 text-orange-500" />
                <span className="text-sm font-medium text-gray-700">
                  Počet lekcí
                </span>
              </div>
              <p className="text-xl font-bold text-gray-800">
                {filteredLessons.length}
              </p>
            </div>

            <div className="rounded-md bg-gray-50 p-3">
              <div className="mb-2 flex items-center">
                <DollarSign className="mr-2 h-4 w-4 text-orange-500" />
                <span className="text-sm font-medium text-gray-700">
                  Celková odměna
                </span>
              </div>
              <p className="text-xl font-bold text-green-600">
                {totalPayment} Kč
              </p>
            </div>
          </div>

          <div className="mb-4 rounded-md bg-gray-50 p-3">
            <div className="mb-2 flex items-center">
              <Users className="mr-2 h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium text-gray-700">
                Rozdělení typů lekcí
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-md bg-blue-50 p-2">
                <p className="text-sm font-medium text-blue-700">
                  Individuální
                </p>
                <p className="text-lg font-semibold">{counts.individuál}</p>
                <p className="text-sm text-blue-800">
                  {earnings.individuál} Kč
                </p>
              </div>
              <div className="rounded-md bg-orange-50 p-2">
                <p className="text-sm font-medium text-orange-500">Párové</p>
                <p className="text-lg font-semibold">{counts.dvojice}</p>
                <p className="text-sm text-orange-500">{earnings.dvojice} Kč</p>
              </div>
              <div className="rounded-md bg-green-50 p-2">
                <p className="text-sm font-medium text-green-800">Skupinové</p>
                <p className="text-lg font-semibold">{counts.kurz}</p>
                <p className="text-sm text-green-800">{earnings.kurz} Kč</p>
              </div>
            </div>
          </div>

          {filteredLessons.length > 0 && (
            <div className="mb-8">
              <h2 className="mb-3 text-xl font-semibold">Seznam lekcí</h2>
              <div className="">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-xs text-gray-500 uppercase">
                      <th className="py-2.5 font-medium">Datum</th>
                      <th className="py-2.5 font-medium">Délka</th>
                      <th className="py-2.5 font-medium">Kurz</th>
                      <th className="py-2.5 font-medium">Typ</th>
                      <th className="py-2.5 text-right font-medium">Částka</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredLessons.map((lesson) => {
                      const type = lesson.course.isIndividual
                        ? "individuál"
                        : lesson.course.isPair
                          ? "dvojice"
                          : "kurz";

                      const match = pricelist.find(
                        (item) =>
                          item.type === type &&
                          item.duration === lesson.duration,
                      );

                      let price = 0;

                      if (match) {
                        price = match.price;
                      }

                      return (
                        <tr key={lesson.id} className="hover:bg-gray-50">
                          <td className="py-2.5 text-sm text-gray-800">
                            {new Date(lesson.startDate).toLocaleDateString()}
                          </td>
                          <td className="py-2.5 text-sm text-gray-800">
                            {lesson.duration} min
                          </td>
                          <td className="py-2.5 text-sm text-gray-800">
                            {lesson.course.name}
                          </td>
                          <td className="py-2.5">
                            <span
                              className={`inline-block rounded-full px-2 py-1 text-xs ${
                                lesson.course.isIndividual
                                  ? "bg-blue-50 text-blue-700"
                                  : lesson.course.isPair
                                    ? "bg-orange-50 text-orange-500"
                                    : "bg-green-50 text-green-800"
                              }`}
                            >
                              {type}
                            </span>
                          </td>
                          <td className="py-2.5 text-right text-sm font-medium text-gray-800">
                            {price === 0 ? (
                              <span className="text-red-500">Neznámá cena</span>
                            ) : (
                              `${price} Kč`
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
