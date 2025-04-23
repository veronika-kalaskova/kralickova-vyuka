"use client";

import React from "react";
import { ToolbarProps } from "react-big-calendar";
import Image from "next/image";

function getViewLabel(view: string): string {
  switch (view) {
    case "month":
      return "Měsíc";
    case "work_week":
    case "week":
      return "Týden";
    case "day":
      return "Den";
    case "agenda":
      return "Seznam";
    default:
      return view;
  }
}

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

  const availableViews = props.views as string[];

  return (
    <div className="mb-2 grid grid-cols-1 items-center gap-4 md:grid-cols-[auto_1fr_auto]">
      <div className="justify-self-center md:justify-self-start">
        {availableViews.length > 1 && (
          <button
            onClick={goToToday}
            className="orange-background cursor-pointer px-2 py-1 font-semibold transition-all hover:text-orange-500"
          >
            Dnes
          </button>
        )}
      </div>

      <div className="flex items-center justify-center gap-2">
        <button
          onClick={goToBack}
          className="cursor-pointer rounded-full p-2 transition-all duration-300 hover:bg-orange-100"
        >
          <Image
            src="/chevron-left.svg"
            alt="arrowBack"
            height={20}
            width={20}
          />
        </button>

        <div className="text-center text-lg font-semibold">{props.label}</div>

        <button
          onClick={goToNext}
          className="cursor-pointer rounded-full p-2 transition-all duration-300 hover:bg-orange-100"
        >
          <Image
            src="/chevron-right.svg"
            alt="arrowNext"
            height={20}
            width={20}
          />
        </button>
      </div>

      <div className="flex flex-wrap justify-center gap-1 md:justify-end">
        {availableViews.length > 1 &&
          availableViews.map((view) => (
            <button
              key={view}
              onClick={() => changeView(view as ToolbarProps["view"])}
              className={`cursor-pointer rounded px-2 py-1 font-semibold transition duration-200 ${
                props.view === view
                  ? "orange-background"
                  : "bg-white hover:text-orange-500"
              }`}
            >
              {getViewLabel(view)}
            </button>
          ))}
      </div>
    </div>
  );
}
