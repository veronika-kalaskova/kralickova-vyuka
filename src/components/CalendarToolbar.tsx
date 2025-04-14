"use client";

import React from "react";
import { ToolbarProps } from "react-big-calendar";
import moment from "moment";
import Image from "next/image";

export default function CalendarToolbar(props: ToolbarProps<any, object>) {
  const goToBack = () => {
    props.onNavigate("PREV");
  };

  const goToNext = () => {
    props.onNavigate("NEXT");
  };

  const goToToday = () => {
    props.onNavigate("TODAY");
  };

  const changeView = (view: ToolbarProps["view"]) => {
    props.onView(view);
  };

  return (
    <div className="mb-2 grid grid-cols-1 justify-items-center gap-4 xl:grid-cols-4">
      <div className="hidden xl:block xl:justify-self-start">
        <button
          onClick={goToToday}
          className="orange-background cursor-pointer font-semibold transition-all hover:text-orange-500"
        >
          Dnes
        </button>
      </div>

      <div className="col-span-2 flex items-center justify-center">
        <button onClick={goToBack} className="cursor-pointer p-2">
          <Image
            src="/chevron-left.svg"
            alt="arrowBack"
            height={20}
            width={20}
          />
        </button>

        <div className="text-xl font-semibold">{props.label}</div>

        <button onClick={goToNext} className="cursor-pointer p-2">
          <Image
            src="/chevron-right.svg"
            alt="arrowBack"
            height={20}
            width={20}
          />
        </button>
      </div>

      <div className="flex gap-1 xl:justify-self-end">
        {["month", "work_week", "agenda"].map((view) => (
          <button
            key={view}
            onClick={() => changeView(view as ToolbarProps["view"])}
            className={`orange-background orange-background cursor-pointer font-semibold transition duration-200 hover:text-orange-500 ${
              props.view === view ? "orange-background" : "bg-white"
            }`}
          >
            {view === "month"
              ? "Měsíc"
              : view === "work_week"
                ? "Týden"
                : view === "day"
                  ? "Den"
                  : "Seznam"}
          </button>
        ))}
        <div className="block xl:hidden">
          <button
            onClick={goToToday}
            className="orange-background cursor-pointer font-semibold transition-all hover:text-orange-500"
          >
            Dnes
          </button>
        </div>
      </div>
    </div>
  );
}
