// Unit tests for OrderStateMachineService — pure in-memory mocks, no DB needed.

jest.mock("../../src/modules/Model/Job-model.js", () => ({
  __esModule: true,
  Job: { findById: jest.fn(), findByIdAndUpdate: jest.fn() },
  FINAL_STATES: ["DELIVERED", "RETURN_COMPLETED", "REJECT_APPROVED"],
}));
jest.mock("../../src/modules/Model/JobStatusHistory-model.js", () => ({
  __esModule: true,
  JobStatusHistory: { create: jest.fn() },
}));
jest.mock("../../src/modules/services/notificationService.js", () => ({
  __esModule: true,
  default: { sendForTransition: jest.fn().mockResolvedValue(undefined) },
}));

const { Job, FINAL_STATES } = require("../../src/modules/Model/Job-model.js");
const { JobStatusHistory } = require("../../src/modules/Model/JobStatusHistory-model.js");
const OrderStateMachineService = require("../../src/modules/services/OrderStateMachineService.js").default;

const FAKE_JOB_ID = "507f1f77bcf86cd799439011";
const FAKE_USER_ID = "507f1f77bcf86cd799439012";

const makeJob = (status) => ({
  _id: FAKE_JOB_ID,
  jobNo: "JOB-000001",
  status,
  customerId: FAKE_USER_ID,
  driverId: null,
});

// Returns a Mongoose-like chainable query mock resolving to `value`
const mockQuery = (value) => ({
  populate: jest.fn().mockReturnValue({
    populate: jest.fn().mockResolvedValue(value),
  }),
});

beforeEach(() => jest.clearAllMocks());

describe("OrderStateMachineService.transition()", () => {
  describe("Job not found", () => {
    it("throws 404 when job does not exist", async () => {
      Job.findById.mockResolvedValue(null);
      await expect(
        OrderStateMachineService.transition({
          jobId: FAKE_JOB_ID,
          newStatus: "WAITING_FOR_DRIVER_CONFIRMATION",
          actionBy: FAKE_USER_ID,
          actionRole: "ADMIN",
        }),
      ).rejects.toMatchObject({ status: 404 });
    });
  });

  describe("Final state guard", () => {
    it.each(FINAL_STATES)("throws 409 when job is already in final state %s", async (status) => {
      Job.findById.mockResolvedValue(makeJob(status));
      await expect(
        OrderStateMachineService.transition({
          jobId: FAKE_JOB_ID,
          newStatus: "DELIVERED",
          actionBy: FAKE_USER_ID,
          actionRole: "DRIVER",
        }),
      ).rejects.toMatchObject({ status: 409 });
    });
  });

  describe("Invalid transition", () => {
    it("throws 409 for a transition that does not exist in the map", async () => {
      Job.findById.mockResolvedValue(makeJob("WAITING_FOR_ADMIN_CONFIRMATION"));
      await expect(
        OrderStateMachineService.transition({
          jobId: FAKE_JOB_ID,
          newStatus: "DELIVERED", // invalid jump
          actionBy: FAKE_USER_ID,
          actionRole: "ADMIN",
        }),
      ).rejects.toMatchObject({ status: 409 });
    });
  });

  describe("Role guard", () => {
    it("throws 403 when USER tries to admin-confirm", async () => {
      Job.findById.mockResolvedValue(makeJob("WAITING_FOR_ADMIN_CONFIRMATION"));
      await expect(
        OrderStateMachineService.transition({
          jobId: FAKE_JOB_ID,
          newStatus: "WAITING_FOR_DRIVER_CONFIRMATION",
          actionBy: FAKE_USER_ID,
          actionRole: "USER",
        }),
      ).rejects.toMatchObject({ status: 403 });
    });

    it("throws 403 when DRIVER tries to admin-confirm", async () => {
      Job.findById.mockResolvedValue(makeJob("WAITING_FOR_ADMIN_CONFIRMATION"));
      await expect(
        OrderStateMachineService.transition({
          jobId: FAKE_JOB_ID,
          newStatus: "WAITING_FOR_DRIVER_CONFIRMATION",
          actionBy: FAKE_USER_ID,
          actionRole: "DRIVER",
        }),
      ).rejects.toMatchObject({ status: 403 });
    });
  });

  describe("Valid delivery flow", () => {
    const transitions = [
      ["WAITING_FOR_ADMIN_CONFIRMATION", "WAITING_FOR_DRIVER_CONFIRMATION", "ADMIN"],
      ["WAITING_FOR_DRIVER_CONFIRMATION", "DRIVER_CONFIRMED", "DRIVER"],
      ["DRIVER_CONFIRMED", "PICKED_UP", "DRIVER"],
      ["PICKED_UP", "IN_TRANSIT", "DRIVER"],
      ["IN_TRANSIT", "DELIVERED", "DRIVER"],
    ];

    it.each(transitions)(
      "%s → %s (role: %s) succeeds",
      async (from, to, role) => {
        const updatedJob = { ...makeJob(from), status: to };
        Job.findById.mockResolvedValue(makeJob(from));
        Job.findByIdAndUpdate.mockReturnValue(mockQuery(updatedJob));
        JobStatusHistory.create.mockResolvedValue({});

        const result = await OrderStateMachineService.transition({
          jobId: FAKE_JOB_ID,
          newStatus: to,
          actionBy: FAKE_USER_ID,
          actionRole: role,
        });

        expect(result.status).toBe(to);
        expect(JobStatusHistory.create).toHaveBeenCalledWith(
          expect.objectContaining({ oldStatus: from, newStatus: to, actionRole: role }),
        );
      },
    );
  });

  describe("Valid return flow", () => {
    const transitions = [
      ["WAITING_FOR_RETURN_APPROVAL", "RETURN_DRIVER_PENDING", "ADMIN"],
      ["RETURN_DRIVER_PENDING", "RETURN_DRIVER_CONFIRMED", "DRIVER"],
      ["RETURN_DRIVER_CONFIRMED", "RETURN_PICKED_UP", "DRIVER"],
      ["RETURN_PICKED_UP", "RETURN_IN_TRANSIT", "DRIVER"],
      ["RETURN_IN_TRANSIT", "RETURN_COMPLETED", "DRIVER"],
    ];

    it.each(transitions)("%s → %s succeeds", async (from, to, role) => {
      const updatedJob = { ...makeJob(from), status: to };
      Job.findById.mockResolvedValue(makeJob(from));
      Job.findByIdAndUpdate.mockReturnValue(mockQuery(updatedJob));
      JobStatusHistory.create.mockResolvedValue({});

      const result = await OrderStateMachineService.transition({
        jobId: FAKE_JOB_ID,
        newStatus: to,
        actionBy: FAKE_USER_ID,
        actionRole: role,
      });
      expect(result.status).toBe(to);
    });
  });

  describe("Valid reject flow", () => {
    const transitions = [
      ["WAITING_FOR_ADMIN_CONFIRMATION", "REJECT_REQUESTED", "ADMIN"],
      ["REJECT_REQUESTED", "REJECT_DRIVER_CONFIRMED", "DRIVER"],
      ["REJECT_DRIVER_CONFIRMED", "REJECT_APPROVED", "ADMIN"],
    ];

    it.each(transitions)("%s → %s succeeds", async (from, to, role) => {
      const updatedJob = { ...makeJob(from), status: to };
      Job.findById.mockResolvedValue(makeJob(from));
      Job.findByIdAndUpdate.mockReturnValue(mockQuery(updatedJob));
      JobStatusHistory.create.mockResolvedValue({});

      const result = await OrderStateMachineService.transition({
        jobId: FAKE_JOB_ID,
        newStatus: to,
        actionBy: FAKE_USER_ID,
        actionRole: role,
      });
      expect(result.status).toBe(to);
    });
  });
});
