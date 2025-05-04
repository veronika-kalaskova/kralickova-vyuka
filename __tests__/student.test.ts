import { POST } from "@/app/api/student/route";
import { db } from "@/lib/db";

jest.mock("@/lib/db", () => ({
  db: {
    user: {
      findFirst: jest.fn(),
      create: jest.fn(),
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
  username: "teststudent",
  password: "password123",
  firstName: "Test",
  lastName: "Student",
  email: "student@example.com",
  phone: "123456789",
  courseIds: [1, 2],
  roleId: 3,
  class: "A",
  pickup: true,
};

function setupRequest(data = validStudentData) {
  return new Request("http://localhost", {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
    },
  });
}

describe("POST /api/student", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("vytvoří nového studenta s přiřazením role", async () => {
    (db.user.findFirst as jest.Mock).mockResolvedValue(null);
    (db.user.create as jest.Mock).mockResolvedValue({
      id: 789,
      username: validStudentData.username,
      email: validStudentData.email,
      firstName: validStudentData.firstName,
      lastName: validStudentData.lastName,
      password: validStudentData.password,
    });
    (db.userRole.create as jest.Mock).mockResolvedValue({
      id: 1,
      userId: 789,
      roleId: validStudentData.roleId,
    });
    (db.course.findMany as jest.Mock).mockResolvedValue([]);
    (db.group.findMany as jest.Mock).mockResolvedValue([]);
    (db.studentGroup.createMany as jest.Mock).mockResolvedValue({ count: 0 });

    const response = await POST(setupRequest());
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.message).toBe("uzivatel vytvoren");
  });

  it("vrátí 400, pokud některý kurz není platný", async () => {
    (db.user.findFirst as jest.Mock).mockResolvedValue(null);
    (db.course.findMany as jest.Mock).mockResolvedValue([
      { id: 1, isIndividual: false, groupId: null },
    ]);

    const invalidCourseData = { ...validStudentData, courseIds: [1] };
    const response = await POST(setupRequest(invalidCourseData));
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.message).toBe("Group course without groupId.");
    expect(data.invalidCourses).toEqual([
      { id: 1, isIndividual: false, groupId: null },
    ]);
  });

  it("vrátí 409, pokud uživatel s daným jménem nebo e-mailem existuje", async () => {
    (db.user.findFirst as jest.Mock).mockResolvedValue({
      id: 123,
      username: validStudentData.username,
      email: validStudentData.email,
    });

    const response = await POST(setupRequest());
    const data = await response.json();

    expect(response.status).toBe(409);
    expect(data.message).toBe("User exists");
  });

  it("vrátí 500, pokud dojde k chybě během vytváření studenta", async () => {
    (db.user.findFirst as jest.Mock).mockResolvedValue(null);
    (db.user.create as jest.Mock).mockRejectedValue(
      new Error("Chyba databáze"),
    );
    (db.course.findMany as jest.Mock).mockResolvedValue([]);
    (db.group.findMany as jest.Mock).mockResolvedValue([]);
    (db.studentGroup.createMany as jest.Mock).mockResolvedValue({ count: 0 });
    (db.userRole.create as jest.Mock).mockResolvedValue({
      id: 1,
      userId: 789,
      roleId: validStudentData.roleId,
    }); 

    const response = await POST(setupRequest());
    const data = await response.json();

    expect(response.status).toBe(500); 
    expect(data.message).toBe("Error");
  });
});
