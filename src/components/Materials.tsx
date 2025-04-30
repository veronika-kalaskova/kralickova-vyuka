"use client";
import { StudyMaterial } from "@prisma/client";
import React, { useState } from "react";

interface Props {
  lessonId: number;
  data: StudyMaterial[];
}

export default function Materials({ lessonId, data }: Props) {
  const [materials, setMaterials] = useState<StudyMaterial[]>(data);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
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

      const { material } = await response.json();

      setUploadSuccess(true);
      setSelectedFile(null);
      setMaterials((prev) => [...prev, material]);
    } catch (err) {
      setError("Nastala chyba při nahrávání");
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

      setMaterials((prev) =>
        prev.filter((material) => material.id !== materialId),
      );
    } catch (err) {
      setError("Nastala chyba při mazání materiálu");
    }
  };

  const getFileName = (filePath: string) => {
    const parts = filePath.split("/");

    const fileName = parts[parts.length - 1];

    const name = fileName.split("_");
    name.shift();

    if (name.join("_").length > 10) {
      return `${name.join("_").slice(0, 10)}...`;
    } else {
      return name.join("_");
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
      
      // Vytvoření dočasného odkazu pro stažení
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = fileName.split('_').slice(1).join('_');
      document.body.appendChild(a);
      a.click();
      
      // Úklid
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError("Nastala chyba při stahování souboru");
    }
  };

  return (
    <div className="mb-6 rounded-md border border-gray-200 p-4 shadow-sm">
      <h2 className="mb-6 text-xl font-semibold">Materiály</h2>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {materials.map((material) => (
          <div key={material.id} className="group relative">
            <button
              onClick={() => downloadFile(material.id, getFileName(material.filePath))}
              className="flex h-28 w-full cursor-pointer items-center justify-center rounded-xl border border-gray-300 bg-white p-4 text-center transition hover:border-orange-500 hover:text-orange-500"
            >
              {getFileName(material.filePath)}
            </button>

            <button
              onClick={() => deleteMaterial(material.id)}
              className="absolute top-2 right-2 hidden cursor-pointer text-gray-500 group-hover:block hover:text-orange-500"
            >
              &#10005;
            </button>
          </div>
        ))}

        <label className="flex h-28 cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-orange-400 bg-orange-50 p-4 text-center text-orange-500 transition hover:bg-orange-100 hover:text-orange-600">
          <input type="file" onChange={uploadFile} className="hidden" />
          {uploading ? "Nahrávám..." : "Přidat soubor"}
        </label>
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