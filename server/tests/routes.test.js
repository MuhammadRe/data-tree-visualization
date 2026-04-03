const request = require("supertest");
const { app, setCollection } = require("../app");

const mockCollection = {
  find: jest.fn().mockReturnThis(),
  toArray: jest.fn(),
  insertOne: jest.fn(),
  updateOne: jest.fn(),
  deleteOne: jest.fn(),
};

beforeAll(() => setCollection(mockCollection));
beforeEach(() => jest.clearAllMocks());

describe("GET /data", () => {
  it("returns all nodes", async () => {
    mockCollection.toArray.mockResolvedValue([
      { name: "A", description: "Root", parent: "" },
    ]);

    const res = await request(app).get("/data");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].name).toBe("A");
  });

  it("returns 500 on DB error", async () => {
    mockCollection.toArray.mockRejectedValue(new Error("DB error"));
    const res = await request(app).get("/data");
    expect(res.status).toBe(500);
  });
});

describe("POST /data", () => {
  it("creates a node successfully", async () => {
    mockCollection.insertOne.mockResolvedValue({ insertedId: "abc123" });

    const res = await request(app)
      .post("/data")
      .send({ name: "B", description: "Child", parent: "A" });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe("B");
  });

  it("returns 400 when name is missing", async () => {
    const res = await request(app)
      .post("/data")
      .send({ description: "No name" });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Name is required");
  });
});

describe("PUT /data/:id", () => {
  it("updates a node successfully", async () => {
    mockCollection.updateOne.mockResolvedValue({ modifiedCount: 1 });

    const res = await request(app)
      .put("/data/6571b2f4e13b6c001f8d4a01")
      .send({ name: "B-updated", description: "Updated" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe("DELETE /data/:id", () => {
  it("deletes a node successfully", async () => {
    mockCollection.deleteOne.mockResolvedValue({ deletedCount: 1 });

    const res = await request(app).delete("/data/6571b2f4e13b6c001f8d4a01");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
