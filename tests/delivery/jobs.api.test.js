// Integration-style API tests using Express app + mocked MongoDB

jest.mock("../../src/config/mongoDB.js", () => ({ __esModule: true, connectDB: jest.fn() }));

jest.mock("../../src/modules/Model/Job-model.js", () => ({
  __esModule: true,
  Job: {
    create: jest.fn(),
    find: jest.fn().mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue([]),
    }),
    findById: jest.fn().mockReturnValue({
      populate: jest.fn().mockReturnThis(),
    }),
    countDocuments: jest.fn().mockResolvedValue(0),
    findByIdAndUpdate: jest.fn(),
  },
  JOB_STATUSES: [],
  FINAL_STATES: ["DELIVERED", "RETURN_COMPLETED", "REJECT_APPROVED"],
}));

jest.mock("../../src/modules/Model/JobStatusHistory-model.js", () => ({
  __esModule: true,
  JobStatusHistory: {
    find: jest.fn().mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      sort: jest.fn().mockResolvedValue([]),
    }),
    create: jest.fn(),
  },
}));

jest.mock("../../src/modules/Model/Notification-model.js", () => ({
  __esModule: true,
  Notification: {
    find: jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue([]),
    }),
    updateMany: jest.fn().mockResolvedValue({}),
    create: jest.fn(),
    insertMany: jest.fn(),
  },
}));

jest.mock("../../src/modules/Model/DeliveryUser-model.js", () => ({
  __esModule: true,
  DeliveryUser: {
    create: jest.fn(),
    findOne: jest.fn().mockReturnValue({ select: jest.fn() }),
    findById: jest.fn(),
    find: jest.fn().mockResolvedValue([]),
  },
}));

jest.mock("../../src/modules/services/notificationService.js", () => ({
  __esModule: true,
  default: { sendForTransition: jest.fn().mockResolvedValue(undefined) },
}));

jest.mock("../../src/modules/services/OrderStateMachineService.js", () => ({
  __esModule: true,
  default: { transition: jest.fn() },
}));

const request = require("supertest");
const express = require("express");
const jwt = require("jsonwebtoken");

process.env.JWT_SECRETKEY = "test-secret";

const { router: jobRouter }  = require("../../src/roues/job.router/job.router.js");
const { router: authRouter } = require("../../src/roues/deliveryAuth.router/deliveryAuth.router.js");
const { globalErrorHandler } = require("../../src/middelware/errorHandler.js");

const app = express();
app.use(express.json());
app.use("/api/delivery-auth", authRouter);
app.use("/api/jobs", jobRouter);
app.use(globalErrorHandler);

const makeToken = (role) =>
  jwt.sign({ _id: "507f1f77bcf86cd799439011", role, name: "Test" }, "test-secret");

const FAKE_JOB_ID = "507f1f77bcf86cd799439011";

beforeEach(() => jest.clearAllMocks());

// ── POST /api/jobs ─────────────────────────────────────────────────────────────

describe("POST /api/jobs — Create Job", () => {
  it("returns 400 when jobType is missing", async () => {
    const res = await request(app)
      .post("/api/jobs")
      .set("Authorization", `Bearer ${makeToken("USER")}`)
      .send({});
    expect(res.status).toBe(400);
  });

  it("returns 400 when jobType is invalid", async () => {
    const res = await request(app)
      .post("/api/jobs")
      .set("Authorization", `Bearer ${makeToken("USER")}`)
      .send({ jobType: "INVALID" });
    expect(res.status).toBe(400);
  });

  it("returns 201 for valid DELIVERY job", async () => {
    const { Job } = require("../../src/modules/Model/Job-model.js");
    Job.create.mockResolvedValue({
      _id: FAKE_JOB_ID,
      jobNo: "JOB-000001",
      jobType: "DELIVERY",
      status: "WAITING_FOR_ADMIN_CONFIRMATION",
    });

    const res = await request(app)
      .post("/api/jobs")
      .set("Authorization", `Bearer ${makeToken("USER")}`)
      .send({ jobType: "DELIVERY" });

    expect(res.status).toBe(201);
    expect(res.body.data.jobType).toBe("DELIVERY");
    expect(res.body.data.status).toBe("WAITING_FOR_ADMIN_CONFIRMATION");
  });

  it("returns 201 for valid RETURN job", async () => {
    const { Job } = require("../../src/modules/Model/Job-model.js");
    Job.create.mockResolvedValue({
      _id: FAKE_JOB_ID,
      jobNo: "JOB-000002",
      jobType: "RETURN",
      status: "WAITING_FOR_RETURN_APPROVAL",
    });

    const res = await request(app)
      .post("/api/jobs")
      .set("Authorization", `Bearer ${makeToken("USER")}`)
      .send({ jobType: "RETURN" });

    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe("WAITING_FOR_RETURN_APPROVAL");
  });

  it("returns 403 when DRIVER tries to create a job", async () => {
    const res = await request(app)
      .post("/api/jobs")
      .set("Authorization", `Bearer ${makeToken("DRIVER")}`)
      .send({ jobType: "DELIVERY" });
    expect(res.status).toBe(403);
  });
});

// ── GET /api/jobs ──────────────────────────────────────────────────────────────

describe("GET /api/jobs — List Jobs", () => {
  it("returns 401 without token", async () => {
    const res = await request(app).get("/api/jobs");
    expect(res.status).toBe(401);
  });

  it("returns 200 with valid ADMIN token", async () => {
    const res = await request(app)
      .get("/api/jobs")
      .set("Authorization", `Bearer ${makeToken("ADMIN")}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});

// ── State machine role guards ──────────────────────────────────────────────────

describe("State machine endpoints — role guards", () => {
  it("returns 403 when USER tries PATCH /admin-confirm", async () => {
    const res = await request(app)
      .patch(`/api/jobs/${FAKE_JOB_ID}/admin-confirm`)
      .set("Authorization", `Bearer ${makeToken("USER")}`);
    expect(res.status).toBe(403);
  });

  it("returns 403 when USER tries PATCH /driver-confirm", async () => {
    const res = await request(app)
      .patch(`/api/jobs/${FAKE_JOB_ID}/driver-confirm`)
      .set("Authorization", `Bearer ${makeToken("USER")}`);
    expect(res.status).toBe(403);
  });

  it("returns 403 when DRIVER tries PATCH /admin-confirm", async () => {
    const res = await request(app)
      .patch(`/api/jobs/${FAKE_JOB_ID}/admin-confirm`)
      .set("Authorization", `Bearer ${makeToken("DRIVER")}`);
    expect(res.status).toBe(403);
  });

  it("returns 400 for malformed job ID", async () => {
    const res = await request(app)
      .patch("/api/jobs/bad-id/admin-confirm")
      .set("Authorization", `Bearer ${makeToken("ADMIN")}`);
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid job ID");
  });

  it("returns 200 when ADMIN confirms a job (state machine succeeds)", async () => {
    const OrderStateMachineService = require("../../src/modules/services/OrderStateMachineService.js").default;
    OrderStateMachineService.transition.mockResolvedValue({
      _id: FAKE_JOB_ID,
      status: "WAITING_FOR_DRIVER_CONFIRMATION",
    });

    const res = await request(app)
      .patch(`/api/jobs/${FAKE_JOB_ID}/admin-confirm`)
      .set("Authorization", `Bearer ${makeToken("ADMIN")}`);
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("WAITING_FOR_DRIVER_CONFIRMATION");
  });

  it("returns 409 when state machine rejects transition", async () => {
    const OrderStateMachineService = require("../../src/modules/services/OrderStateMachineService.js").default;
    const err = Object.assign(new Error("Invalid transition"), { status: 409 });
    OrderStateMachineService.transition.mockRejectedValue(err);

    const res = await request(app)
      .patch(`/api/jobs/${FAKE_JOB_ID}/admin-confirm`)
      .set("Authorization", `Bearer ${makeToken("ADMIN")}`);
    expect(res.status).toBe(409);
  });

  it("returns 403 when state machine blocks role", async () => {
    const OrderStateMachineService = require("../../src/modules/services/OrderStateMachineService.js").default;
    const err = Object.assign(new Error("Role not allowed"), { status: 403 });
    OrderStateMachineService.transition.mockRejectedValue(err);

    const res = await request(app)
      .patch(`/api/jobs/${FAKE_JOB_ID}/driver-confirm`)
      .set("Authorization", `Bearer ${makeToken("DRIVER")}`);
    expect(res.status).toBe(403);
  });
});

// ── Auth endpoints ─────────────────────────────────────────────────────────────

describe("POST /api/delivery-auth/register", () => {
  it("returns 400 when required fields are missing", async () => {
    const res = await request(app)
      .post("/api/delivery-auth/register")
      .send({ email: "test@test.com" });
    expect(res.status).toBe(400);
  });

  it("returns 400 for invalid role", async () => {
    const res = await request(app)
      .post("/api/delivery-auth/register")
      .send({ name: "Test", email: "t@t.com", password: "pass", role: "SUPERUSER" });
    expect(res.status).toBe(400);
  });
});
