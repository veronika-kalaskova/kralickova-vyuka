import { POST, DELETE } from "@/app/api/comments/route";
import { db } from "@/lib/db";

jest.mock("@/lib/db", () => ({
  db: {
    comment: {
      create: jest.fn(), // veskere databazove operace budou mockovany pomoci jest.fn()
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
  text: "Komentář k lekci",
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
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
    },
  });
}

describe("POST /api/comments", () => {
  beforeEach(() => {
    jest.clearAllMocks(); // vymazani mocku pred kazdym testem
  });

  it("vytvoří nový komentář", async () => {
    const createdComment = { id: 201, ...validCommentData, user: mockUser };
    (db.comment.create as jest.Mock).mockResolvedValue(createdComment); // ulozi se do mockovane databaze komentar

    const response = await POST(setupRequest(validCommentData));
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.message).toBe("komentar vytvoren");
    expect(data.comment).toEqual(createdComment);
    expect(db.comment.create).toHaveBeenCalled();
  });

  it("vrátí 500, pokud dojde k chybě při vytváření komentáře", async () => {
    (db.comment.create as jest.Mock).mockRejectedValue(
      new Error("Chyba databáze"),
    );

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
    (db.comment.delete as jest.Mock).mockResolvedValue({
      id: validDeleteData.commentId,
    });
  });

  it("úspěšně smaže komentář", async () => {
    const response = await DELETE(setupRequest(validDeleteData, "DELETE"));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.message).toBe("Komentar byl úspěšně smazán.");
    expect(db.comment.delete).toHaveBeenCalled();
  });

  it("vrátí 400, pokud chybí commentId", async () => {
    const invalidDeleteData = {};
    const response = await DELETE(setupRequest(invalidDeleteData, "DELETE"));
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Nastala chyba.");
  });

  it("vrátí 500, pokud dojde k chybě při mazání komentáře", async () => {
    (db.comment.delete as jest.Mock).mockRejectedValue(
      new Error("Chyba při mazání"),
    );

    const response = await DELETE(setupRequest(validDeleteData, "DELETE"));
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Chyba při mazání komentaru.");
  });
});
