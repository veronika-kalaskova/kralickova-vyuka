"use client";
import { Attendance, User } from "@prisma/client";
import React, { useState } from "react";

interface AttendanceWithRelations extends Attendance {
  user: User;
}

interface Props {
  data: AttendanceWithRelations[];
  roles?: string[];
}

export default function AttendanceTable({ data, roles }: Props) {
  const [searchTerm, setSearchTerm] = useState("");

  // Filtrování dat
  const filteredData = data.filter((record) => {
    const studentName =
      `${record.user.firstName} ${record.user.lastName}`.toLowerCase();
    const searchLower = searchTerm
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    return studentName
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .includes(searchLower);
  });

  // Seřazení podle jména
  const sortedRecords = [...filteredData].sort((a, b) =>
    `${a.user.lastName} ${a.user.firstName}`.localeCompare(
      `${b.user.lastName} ${b.user.firstName}`,
    ),
  );

  return (
    <div className="mb-6 rounded-md border border-gray-200 p-4 shadow-sm">
      <h2 className="mb-3 text-xl font-semibold">Přehled docházky</h2>

      <div>
        {sortedRecords.length > 0 ? (
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-gray-500 uppercase">
                <th className="py-2.5 font-medium">Student</th>
                <th className="py-2.5 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {sortedRecords.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="py-2.5">
                    <div className="flex items-center">
                      <div className="mr-3 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-500">
                        {record.user.firstName.charAt(0)}
                        {record.user.lastName.charAt(0)}
                      </div>
                      <span className="text-sm text-gray-800">
                        {record.user.firstName} {record.user.lastName}
                      </span>
                    </div>
                  </td>
                  <td className="py-2.5">
                    {record.type === "present" ? (
                      <span className="inline-flex items-center rounded bg-green-50 px-2 py-0.5 text-xs font-medium text-green-800">
                        <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-green-500"></span>
                        Přítomen
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded bg-red-50 px-2 py-0.5 text-xs font-medium text-red-800">
                        <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-red-500"></span>
                        Nepřítomen
                      </span>
                    )}
                  </td>
                  {/* <td className="py-2.5">
                    {record} {record.user.lastName}
                  </td> */}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="px-5 py-10 text-center text-gray-500">
            Nebyly nalezeny žádné záznamy docházky.
          </div>
        )}
      </div>
    </div>
  );
}