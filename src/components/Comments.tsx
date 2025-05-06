"use client";
import { Comment, User, UserRole } from "@prisma/client";
import React, { useState } from "react";

type CommentType = Comment & { user: User };

interface Props {
  data: CommentType[];
  lessonId: number;
  user: User & { UserRole: UserRole[] };
}

export default function Comments({ data, lessonId, user }: Props) {
  const [text, setText] = useState("");
  const [comments, setComments] = useState<CommentType[]>(data);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (text.length <= 2) {
      setError("Komentář musí mít alespoň 3 znaky.");
      return;
    }

    setError(null);

    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lessonId: lessonId,
          user: user,
          text: text,
          createdAt: new Date(),
        }),
      });

      if (response.ok) {
        const responseData = await response.json();
        const newComment: CommentType = responseData.comment;

        setComments((prevComments) => [newComment, ...prevComments]);
        setText("");
      } else {
        console.error("Chyba při přidávání komentáře");
      }
    } catch (error) {
      console.error("Chyba:", error);
    }
  };

  const deleteComment = async (commentId: number) => {
    try {
      await fetch("/api/comments", {
        method: "DELETE",
        body: JSON.stringify({ commentId }),
        headers: { "Content-Type": "application/json" },
      });

      setComments((prev) => prev.filter((comment) => comment.id !== commentId));
    } catch (err) {
      console.error("Chyba při mazání komentáře");
    }
  };

  const canDeleteComment = (comment: CommentType) => {
    return (
      user.UserRole.some((role) => role.roleId === 1) ||
      comment.userId === user.id
    );
  };

  const sortedComments = comments.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(), // nejnovejsi komentare budou nahore
  );

  return (
    <div className="mb-5">
      <h2 className="title mb-6">Komentáře</h2>

      <div className="flex flex-col">
        {sortedComments.map((comment) => (
          <div
            key={comment.id}
            className="mb-6 rounded-lg border-1 border-gray-100 bg-gray-50 p-4 transition-all"
          >
            <div className="mb-2 flex items-center gap-2">
              <div className="flex items-center">
                <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#ff8904] text-xs font-medium text-white">
                  {comment.user.firstName.charAt(0)}
                  {comment.user.lastName.charAt(0)}
                </div>
              </div>
              <div className="text-sm font-semibold text-gray-800">
                {comment.user
                  ? `${comment.user.firstName} ${comment.user.lastName}`
                  : "Neznámý uživatel"}
              </div>
              <span className="ml-auto text-xs text-gray-400">
                {new Date(comment.createdAt).toLocaleString("cs-CZ", {
                  day: "numeric",
                  month: "numeric",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>

            <p className="text-sm text-gray-700">{comment.text}</p>

            {canDeleteComment(comment) && (
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => deleteComment(comment.id)}
                  className="cursor-pointer text-xs text-red-400 hover:text-red-500"
                >
                  Smazat
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {error && <div className="mb-2 text-sm text-red-500">{error}</div>}

      <form onSubmit={onSubmit}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-sm text-gray-800 focus:border-[#ff8904] focus:ring-1 focus:ring-[#ff8904] focus:outline-none"
          placeholder="Napiš komentář..."
          rows={3}
        />
        <div className="mt-2 flex justify-end">
          <button
            type="submit"
            className="cursor-pointer rounded-md bg-orange-400 px-2 py-1 text-sm font-semibold text-white transition-all hover:bg-orange-500"
          >
            Přidat komentář
          </button>
        </div>
      </form>
    </div>
  );
}
