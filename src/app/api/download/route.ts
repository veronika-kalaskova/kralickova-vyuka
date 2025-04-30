import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    
    if (!id) {
      return NextResponse.json(
        { error: "Chybí ID materiálu" },
        { status: 400 }
      );
    }
    
    const materialId = parseInt(id);
    if (isNaN(materialId)) {
      return NextResponse.json(
        { error: "Neplatné ID materiálu" },
        { status: 400 }
      );
    }
    
    const material = await db.studyMaterial.findUnique({
      where: {
        id: materialId,
      },
    });
    
    if (!material) {
      return NextResponse.json(
        { error: "Materiál nebyl nalezen" },
        { status: 404 }
      );
    }
    
    // Získání jména souboru z cesty
    const fileName = material.filePath.split("/").pop() || "soubor";

    // Nastavení správných hlaviček pro stažení
    const headers = new Headers();
    headers.set("Content-Type", material.fileType || "application/octet-stream");
    headers.set("Content-Disposition", `attachment; filename="${fileName}"`);
    
    // Vrácení binárních dat jako odpověď
    return new Response(material.fileData as Buffer, {
      status: 200,
      headers: headers,
    });
    
  } catch (error) {
    console.error("Chyba při stahování souboru:", error);
    return NextResponse.json(
      { error: "Chyba při stahování souboru" },
      { status: 500 }
    );
  }
}