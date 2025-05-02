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
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadSuccess(false);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("lessonId", lessonId.toString());

    try {
      const response = await fetch("/api/file", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Nastala chyba při nahrávání");
      }

      const result = await response.json();
      setUploadSuccess(true);
      setMaterial(result.material);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nastala chyba při nahrávání");
    } finally {
      setUploading(false);
    }
  };

  const deleteMaterial = async (materialId: number) => {
    try {
      const response = await fetch("/api/file", {
        method: "DELETE",
        body: JSON.stringify({ materialId }),
        headers: { "Content-Type": "application/json" },
      });

      setMaterial(null);
    } catch (err) {
      setError("Nastala chyba při mazání materiálu");
    }
  };

  const downloadFile = async (materialId: number, fileName: string) => {
    try {
      const response = await fetch(`/api/download?id=${materialId}`);
      
      if (!response.ok) {
        throw new Error('Soubor nelze stáhnout');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      
      window.URL.revokeObjectURL(url);
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