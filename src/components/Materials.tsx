"use client";
import { StudyMaterial } from "@prisma/client";
import React, { useState } from "react";

interface Props {
  lessonId: number;
  data: StudyMaterial | null;
}

export default function Materials({ lessonId, data }: Props) {
  const [material, setMaterial] = useState<StudyMaterial | null>(data);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; // soubor z inputu
    if (!file) return;

    setUploading(true);
    setUploadSuccess(false);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("lessonId", lessonId.toString());

    try {
      const response = await fetch("/api/file", {
        method: "POST",
        body: formData, // posilam do api soubor a id lekce ke ktere patri
      });

      if (!response.ok) {
        setError("Nastala chyba při nahrávání");
      }

      const result = await response.json();
      setUploadSuccess(true);
      setMaterial(result.material);
    } catch {
      setError("Nastala chyba při nahrávání");
    } finally {
      setUploading(false);
    }
  };

  const deleteMaterial = async (materialId: number) => {
    try {
      await fetch("/api/file", {
        method: "DELETE",
        body: JSON.stringify({ materialId }),
        headers: { "Content-Type": "application/json" },
      });

      setMaterial(null);
    } catch {
      setError("Nastala chyba při mazání materiálu");
    }
  };

  const downloadFile = async (materialId: number, fileName: string) => {
    try {
      const response = await fetch(`/api/download?id=${materialId}`);

      if (!response.ok) {
        setError("Soubor nelze stáhnout");
      }

      const blob = await response.blob(); // prevedeni na binarni objekt
      const url = window.URL.createObjectURL(blob); // vytvoreni odkazu na stazeni

      const a = document.createElement("a"); // vytvoreni elementtu pro odkaz
      a.style.display = "none";
      a.href = url; // nastaveni odkazu na stazeni
      a.download = fileName; // atribut pro nastaveni jmena souboru
      document.body.appendChild(a);
      a.click(); // spusti stazeni

      window.URL.revokeObjectURL(url); // odstraneni odkazu na stazeni
      document.body.removeChild(a);
    } catch (err) {
      setError("Nastala chyba při stahování souboru");
    }
  };

  return (
    <div className="mb-6 rounded-md border border-gray-200 p-4 shadow-sm">
      <h2 className="mb-6 text-xl font-semibold">Materiály</h2>

      <div className="flex">
        {material ? (
          <div className="group relative w-full">
            <button
              onClick={() => downloadFile(material.id, material.fileName)}
              className="flex h-28 w-full cursor-pointer items-center justify-center rounded-xl border border-gray-300 bg-white p-4 text-center transition hover:border-orange-500 hover:text-orange-500"
            >
              {material.fileName}
            </button>

            <button
              onClick={() => deleteMaterial(material.id)}
              className="absolute top-2 right-2 hidden cursor-pointer text-gray-500 group-hover:block hover:text-orange-500"
            >
              &#10005;
            </button>
          </div>
        ) : (
          <label className="flex h-28 w-full cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-orange-400 bg-orange-50 p-4 text-center text-orange-500 transition hover:bg-orange-100 hover:text-orange-600">
            <input type="file" onChange={uploadFile} className="hidden" />
            {uploading ? "Nahrávám..." : "Přidat soubor"}
          </label>
        )}
      </div>

      {uploadSuccess && (
        <div className="mt-4 text-sm text-green-600">
          Soubor byl úspěšně nahrán
        </div>
      )}

      {error && <div className="mt-4 text-sm text-red-500">{error}</div>}
    </div>
  );
}
