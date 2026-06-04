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
const bcrypt = require("bcrypt");
const fs = require("fs");

process.env.JWT_SECRETKEY = "test-secret";

const { router: jobRouter }  = require("../../src/routes/job.router/job.router.js");
const { router: authRouter } = require("../../src/routes/deliveryAuth.router/deliveryAuth.router.js");
const { globalErrorHandler } = require("../../src/middleware/errorHandler.js");

const app = express();
app.use(express.json());
app.use("/api/delivery-auth", authRouter);
app.use("/api/jobs", jobRouter);
app.use(globalErrorHandler);

const makeToken = (role) =>
  jwt.sign({ _id: "507f1f77bcf86cd799439011", role, name: "Test" }, "test-secret");

const FAKE_JOB_ID = "507f1f77bcf86cd799439011";
const OTHER_JOB_ID = "507f1f77bcf86cd799439012";

const mockFindByIdPopulate = (value) => ({
  populate: jest.fn().mockReturnValue({
    populate: jest.fn().mockResolvedValue(value),
  }),
});

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

describe("Delivery Auth API full coverage", () => {
  it("returns 201 and removes password on successful register", async () => {
    const { DeliveryUser } = require("../../src/modules/Model/DeliveryUser-model.js");
    DeliveryUser.create.mockResolvedValue({
      toObject: () => ({
        _id: FAKE_JOB_ID,
        name: "Admin",
        email: "admin@test.com",
        password: "hashed-password",
        role: "ADMIN",
      }),
    });

    const res = await request(app)
      .post("/api/delivery-auth/register")
      .send({ name: "Admin", email: "ADMIN@Test.com", password: "123456", role: "ADMIN" });

    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({ email: "admin@test.com", role: "ADMIN" });
    expect(res.body.data.password).toBeUndefined();
  });

  it("returns 409 when register email already exists", async () => {
    const { DeliveryUser } = require("../../src/modules/Model/DeliveryUser-model.js");
    DeliveryUser.create.mockRejectedValue({ code: 11000 });

    const res = await request(app)
      .post("/api/delivery-auth/register")
      .send({ name: "Admin", email: "admin@test.com", password: "123456", role: "ADMIN" });

    expect(res.status).toBe(409);
  });

  it("returns 400 when login payload is missing", async () => {
    const res = await request(app)
      .post("/api/delivery-auth/login")
      .send({ email: "admin@test.com" });

    expect(res.status).toBe(400);
  });

  it("returns 401 when login email does not exist", async () => {
    const { DeliveryUser } = require("../../src/modules/Model/DeliveryUser-model.js");
    DeliveryUser.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(null) });

    const res = await request(app)
      .post("/api/delivery-auth/login")
      .send({ email: "missing@test.com", password: "123456" });

    expect(res.status).toBe(401);
  });

  it("returns 401 when login password is wrong", async () => {
    const { DeliveryUser } = require("../../src/modules/Model/DeliveryUser-model.js");
    const hashed = await bcrypt.hash("right-password", 4);
    DeliveryUser.findOne.mockReturnValue({
      select: jest.fn().mockResolvedValue({
        _id: FAKE_JOB_ID,
        name: "Admin",
        email: "admin@test.com",
        password: hashed,
        role: "ADMIN",
      }),
    });

    const res = await request(app)
      .post("/api/delivery-auth/login")
      .send({ email: "admin@test.com", password: "wrong-password" });

    expect(res.status).toBe(401);
  });

  it("returns token and user on successful login", async () => {
    const { DeliveryUser } = require("../../src/modules/Model/DeliveryUser-model.js");
    const hashed = await bcrypt.hash("123456", 4);
    DeliveryUser.findOne.mockReturnValue({
      select: jest.fn().mockResolvedValue({
        _id: FAKE_JOB_ID,
        name: "Admin",
        email: "admin@test.com",
        password: hashed,
        role: "ADMIN",
      }),
    });

    const res = await request(app)
      .post("/api/delivery-auth/login")
      .send({ email: "admin@test.com", password: "123456" });

    expect(res.status).toBe(200);
    expect(res.body.token).toEqual(expect.any(String));
    expect(res.body.user).toMatchObject({ email: "admin@test.com", role: "ADMIN" });
  });

  it("returns 401 for GET /api/delivery-auth/me without token", async () => {
    const res = await request(app).get("/api/delivery-auth/me");
    expect(res.status).toBe(401);
  });

  it("returns 404 when current user is not found", async () => {
    const { DeliveryUser } = require("../../src/modules/Model/DeliveryUser-model.js");
    DeliveryUser.findById.mockResolvedValue(null);

    const res = await request(app)
      .get("/api/delivery-auth/me")
      .set("Authorization", `Bearer ${makeToken("ADMIN")}`);

    expect(res.status).toBe(404);
  });

  it("returns current user profile", async () => {
    const { DeliveryUser } = require("../../src/modules/Model/DeliveryUser-model.js");
    DeliveryUser.findById.mockResolvedValue({
      _id: FAKE_JOB_ID,
      name: "Admin",
      email: "admin@test.com",
      role: "ADMIN",
    });

    const res = await request(app)
      .get("/api/delivery-auth/me")
      .set("Authorization", `Bearer ${makeToken("ADMIN")}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ role: "ADMIN" });
  });
});

describe("Jobs query, detail, timeline, and notifications full coverage", () => {
  it("returns paginated jobs with query filters", async () => {
    const { Job } = require("../../src/modules/Model/Job-model.js");
    Job.find.mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue([{ _id: FAKE_JOB_ID, jobType: "RETURN" }]),
    });
    Job.countDocuments.mockResolvedValue(1);

    const res = await request(app)
      .get("/api/jobs?status=RETURN_COMPLETED&jobType=RETURN&page=2&limit=5")
      .set("Authorization", `Bearer ${makeToken("ADMIN")}`);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ total: 1, page: 2, limit: 5 });
    expect(res.body.data).toHaveLength(1);
  });

  it("returns 400 for GET /api/jobs/:id with malformed id", async () => {
    const res = await request(app)
      .get("/api/jobs/bad-id")
      .set("Authorization", `Bearer ${makeToken("ADMIN")}`);

    expect(res.status).toBe(400);
  });

  it("returns 404 for GET /api/jobs/:id when job is missing", async () => {
    const { Job } = require("../../src/modules/Model/Job-model.js");
    Job.findById.mockReturnValue(mockFindByIdPopulate(null));

    const res = await request(app)
      .get(`/api/jobs/${FAKE_JOB_ID}`)
      .set("Authorization", `Bearer ${makeToken("ADMIN")}`);

    expect(res.status).toBe(404);
  });

  it("returns 200 for GET /api/jobs/:id", async () => {
    const { Job } = require("../../src/modules/Model/Job-model.js");
    Job.findById.mockReturnValue(mockFindByIdPopulate({
      _id: FAKE_JOB_ID,
      jobType: "DELIVERY",
      status: "WAITING_FOR_ADMIN_CONFIRMATION",
    }));

    const res = await request(app)
      .get(`/api/jobs/${FAKE_JOB_ID}`)
      .set("Authorization", `Bearer ${makeToken("ADMIN")}`);

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("WAITING_FOR_ADMIN_CONFIRMATION");
  });

  it("returns 400 for GET /api/jobs/:id/timeline with malformed id", async () => {
    const res = await request(app)
      .get("/api/jobs/bad-id/timeline")
      .set("Authorization", `Bearer ${makeToken("ADMIN")}`);

    expect(res.status).toBe(400);
  });

  it("returns timeline entries", async () => {
    const { JobStatusHistory } = require("../../src/modules/Model/JobStatusHistory-model.js");
    JobStatusHistory.find.mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      sort: jest.fn().mockResolvedValue([{ jobId: FAKE_JOB_ID, newStatus: "DELIVERED" }]),
    });

    const res = await request(app)
      .get(`/api/jobs/${FAKE_JOB_ID}/timeline`)
      .set("Authorization", `Bearer ${makeToken("ADMIN")}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  it("returns my notifications", async () => {
    const { Notification } = require("../../src/modules/Model/Notification-model.js");
    Notification.find.mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue([{ _id: OTHER_JOB_ID, isRead: false }]),
    });

    const res = await request(app)
      .get("/api/jobs/notifications")
      .set("Authorization", `Bearer ${makeToken("USER")}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  it("marks notifications as read", async () => {
    const { Notification } = require("../../src/modules/Model/Notification-model.js");
    Notification.updateMany.mockResolvedValue({ modifiedCount: 2 });

    const res = await request(app)
      .patch("/api/jobs/notifications/read")
      .set("Authorization", `Bearer ${makeToken("USER")}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("All notifications marked as read");
  });
});

describe("All job transition endpoints full coverage", () => {
  const transitionCases = [
    ["/admin-confirm", "ADMIN", "WAITING_FOR_DRIVER_CONFIRMATION"],
    ["/driver-confirm", "DRIVER", "DRIVER_CONFIRMED"],
    ["/pickup", "DRIVER", "PICKED_UP"],
    ["/in-transit", "DRIVER", "IN_TRANSIT"],
    ["/complete", "DRIVER", "DELIVERED"],
    ["/return-approve", "ADMIN", "RETURN_DRIVER_PENDING"],
    ["/return-driver-confirm", "DRIVER", "RETURN_DRIVER_CONFIRMED"],
    ["/return-pickup", "DRIVER", "RETURN_PICKED_UP"],
    ["/return-in-transit", "DRIVER", "RETURN_IN_TRANSIT"],
    ["/return-complete", "DRIVER", "RETURN_COMPLETED"],
    ["/reject", "ADMIN", "REJECT_REQUESTED"],
    ["/reject-driver-confirm", "DRIVER", "REJECT_DRIVER_CONFIRMED"],
    ["/reject-approve", "ADMIN", "REJECT_APPROVED"],
    ["/customer-reject", "USER", "CUSTOMER_REJECTED"],
    ["/customer-reject-acknowledge", "DRIVER", "CUSTOMER_REJECT_ACKNOWLEDGED"],
    ["/customer-reject-complete", "ADMIN", "CUSTOMER_REJECT_COMPLETED"],
    ["/request-cancellation", "USER", "CANCELLATION_REQUESTED"],
    ["/approve-cancellation", "ADMIN", "CANCELLATION_APPROVED"],
  ];

  it.each(transitionCases)("PATCH /api/jobs/:id%s returns 200 for role %s", async (path, role, status) => {
    const OrderStateMachineService = require("../../src/modules/services/OrderStateMachineService.js").default;
    OrderStateMachineService.transition.mockResolvedValue({ _id: FAKE_JOB_ID, status });

    const res = await request(app)
      .patch(`/api/jobs/${FAKE_JOB_ID}${path}`)
      .set("Authorization", `Bearer ${makeToken(role)}`)
      .send({ remark: "tested" });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe(status);
    expect(OrderStateMachineService.transition).toHaveBeenCalledWith(
      expect.objectContaining({ newStatus: status, actionRole: role, remark: "tested" }),
    );
  });
});

describe("Upload proof endpoint full coverage", () => {
  it("returns 403 when non-driver uploads proof", async () => {
    const res = await request(app)
      .patch(`/api/jobs/${FAKE_JOB_ID}/upload-proof`)
      .set("Authorization", `Bearer ${makeToken("USER")}`);

    expect(res.status).toBe(403);
  });

  it("returns 400 when proof file is missing", async () => {
    const res = await request(app)
      .patch(`/api/jobs/${FAKE_JOB_ID}/upload-proof`)
      .set("Authorization", `Bearer ${makeToken("DRIVER")}`);

    expect(res.status).toBe(400);
  });

  it("returns 400 when proof file extension is invalid", async () => {
    const res = await request(app)
      .patch(`/api/jobs/${FAKE_JOB_ID}/upload-proof`)
      .set("Authorization", `Bearer ${makeToken("DRIVER")}`)
      .attach("proof", Buffer.from("not an image"), "proof.txt");

    expect(res.status).toBe(400);
  });

  it("returns 400 when job id is malformed", async () => {
    const res = await request(app)
      .patch("/api/jobs/bad-id/upload-proof")
      .set("Authorization", `Bearer ${makeToken("DRIVER")}`)
      .attach("proof", Buffer.from("fake image"), "proof.png");

    expect(res.status).toBe(400);
  });

  it("returns 404 when uploaded proof job is not found", async () => {
    const { Job } = require("../../src/modules/Model/Job-model.js");
    Job.findByIdAndUpdate.mockResolvedValue(null);

    const res = await request(app)
      .patch(`/api/jobs/${FAKE_JOB_ID}/upload-proof`)
      .set("Authorization", `Bearer ${makeToken("DRIVER")}`)
      .attach("proof", Buffer.from("fake image"), "proof.png");

    expect(res.status).toBe(404);
  });

  it("returns 200 when proof upload succeeds", async () => {
    const { Job } = require("../../src/modules/Model/Job-model.js");
    Job.findByIdAndUpdate.mockResolvedValue({
      _id: FAKE_JOB_ID,
      proofOfDeliveryImage: "uploads/proof/proof.png",
    });

    const res = await request(app)
      .patch(`/api/jobs/${FAKE_JOB_ID}/upload-proof`)
      .set("Authorization", `Bearer ${makeToken("DRIVER")}`)
      .attach("proof", Buffer.from("fake image"), "proof.png");

    expect(res.status).toBe(200);
    expect(res.body.data.proofOfDeliveryImage).toBeTruthy();
  });

  afterAll(() => {
    if (!fs.existsSync("uploads/proof")) return;
    for (const file of fs.readdirSync("uploads/proof")) {
      if (file.endsWith(".png")) {
        fs.unlinkSync(`uploads/proof/${file}`);
      }
    }
  });
});
