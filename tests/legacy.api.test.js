jest.mock("../src/config/mongoDB.js", () => ({ __esModule: true, connectDB: jest.fn() }));

jest.mock("../src/modules/Model/users-model.js", () => ({
  __esModule: true,
  User: {
    create: jest.fn(),
    findOne: jest.fn(),
    findById: jest.fn(),
    findByIdAndDelete: jest.fn(),
  },
}));

jest.mock("../src/modules/Model/products-model.js", () => ({
  __esModule: true,
  Products: {
    find: jest.fn(),
    create: jest.fn(),
  },
}));

jest.mock("../src/modules/Model/Brand-model.js", () => ({
  __esModule: true,
  Brand: {
    find: jest.fn(),
    create: jest.fn(),
  },
}));

jest.mock("../src/modules/Model/staff-model.js", () => ({
  __esModule: true,
  Staff: {
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    create: jest.fn(),
  },
}));

jest.mock("../src/modules/Model/Orders-model.js", () => ({
  __esModule: true,
  Orders: {
    find: jest.fn(),
    findByIdAndUpdate: jest.fn(),
  },
}));

jest.mock("../src/modules/Model/shoue-model.js", () => ({
  __esModule: true,
  Shoe: {
    findById: jest.fn(),
  },
}));

const request = require("supertest");
const express = require("express");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

process.env.JWT_SECRETKEY = "test-secret";

const { router: apiRouter } = require("../src/routes/index.js");
const { globalErrorHandler } = require("../src/middelware/errorHandler.js");

const app = express();
app.use(cookieParser());
app.use(express.json());
app.use("/api", apiRouter);
app.use(globalErrorHandler);

const FAKE_ID = "507f1f77bcf86cd799439011";
const OTHER_ID = "507f1f77bcf86cd799439012";

const signedCookie = (userId = FAKE_ID) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRETKEY, { expiresIn: "2h" });
  return `accessToken=${token}`;
};

beforeEach(() => jest.clearAllMocks());

describe("Legacy routes smoke coverage", () => {
  describe("Users API", () => {
    it("POST /api/users/register returns 201", async () => {
      const { User } = require("../src/modules/Model/users-model.js");
      User.create.mockResolvedValue({
        toObject: () => ({
          _id: FAKE_ID,
          name: "Tester",
          email: "tester@test.com",
          password: "hashed",
        }),
      });

      const res = await request(app)
        .post("/api/users/register")
        .send({ name: "Tester", email: "tester@test.com", password: "12345678" });

      expect(res.status).toBe(201);
      expect(res.body.data.password).toBeUndefined();
    });

    it("POST /api/users/register returns 400 for invalid email", async () => {
      const res = await request(app)
        .post("/api/users/register")
        .send({ name: "Tester", email: "bad-email", password: "12345678" });

      expect(res.status).toBe(400);
    });

    it("POST /api/users/login returns 200", async () => {
      const { User } = require("../src/modules/Model/users-model.js");
      const hashed = await bcrypt.hash("12345678", 4);
      User.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue({
          _id: FAKE_ID,
          name: "Tester",
          email: "tester@test.com",
          userRank: "bronze",
          password: hashed,
        }),
      });

      const res = await request(app)
        .post("/api/users/login")
        .send({ email: "tester@test.com", password: "12345678" });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(User.findOne).toHaveBeenCalledWith({ email: "tester@test.com" });
    });

    it.each(["get", "patch", "delete"])("%s /api/users/:id returns 401 without cookie", async (method) => {
      const res = await request(app)[method](`/api/users/${FAKE_ID}`);
      expect(res.status).toBe(401);
    });

    it("GET /api/users/:id returns 403 when cookie user does not own the route id", async () => {
      const res = await request(app)
        .get(`/api/users/${OTHER_ID}`)
        .set("Cookie", signedCookie(FAKE_ID));

      expect(res.status).toBe(403);
    });

    it("GET /api/users/:id returns 404 when owner user is missing", async () => {
      const { User } = require("../src/modules/Model/users-model.js");
      User.findById.mockResolvedValue(null);

      const res = await request(app)
        .get(`/api/users/${FAKE_ID}`)
        .set("Cookie", signedCookie());

      expect(res.status).toBe(404);
    });

    it("GET /api/users/:id returns 200 with a valid owner cookie", async () => {
      const { User } = require("../src/modules/Model/users-model.js");
      User.findById.mockResolvedValue({
        _id: FAKE_ID,
        name: "Tester",
        email: "tester@test.com",
        toObject: () => ({ _id: FAKE_ID, name: "Tester", email: "tester@test.com", password: "hidden" }),
      });

      const res = await request(app)
        .get(`/api/users/${FAKE_ID}`)
        .set("Cookie", signedCookie());

      expect(res.status).toBe(200);
      expect(res.body.data.password).toBeUndefined();
    });
  });

  describe("Products API", () => {
    it("GET /api/products returns 200", async () => {
      const { Products } = require("../src/modules/Model/products-model.js");
      Products.find.mockResolvedValue([{ _id: FAKE_ID, name: "Runner" }]);

      const res = await request(app).get("/api/products");

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
    });

    it("POST /api/products/createProduct returns 201", async () => {
      const { Products } = require("../src/modules/Model/products-model.js");
      Products.create.mockResolvedValue({ _id: FAKE_ID, name: "Runner" });

      const res = await request(app)
        .post("/api/products/createProduct")
        .send({
          name: "Runner",
          brandId: FAKE_ID,
          category: "Road",
          rentalPlan: [{ "1day": 100, "3day": 250, "7day": 500 }],
          variants: [{ skuColorCode: "RED", colorName: "Red", size: [{ size: 42, stock: 3 }] }],
        });

      expect(res.status).toBe(201);
    });

    it("POST /api/products/createProduct returns 404 for incomplete payload", async () => {
      const res = await request(app)
        .post("/api/products/createProduct")
        .send({ name: "Runner" });

      expect(res.status).toBe(404);
    });

    it("POST /api/products/newBrand returns 201", async () => {
      const { Brand } = require("../src/modules/Model/Brand-model.js");
      Brand.create.mockResolvedValue({ _id: FAKE_ID, brandName: "Nike" });

      const res = await request(app)
        .post("/api/products/newBrand")
        .send({ brandName: "Nike", model: "Pegasus" });

      expect(res.status).toBe(201);
    });

    it("GET /api/products/brand/:brand returns 200", async () => {
      const { Brand } = require("../src/modules/Model/Brand-model.js");
      Brand.find.mockResolvedValue([{ _id: FAKE_ID, brandName: "Nike" }]);

      const res = await request(app).get("/api/products/brand/Nike");

      expect(res.status).toBe(200);
      expect(Brand.find).toHaveBeenCalledWith({ brandName: "Nike" });
    });

    it("GET /api/products/category/:category returns 200", async () => {
      const { Products } = require("../src/modules/Model/products-model.js");
      Products.find.mockResolvedValue([{ _id: FAKE_ID, category: "Road" }]);

      const res = await request(app).get("/api/products/category/Road");

      expect(res.status).toBe(200);
      expect(Products.find).toHaveBeenCalledWith({ category: "Road" });
    });

    it("GET /api/products/:legacyDynamicPath no longer matches ambiguous product routes", async () => {
      const res = await request(app).get("/api/products/Road");
      expect(res.status).toBe(404);
    });
  });

  describe("Staff API", () => {
    it("GET /api/staff returns 200", async () => {
      const { Staff } = require("../src/modules/Model/staff-model.js");
      Staff.find.mockResolvedValue([{ _id: FAKE_ID, role: "staff" }]);

      const res = await request(app).get("/api/staff?role=staff");

      expect(res.status).toBe(200);
      expect(res.body.count).toBe(1);
    });

    it("GET /api/staff/:staffId returns 400 for invalid id", async () => {
      const res = await request(app).get("/api/staff/bad-id");
      expect(res.status).toBe(400);
    });

    it("GET /api/staff/:staffId returns 404 when staff is missing", async () => {
      const { Staff } = require("../src/modules/Model/staff-model.js");
      Staff.findById.mockResolvedValue(null);

      const res = await request(app).get(`/api/staff/${FAKE_ID}`);
      expect(res.status).toBe(404);
    });

    it("GET /api/staff/:staffId returns 200", async () => {
      const { Staff } = require("../src/modules/Model/staff-model.js");
      Staff.findById.mockResolvedValue({ _id: FAKE_ID, role: "staff" });

      const res = await request(app).get(`/api/staff/${FAKE_ID}`);
      expect(res.status).toBe(200);
    });

    it("PATCH /api/staff/:id returns 401 without cookie", async () => {
      const res = await request(app)
        .patch(`/api/staff/${FAKE_ID}`)
        .send({ role: "admin" });

      expect(res.status).toBe(401);
    });

    it("PATCH /api/staff/:id returns 200 for admin cookie", async () => {
      const { Staff } = require("../src/modules/Model/staff-model.js");
      Staff.findById.mockResolvedValue({ _id: FAKE_ID, role: "admin" });
      Staff.findByIdAndUpdate.mockResolvedValue({ _id: FAKE_ID, role: "admin", is_active: true });

      const res = await request(app)
        .patch(`/api/staff/${FAKE_ID}`)
        .set("Cookie", signedCookie())
        .send({ is_active: true });

      expect(res.status).toBe(200);
    });

    it("POST /api/staff/staffRegister returns 201", async () => {
      const { Staff } = require("../src/modules/Model/staff-model.js");
      Staff.create.mockResolvedValue({
        toObject: () => ({
          _id: FAKE_ID,
          name: "Staff",
          surname: "Tester",
          email: "staff@test.com",
          password: "hidden",
          role: "staff",
        }),
      });

      const res = await request(app)
        .post("/api/staff/staffRegister")
        .send({ name: "Staff", surname: "Tester", email: "staff@test.com", password: "abc123" });

      expect(res.status).toBe(201);
      expect(res.body.data.password).toBeUndefined();
    });
  });

  describe("Order API", () => {
    it("GET /api/order returns 401 without cookie", async () => {
      const res = await request(app).get("/api/order");
      expect(res.status).toBe(401);
    });

    it("POST /api/order/create-order returns 401 without cookie", async () => {
      const res = await request(app).post("/api/order/create-order").send({});
      expect(res.status).toBe(401);
    });

    it("DELETE /api/order/:id returns 401 without cookie", async () => {
      const res = await request(app).delete(`/api/order/${FAKE_ID}`);
      expect(res.status).toBe(401);
    });

    it("GET /api/order returns 200 with cookie", async () => {
      const { Orders } = require("../src/modules/Model/Orders-model.js");
      Orders.find.mockResolvedValue([{ _id: FAKE_ID, status: "Waiting" }]);

      const res = await request(app)
        .get("/api/order")
        .set("Cookie", signedCookie());

      expect(res.status).toBe(200);
    });

    it("POST /api/order/create-order returns 501 with cookie instead of hanging", async () => {
      const res = await request(app)
        .post("/api/order/create-order")
        .set("Cookie", signedCookie())
        .send({ status: "Waiting" });

      expect(res.status).toBe(501);
    });
  });

  describe("Shoes API", () => {
    it("GET /api/shoes/:id returns 400 for invalid id", async () => {
      const res = await request(app).get("/api/shoes/bad-id");
      expect(res.status).toBe(400);
    });

    it("GET /api/shoes/:id returns 404 when shoe is missing", async () => {
      const { Shoe } = require("../src/modules/Model/shoue-model.js");
      Shoe.findById.mockResolvedValue(null);

      const res = await request(app).get(`/api/shoes/${FAKE_ID}`);
      expect(res.status).toBe(404);
    });

    it("GET /api/shoes/:id returns 200", async () => {
      const { Shoe } = require("../src/modules/Model/shoue-model.js");
      Shoe.findById.mockResolvedValue({ _id: FAKE_ID, name: "Runner" });

      const res = await request(app).get(`/api/shoes/${FAKE_ID}`);
      expect(res.status).toBe(200);
    });
  });
});
