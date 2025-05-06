import { POST, DELETE } from "@/app/api/comments/route";
import { db } from "@/lib/db";

jest.mock("@/lib/db", () => ({
  db: {
    comment: {
      create: jest.fn(),
      delete: jest.fn(),
    },
    lesson: {
      findUnique: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
  },
}));

const validCommentData = {
  lessonId: 1,
  user: { id: 2 },
  text: "Skvělý kurz!",
  createdAt: new Date().toISOString(),
};

const mockLesson = {
  id: 1,
};

const mockUser = {
  id: 2,
};

function setupRequest(data: any, method: "POST" | "DELETE" = "POST") {
  return new Request("http://localhost/api/comments", {
    method,
    body: method === "POST" ? JSON.stringify(data) : JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
    },
  });
}

describe("POST /api/comments", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (db.lesson.findUnique as jest.Mock).mockResolvedValue(mockLesson);
    (db.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
  });

  it("vytvoří nový komentář", async () => {
    const createdComment = { id: 201, ...validCommentData, user: mockUser };
    (db.comment.create as jest.Mock).mockResolvedValue(createdComment);

    const response = await POST(setupRequest(validCommentData));
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.message).toBe("komentar vytvoren");
    expect(data.comment).toEqual(createdComment);
    expect(db.comment.create).toHaveBeenCalledWith({
      data: {
        lessonId: validCommentData.lessonId,
        userId: validCommentData.user.id,
        text: validCommentData.text,
        createdAt: validCommentData.createdAt,
      },
      include: {
        user: true,
      },
    });
  });

  it("vrátí 404, pokud lekce nenalezena", async () => {
    (db.lesson.findUnique as jest.Mock).mockResolvedValue(null);

    const response = await POST(setupRequest(validCommentData));
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.message).toBe("komentar vytvoren");
  });

  it("vrátí 404, pokud uživatel nenalezen", async () => {
    (db.user.findUnique as jest.Mock).mockResolvedValue(null);

    const response = await POST(setupRequest(validCommentData));
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.message).toBe("komentar vytvoren");
  });

  it("vrátí 500, pokud dojde k chybě při vytváření komentáře", async () => {
    (db.comment.create as jest.Mock).mockRejectedValue(new Error("Chyba databáze"));

    const response = await POST(setupRequest(validCommentData));
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.message).toBe("Error");
  });
});

describe("DELETE /api/comments", () => {
  const validDeleteData = { commentId: 301 };

  beforeEach(() => {
    jest.clearAllMocks();
    (db.comment.delete as jest.Mock).mockResolvedValue({ id: validDeleteData.commentId });
  });

  it("úspěšně smaže komentář", async () => {
    const response = await DELETE(setupRequest(validDeleteData, "DELETE"));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.message).toBe("Komentar byl úspěšně smazán.");
    expect(db.comment.delete).toHaveBeenCalledWith({
      where: {
        id: validDeleteData.commentId,
      },
    });
  });

  it("vrátí 400, pokud chybí commentId", async () => {
    const invalidDeleteData = {};
    const response = await DELETE(setupRequest(invalidDeleteData, "DELETE"));
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Nastala chyba.");
  });

  it("vrátí 500, pokud dojde k chybě při mazání komentáře", async () => {
    (db.comment.delete as jest.Mock).mockRejectedValue(new Error("Chyba při mazání"));

    const response = await DELETE(setupRequest(validDeleteData, "DELETE"));
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Chyba při mazání komentaru.");
  });
});