// Unit tests for RBAC middleware
const { requireRole } = require("../../src/middleware/rbac.js");

const makeReq = (role) => ({ user: { role } });
const makeRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("requireRole middleware", () => {
  it("calls next() when role is allowed", () => {
    const next = jest.fn();
    requireRole("ADMIN")(makeReq("ADMIN"), makeRes(), next);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it("returns 403 when role is not in the allowed list", () => {
    const res = makeRes();
    const next = jest.fn();
    requireRole("ADMIN")(makeReq("USER"), res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 403 when req.user is undefined", () => {
    const res = makeRes();
    requireRole("ADMIN")({ user: undefined }, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it("allows multiple roles — first role passes", () => {
    const next = jest.fn();
    requireRole("USER", "DRIVER", "ADMIN")(makeReq("DRIVER"), makeRes(), next);
    expect(next).toHaveBeenCalled();
  });

  it("allows multiple roles — last role passes", () => {
    const next = jest.fn();
    requireRole("USER", "DRIVER", "ADMIN")(makeReq("ADMIN"), makeRes(), next);
    expect(next).toHaveBeenCalled();
  });

  it("rejects a role not in multi-role list", () => {
    const res = makeRes();
    requireRole("USER", "DRIVER")(makeReq("ADMIN"), res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(403);
  });
});

describe("deliveryAuth middleware", () => {
  const jwt = require("jsonwebtoken");
  const deliveryAuth = require("../../src/middleware/deliveryAuth.js").default;

  const makeAuthReq = (header) => ({ headers: { authorization: header } });

  it("returns 401 when Authorization header is missing", () => {
    const res = makeRes();
    deliveryAuth({ headers: {} }, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("returns 401 when token is malformed", () => {
    const res = makeRes();
    deliveryAuth(makeAuthReq("Bearer badtoken"), res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("calls next() and sets req.user on a valid token", () => {
    process.env.JWT_SECRETKEY = "testsecret";
    const token = jwt.sign({ _id: "abc", role: "ADMIN" }, "testsecret");
    const req = makeAuthReq(`Bearer ${token}`);
    const next = jest.fn();
    deliveryAuth(req, makeRes(), next);
    expect(next).toHaveBeenCalled();
    expect(req.user).toMatchObject({ _id: "abc", role: "ADMIN" });
  });
});
