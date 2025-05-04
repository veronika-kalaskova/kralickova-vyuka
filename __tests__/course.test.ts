import { POST } from "@/app/api/course/route";
import { db } from "@/lib/db";

jest.mock("@/lib/db", () => ({
  db: {
    course: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    group: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    user: {
      update: jest.fn(),
    },
  },
}));

const validCourseData = {
  name: "Test Kurz",
  teacherId: "1",
  startDate: "2025-05-01",
  endDate: "2025-06-01",
  description: "Popis",
  textbook: "Učebnice",
  isIndividual: false,
  isPair: true,
};

function setupRequest(data = validCourseData) {
  return new Request("http://localhost", {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
    },
  });
}

describe("POST /api/course", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("vytvoření nového kurzu a skupiny", async () => {
    (db.course.findFirst as jest.Mock).mockResolvedValue(null);
    (db.course.create as jest.Mock).mockResolvedValue({
      id: 123,
      name: validCourseData.name,
      isIndividual: false,
    });
    (db.group.findFirst as jest.Mock).mockResolvedValueOnce(null);
    (db.group.create as jest.Mock).mockResolvedValue({
      id: 456,
      name: validCourseData.name,
      courseId: 123,
    });

    const response = await POST(setupRequest());
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.message).toBe("kurz vytvořen");
    expect(db.group.create).toHaveBeenCalled();

    const createdGroup = { id: 456, name: validCourseData.name, courseId: 123 };
    (db.group.findFirst as jest.Mock).mockResolvedValueOnce(createdGroup);

    const groupData = await db.group.findFirst({ where: { id: 456 } });
    expect(groupData).toEqual(createdGroup);
  });

  it("nevytváří skupinu, pokud je kurz individuální", async () => {
    const data = { ...validCourseData, isIndividual: true, isPair: false };
    (db.course.findFirst as jest.Mock).mockResolvedValue(null);
    (db.course.create as jest.Mock).mockResolvedValue({
      id: 123,
      name: data.name,
      isIndividual: true,
    });
    (db.user.update as jest.Mock).mockResolvedValue({});

    const response = await POST(setupRequest(data));
    const result = await response.json();

    expect(response.status).toBe(201);
    expect(result.message).toBe("kurz vytvořen");
    expect(db.group.create).not.toHaveBeenCalled();
  });

  it("vrátí 409, pokud kurz se stejným názvem již existuje", async () => {
    (db.course.findFirst as jest.Mock).mockResolvedValue({
      id: 999,
      name: validCourseData.name,
    });

    const response = await POST(setupRequest());
    const data = await response.json();

    expect(response.status).toBe(409);
    expect(data.message).toBe("Course exists");
  });

  it("vrátí 409, pokud skupina se stejným názvem již existuje", async () => {
    (db.course.findFirst as jest.Mock).mockResolvedValue(null);
    (db.course.create as jest.Mock).mockResolvedValue({
      id: 123,
      name: validCourseData.name,
      isIndividual: false,
    });
    (db.group.findFirst as jest.Mock).mockResolvedValue({ id: 789 });

    const response = await POST(setupRequest());
    const data = await response.json();

    expect(response.status).toBe(409);
    expect(data.message).toBe("Group exists");
  });

  it("vrátí 500, pokud dojde k chybě během vytváření kurzu", async () => {
    (db.course.findFirst as jest.Mock).mockResolvedValue(null);
    (db.course.create as jest.Mock).mockRejectedValue(
      new Error("Chyba databáze"),
    );

    const response = await POST(setupRequest());
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.message).toBe("chyba při vytváření kurzu");
  });
});
