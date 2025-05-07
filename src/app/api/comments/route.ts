import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { lessonId, user, text, createdAt } = body;

    const newComment = await db.comment.create({
      data: {
        lessonId,
        userId: user.id,
        text,
        createdAt,
      },
      include: {
        user: true,
      },
    });

    return NextResponse.json(
      { comment: newComment, message: "komentar vytvoren" },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { commentId } = await req.json();

    if (!commentId) {
      return NextResponse.json({ error: "Nastala chyba." }, { status: 400 });
    }

    const deletedComment = await db.comment.delete({
      where: {
        id: commentId,
      },
    });

    return NextResponse.json(
      { message: "Komentar byl úspěšně smazán." },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Chyba při mazání komentaru." },
      { status: 500 },
    );
  }
}
