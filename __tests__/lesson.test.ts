import { POST, PUT } from "@/app/api/lesson/route";
import { db } from "@/lib/db";

jest.mock("@/lib/db", () => ({
  db: {
    course: {
      findFirst: jest.fn(),
    },
    lesson: {
      create: jest.fn(),
      createMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

const validLessonData = {
  courseId: 1,
  startDate: new Date("2025-05-10T10:00:00.000Z").toISOString(),
  endDate: new Date("2025-05-10T11:00:00.000Z").toISOString(),
  repeat: "none",
  teacherId: "3",
};

const validWeeklyLessonData = {
  courseId: 1,
  startDate: new Date("2025-05-10T10:00:00.000Z").toISOString(),
  endDate: new Date("2025-05-10T11:00:00.000Z").toISOString(),
  repeat: "weekly",
  teacherId: "3",
};

const mockCourse = {
  id: 1,
  name: "Test Course",
  startDate: new Date("2025-05-01T00:00:00.000Z"),
  endDate: new Date("2025-05-31T00:00:00.000Z"),
  isIndividual: true,
};

function setupRequest(data: any, method: "POST" | "PUT" = "POST") {
  return new Request("http://localhost/api/lesson", {
    method,
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
    },
  });
}

describe("POST /api/lesson", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (db.course.findFirst as jest.Mock).mockResolvedValue(mockCourse);
  });

  it("vytvoří jednu lekci pro jednorázovou událost", async () => {
    (db.lesson.create as jest.Mock).mockResolvedValue({
      id: 123,
      ...validLessonData,
    });

    const response = await POST(setupRequest(validLessonData));
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.message).toBe("Lekce vytvořena");
    expect(data.lessons).toHaveLength(1);
    expect(db.lesson.create).toHaveBeenCalledWith({
      data: {
        courseId: validLessonData.courseId,
        startDate: new Date(validLessonData.startDate),
        endDate: new Date(validLessonData.endDate),
        teacherId: parseInt(validLessonData.teacherId),
        repeat: "none",
        duration: 60,
      },
    });
  });

  it("vytvoří více lekcí pro týdenní opakování", async () => {
    const lessonsToCreate = [
      {
        courseId: 1,
        startDate: new Date("2025-05-10T10:00:00.000Z"),
        endDate: new Date("2025-05-10T11:00:00.000Z"),
        teacherId: 3,
        repeat: "weekly",
        duration: 60,
      },
      {
        courseId: 1,
        startDate: new Date("2025-05-17T10:00:00.000Z"),
        endDate: new Date("2025-05-17T11:00:00.000Z"),
        teacherId: 3,
        repeat: "weekly",
        duration: 60,
      },
      {
        courseId: 1,
        startDate: new Date("2025-05-24T10:00:00.000Z"),
        endDate: new Date("2025-05-24T11:00:00.000Z"),
        teacherId: 3,
        repeat: "weekly",
        duration: 60,
      },
    ];
    (db.lesson.createMany as jest.Mock).mockResolvedValue({
      count: lessonsToCreate.length,
    });

    const response = await POST(setupRequest(validWeeklyLessonData));
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.message).toBe("Lekce vytvořena");
    expect(data.lessons).toHaveLength(lessonsToCreate.length);
    expect(db.lesson.createMany).toHaveBeenCalled();
  });

  it("vrátí 404, pokud kurz nenalezen", async () => {
    (db.course.findFirst as jest.Mock).mockResolvedValue(null);

    const response = await POST(setupRequest(validLessonData));
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.message).toBe("Kurz nenalezen");
  });

  it("vrátí 500, pokud dojde k chybě při vytváření lekce", async () => {
    (db.lesson.create as jest.Mock).mockRejectedValue(
      new Error("Chyba databáze"),
    );

    const response = await POST(setupRequest(validLessonData));
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.message).toBe("Chyba při vytváření lekce");
  });

  it("vrátí 500, pokud dojde k chybě při vytváření více lekcí", async () => {
    (db.lesson.createMany as jest.Mock).mockRejectedValue(
      new Error("Chyba databáze"),
    );

    const response = await POST(setupRequest(validWeeklyLessonData));
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.message).toBe("Chyba při vytváření lekce");
  });
});

describe("PUT /api/lesson", () => {
  const validUpdateData = {
    id: 456,
    startDate: new Date("2025-05-10T11:00:00.000Z").toISOString(),
    endDate: new Date("2025-05-10T12:00:00.000Z").toISOString(),
    teacherId: 3,
    repeat: "none",
    duration: 60,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (db.lesson.findUnique as jest.Mock).mockResolvedValue(validUpdateData);
  });

  it("upraví existující lekci", async () => {
    (db.lesson.update as jest.Mock).mockResolvedValue(validUpdateData);

    const response = await PUT(setupRequest(validUpdateData, "PUT"));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.message).toBe("Lekce byla upravena");
    expect(db.lesson.update).toHaveBeenCalled();
  });

  it("vrátí 404, pokud lekce nenalezena", async () => {
    (db.lesson.findUnique as jest.Mock).mockResolvedValue(null);

    const response = await PUT(setupRequest(validUpdateData, "PUT"));
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.message).toBe("Lekce nenalezena");
  });

  it("vrátí 500, pokud dojde k chybě při úpravě lekce", async () => {
    (db.lesson.update as jest.Mock).mockRejectedValue(
      new Error("Chyba databáze"),
    );

    const response = await PUT(setupRequest(validUpdateData, "PUT"));
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.message).toBe("Chyba při úpravě lekce");
  });
});
