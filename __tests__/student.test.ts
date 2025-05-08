import { POST } from "@/app/api/student/route";
import { db } from "@/lib/db";

jest.mock("@/lib/db", () => ({
  db: {
    user: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    course: {
      findMany: jest.fn(),
    },
    group: {
      findMany: jest.fn(),
    },
    studentGroup: {
      createMany: jest.fn(),
      deleteMany: jest.fn(),
    },
    userRole: {
      create: jest.fn(),
    },
  },
}));

const validStudentData = {
  id: 123,
  username: "teststudent",
  password: "password123",
  firstName: "Test",
  lastName: "Student",
  email: "student@example.com",
  phone: "123456789",
  courseIds: [1, 2],
  class: "A",
  pickup: true,
};

function setupPostRequest(data = validStudentData) {
  return new Request("http://localhost/api/student", {
    method: "POST",
    body: JSON.stringify(data),
    headers: { "Content-Type": "application/json" },
  });
}


describe("API /api/student", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST", () => {
    it("vytvoří nového studenta s přiřazením role", async () => {
      (db.user.findFirst as jest.Mock).mockResolvedValue(null);
      (db.user.create as jest.Mock).mockResolvedValue({ validStudentData });
      (db.course.findMany as jest.Mock).mockResolvedValue([]);
      (db.group.findMany as jest.Mock).mockResolvedValue([]);
      (db.studentGroup.createMany as jest.Mock).mockResolvedValue({ count: 0 });

      const response = await POST(setupPostRequest());
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.message).toBe("uzivatel vytvoren");
    });

    it("vrátí 400, pokud některý kurz není platný", async () => {
      (db.user.findFirst as jest.Mock).mockResolvedValue(null);
      (db.course.findMany as jest.Mock).mockResolvedValue([
        { id: 1, isIndividual: false, groupId: null },
      ]);

      const response = await POST(
        setupPostRequest({ ...validStudentData, courseIds: [1] })
      );
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.message).toBe("Group course without groupId.");
    });

    it("vrátí 409, pokud uživatel existuje", async () => {
      (db.user.findFirst as jest.Mock).mockResolvedValue({
        id: 123,
        username: validStudentData.username,
        email: validStudentData.email,
      });

      const response = await POST(setupPostRequest());
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.message).toBe("User exists");
    });

    it("vrátí 500 při chybě", async () => {
      (db.user.findFirst as jest.Mock).mockResolvedValue(null);
      (db.user.create as jest.Mock).mockRejectedValue(new Error("Error"));
      (db.course.findMany as jest.Mock).mockResolvedValue([]);
      (db.group.findMany as jest.Mock).mockResolvedValue([]);

      const response = await POST(setupPostRequest());
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.message).toBe("Error");
    });
  });
});
