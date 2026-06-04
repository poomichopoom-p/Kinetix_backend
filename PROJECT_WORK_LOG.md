# Project Work Log

## 2026-06-04

### API Testing

* สิ่งที่ทำ
  - อ่าน route จริงทั้งหมดที่ mount ใน `src/routes/index.js`
  - เทสทุก endpoint ในกลุ่ม users, staff, products, order, shoes, delivery-auth และ jobs
  - เพิ่ม legacy API smoke tests ใน `tests/legacy.api.test.js`
  - เพิ่ม automated test ใน `tests/delivery/jobs.api.test.js`
  - เทสทุก endpoint ที่เปิดจริงใน `src/roues/deliveryAuth.router/deliveryAuth.router.js`
  - เทสทุก endpoint ที่เปิดจริงใน `src/roues/job.router/job.router.js`
  - ครอบคลุม auth, CRUD/query, timeline, notifications, delivery flow, return flow, reject flow, customer reject flow, cancellation flow, upload proof และ legacy route smoke behavior
  - อัปเดตรายงานที่ `API_TEST_REPORT/API_TEST_REPORT.md`
* ผลลัพธ์
  - `npm.cmd test` ผ่านทั้งหมด
  - Test Suites: 4 passed / 4 total
  - Tests: 108 passed / 108 total
  - Final status: PASS
* ปัญหา
  - Test ชุดนี้ยังเป็น Express + Supertest โดย mock MongoDB models และ service dependencies ยังไม่ใช่ live DB integration test
  - ยังไม่ได้ยิง API กับ server จริงบน `localhost:5000`
  - `package.json` ไม่มี `build` script
  - `docs/delivery-api.yaml` ยังไม่ระบุ customer reject และ cancellation endpoints ที่ implementation เปิด route แล้ว
  - `GET /api/staff/:staffId` คืน 500 เพราะ `staff.controller.js` ใช้ `mongoose` แต่ไม่ได้ import
  - `GET /api/products/:category` ถูก route `GET /api/products/:brand` shadow
  - `authUser.js` มีโค้ดหลัง `next()` ที่อ้าง `userId` ซึ่งไม่ได้ประกาศ
  - `getUserById` ใน `user.controller.js` อ้าง `password` ที่ไม่ได้ประกาศ
  - `newOrder` ใน `orders.controller.js` ยังไม่มี response implementation
* ขั้นต่อไป
  - เพิ่ม live integration test กับ MongoDB จริง
  - ใช้ `tests/http/delivery.http` ยิง manual/local API ถ้าต้องยืนยัน environment จริง
  - อัปเดต OpenAPI ให้ตรงกับ route จริงทั้งหมด
  - แก้ bugs ที่พบใน legacy controllers/middleware แล้วรัน full API suite ซ้ำ
