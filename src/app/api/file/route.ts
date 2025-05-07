import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    
    const file = formData.get("file");
    const lessonId = Number(formData.get("lessonId"));
    
    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Neplatný typ souboru." },
        { status: 400 },
      );
    }
    
    const existingMaterial = await db.studyMaterial.findFirst({
      where: { lessonId }
    });
    
    if (existingMaterial) {
      await db.studyMaterial.delete({
        where: { id: existingMaterial.id }
      }); // vymaze jelikoz, tam muze byt jen jeden material
    }
    
    const buffer = Buffer.from(await file.arrayBuffer());

    try {
      const newMaterial = await db.studyMaterial.create({
        data: {
          lessonId: lessonId,
          fileType: file.type,
          fileName: file.name,
          uploadedAt: new Date(),
          fileData: buffer, 
        },
      });
      
      return NextResponse.json(
        {
          message: "Soubor byl úspěšně nahrán",
          material: newMaterial,
        },
        { status: 201 },
      );
    } catch (error) {
      console.error("Chyba při nahrávání souboru:", error);
      return NextResponse.json(
        { error: "Chyba při ukládání souboru." },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Chyba při zpracování požadavku:", error);
    return NextResponse.json(
      { error: "Chyba při zpracování požadavku." },
      { status: 500 },
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { materialId } = await req.json();
    
    if (!materialId) {
      return NextResponse.json({ error: "Nastala chyba." }, { status: 400 });
    }
    
    const deletedMaterial = await db.studyMaterial.delete({
      where: {
        id: materialId,
      },
    });
    
    return NextResponse.json(
      { message: "Materiál byl úspěšně smazán." },
      { status: 200 },
    );
  } catch (error) {
    console.error("Chyba při mazání materiálu:", error);
    return NextResponse.json(
      { error: "Chyba při mazání materiálu." },
      { status: 500 },
    );
  }
}