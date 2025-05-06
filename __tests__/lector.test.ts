import { POST, PUT } from "@/app/api/user/route"; 
import { db } from "@/lib/db";

jest.mock("@/lib/db", () => ({
  db: {
    user: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    course: {
      findMany: jest.fn(),
    },
    group: {
      findMany: jest.fn(),
      updateMany: jest.fn(),
    },
    userRole: {
      create: jest.fn(),
    },
  },
}));

const validTeacherData = {
  username: "testteacher",
  password: "password123",
  firstName: "Test",
  lastName: "Teacher",
  email: "teacher@example.com",
  phone: "987654321",
  courseIds: [1, 2],
  roleId: 2,
  color: "blue",
};

function setupRequest(data = validTeacherData) {
  return new Request("http://localhost", {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
    },
  });
}

describe("POST /api/teacher", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("vytvoření nového lektora s přiřazením role", async () => {
    (db.user.findFirst as jest.Mock).mockResolvedValue(null);
    (db.user.create as jest.Mock).mockResolvedValue({
      id: 789,
      username: validTeacherData.username,
      email: validTeacherData.email,
      firstName: validTeacherData.firstName,
      lastName: validTeacherData.lastName,
      password: validTeacherData.password,
      color: validTeacherData.color,
    });
    (db.userRole.create as jest.Mock).mockResolvedValue({
      id: 1,
      userId: 789,
      roleId: validTeacherData.roleId,
    });
    (db.course.findMany as jest.Mock).mockResolvedValue([]);
    (db.group.findMany as jest.Mock).mockResolvedValue([]);
    (db.group.updateMany as jest.Mock).mockResolvedValue({ count: 0 });

    const response = await POST(setupRequest());
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.message).toBe("uzivatel vytvoren");
  });

  it("vrácení 409, pokud uživatel s daným jménem nebo e-mailem existuje", async () => {
    (db.user.findFirst as jest.Mock).mockResolvedValue({
      id: 123,
      username: validTeacherData.username,
      email: validTeacherData.email,
    });

    const response = await POST(setupRequest());
    const data = await response.json();

    expect(response.status).toBe(409);
    expect(data.message).toBe("User exists");
  });


  it("vrácení 500, pokud dojde k chybě během vytváření lektora", async () => {
    (db.user.findFirst as jest.Mock).mockResolvedValue(null);
    (db.user.create as jest.Mock).mockRejectedValue(new Error("Chyba databáze"));
    (db.course.findMany as jest.Mock).mockResolvedValue([]);
    (db.group.findMany as jest.Mock).mockResolvedValue([]);
    (db.group.updateMany as jest.Mock).mockResolvedValue({ count: 0 });
    (db.userRole.create as jest.Mock).mockResolvedValue({
      id: 1,
      userId: 789,
      roleId: validTeacherData.roleId,
    });

    const response = await POST(setupRequest());
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.message).toBe("Error");
  });
});

describe("PUT /api/teacher", () => {
    const validUpdateData = {
      id: 789,
      username: "updatedteacher",
      firstName: "Updated",
      lastName: "Teacher",
      email: "updatedteacher@example.com",
      phone: "1122334455",
      courseIds: [1, 2],
      roleId: 2,
      color: "green",
    };
  
    beforeEach(() => {
      jest.clearAllMocks();
    });
  
    it("upravení existujícího lektora", async () => {
      (db.user.findFirst as jest.Mock).mockResolvedValue(null); 
      (db.user.update as jest.Mock).mockResolvedValue({ ...validUpdateData, id: validUpdateData.id });
      (db.group.updateMany as jest.Mock).mockResolvedValue({ count: 1 });
  
      const response = await PUT(new Request("http://localhost", {
        method: "PUT",
        body: JSON.stringify(validUpdateData),
        headers: {
          "Content-Type": "application/json",
        },
      }));
      const data = await response.json();
  
      expect(response.status).toBe(200);
      expect(data.message).toBe("uzivatel upraven");
      expect(db.user.update).toHaveBeenCalledWith({
        where: { id: validUpdateData.id },
        data: {
          username: validUpdateData.username,
          firstName: validUpdateData.firstName,
          lastName: validUpdateData.lastName,
          phone: validUpdateData.phone,
          email: validUpdateData.email,
          color: validUpdateData.color,
          CoursesTaught: { set: validUpdateData.courseIds.map((id) => ({ id })) },
        },
      });
      expect(db.group.updateMany).toHaveBeenCalledTimes(2); 
    });
  
    it("vrácení 409, pokud uživatel s daným jménem nebo e-mailem již existuje", async () => {
      (db.user.findFirst as jest.Mock).mockResolvedValue({ id: 123, username: validUpdateData.username, email: validUpdateData.email });
  
      const response = await PUT(new Request("http://localhost", {
        method: "PUT",
        body: JSON.stringify(validUpdateData),
        headers: {
          "Content-Type": "application/json",
        },
      }));

      const data = await response.json();
  
      expect(response.status).toBe(409);
      expect(data.message).toBe("User exists");
    });
  
    it("vrátí 500, pokud dojde k chybě během úpravy lektora při aktualizaci uživatele", async () => {
      (db.user.findFirst as jest.Mock).mockResolvedValue(null);
      (db.user.update as jest.Mock).mockRejectedValue(new Error("Chyba při aktualizaci uživatele"));
      (db.group.updateMany as jest.Mock).mockResolvedValue({ count: 0 });
  
      const response = await PUT(new Request("http://localhost", {
        method: "PUT",
        body: JSON.stringify(validUpdateData),
        headers: {
          "Content-Type": "application/json",
        },
      }));
      const data = await response.json();
  
      expect(response.status).toBe(500);
      expect(data.message).toBe("Error");
    });

  });