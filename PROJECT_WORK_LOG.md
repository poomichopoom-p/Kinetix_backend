# Project Work Log

## 2026-06-04

### API Testing

* สิ่งที่ทำ
  - อ่าน route จริงทั้งหมดที่ mount ใน `src/routes/index.js`
  - เทสทุก endpoint ในกลุ่ม users, staff, products, order, shoes, delivery-auth และ jobs
  - เพิ่ม legacy API smoke tests ใน `tests/legacy.api.test.js`
  - เพิ่ม automated test ใน `tests/delivery/jobs.api.test.js`
  - ครอบคลุม auth, CRUD/query, timeline, notifications, delivery flow, return flow, reject flow, customer reject flow, cancellation flow, upload proof และ legacy route smoke behavior
  - อัปเดตรายงานที่ `API_TEST_REPORT/API_TEST_REPORT.md`
* ผลลัพธ์
  - `npm.cmd test` ผ่านทั้งหมด
  - Test Suites: 4 passed / 4 total
  - Tests: 108 passed / 108 total
  - Final status: PASS
* ปัญหา
  - Test ชุดแรกเป็น Express + Supertest โดย mock MongoDB models และ service dependencies ยังไม่ใช่ live DB integration test
  - `package.json` ไม่มี `build` script
  - `docs/delivery-api.yaml` ยังไม่ระบุ customer reject และ cancellation endpoints ที่ implementation เปิด route แล้ว
  - พบ legacy bugs ใน `staff.controller.js`, `product.router.js`, `authUser.js`, `user.controller.js` และ `orders.controller.js`

### Live API Verification

* สิ่งที่ทำ
  - Start server ด้วย `npm run dev`
  - ยิง API จริงที่ `http://localhost:5000`
  - ใช้ MongoDB จริงจาก `.env`
  - ทดสอบ public routes, auth routes, protected routes แบบไม่มี token, protected routes แบบมี Bearer token/cookie และ error cases สำคัญ
* ผลลัพธ์ก่อนแก้
  - Delivery API ผ่าน live verification
  - Legacy API บางส่วนยัง fail
  - Final status รอบนั้น: PARTIAL
* ปัญหา
  - `/api/users/login` ได้ 404 หลัง register เพราะ login ค้น `userEmail` แต่ register/schema ใช้ `email`
  - legacy protected routes ที่ใช้ cookie ได้ 401 และมี error `Cannot set headers after they are sent to the client`
  - `/api/staff/:staffId` ได้ 500 เพราะไม่ได้ import `mongoose`
  - `/api/products/:category` ถูก `/:brand` shadow
  - `POST /api/order/create-order` ไม่มี response implementation

### Legacy API Bug Fix Verification

* สิ่งที่ทำ
  - แก้ `/api/users/login` ให้ค้นด้วย field `email`
  - แก้ `authUser.js` ไม่ให้ทำงานต่อหลัง `next()` และไม่ส่ง response ซ้ำ
  - แก้ `staff.controller.js` ให้ import `mongoose`
  - แยก product dynamic routes เป็น `/api/products/brand/:brand` และ `/api/products/category/:category`
  - แก้ `POST /api/order/create-order` ให้คืน `501 Not Implemented`
  - อัปเดต `tests/legacy.api.test.js`
  - อัปเดต `API_TEST_REPORT/API_TEST_REPORT.md`
* ผลลัพธ์
  - `npm.cmd test` ผ่านทั้งหมด 117 tests / 4 suites
  - Live re-test legacy endpoints ที่เคย fail ผ่านทั้งหมด
  - ไม่พบ `Cannot set headers after they are sent to the client` ใน log รอบหลังแก้
* ปัญหา/ผลกระทบ
  - route เก่า `/api/products/:brand` และ `/api/products/:category` ถูกเปลี่ยนเป็น path ใหม่ที่ไม่ชนกัน
  - ถ้า frontend เรียก product dynamic route เก่า ต้องอัปเดตเป็น `/api/products/brand/:brand` หรือ `/api/products/category/:category`
* ขั้นต่อไป
  - รัน full live regression เพิ่มถ้าต้องการยืนยันทุก state transition กับ DB จริง
