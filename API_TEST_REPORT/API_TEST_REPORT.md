# API Test Report

## Date

2026-06-04

## Scope

เทส API ทั้งหมดที่มีใน backend จาก route จริงที่ mount ใน `src/routes/index.js`

ครอบคลุม:

- `/api/users`
- `/api/staff`
- `/api/products`
- `/api/order`
- `/api/shoes`
- `/api/delivery-auth`
- `/api/jobs`

อ้างอิงไฟล์:

- `src/routes/index.js`
- `src/routes/user.router/users.routes.js`
- `src/routes/staff.router/staff.router.js`
- `src/routes/product.router/product.router.js`
- `src/routes/order.router/order.router.js`
- `src/roues/shoe.router/shoe.router.js`
- `src/roues/deliveryAuth.router/deliveryAuth.router.js`
- `src/roues/job.router/job.router.js`
- `docs/delivery-api.yaml`
- `tests/legacy.api.test.js`
- `tests/delivery/jobs.api.test.js`
- `tests/delivery/rolePermissions.test.js`
- `tests/delivery/stateMachine.test.js`

## Tested Endpoints

| Endpoint | Method | Case | Expected | Result |
| --- | --- | --- | --- | --- |
| `/api/delivery-auth/register` | POST | register สำเร็จ | 201 | PASS |
| `/api/delivery-auth/register` | POST | missing fields | 400 | PASS |
| `/api/delivery-auth/register` | POST | invalid role | 400 | PASS |
| `/api/delivery-auth/register` | POST | duplicate email | 409 | PASS |
| `/api/delivery-auth/login` | POST | login สำเร็จ | 200 | PASS |
| `/api/delivery-auth/login` | POST | missing payload | 400 | PASS |
| `/api/delivery-auth/login` | POST | email ไม่พบ | 401 | PASS |
| `/api/delivery-auth/login` | POST | password ผิด | 401 | PASS |
| `/api/delivery-auth/me` | GET | ไม่มี token | 401 | PASS |
| `/api/delivery-auth/me` | GET | user ไม่พบ | 404 | PASS |
| `/api/delivery-auth/me` | GET | token ถูกต้อง | 200 | PASS |
| `/api/jobs` | POST | create DELIVERY | 201 | PASS |
| `/api/jobs` | POST | create RETURN | 201 | PASS |
| `/api/jobs` | POST | missing `jobType` | 400 | PASS |
| `/api/jobs` | POST | invalid `jobType` | 400 | PASS |
| `/api/jobs` | POST | DRIVER create job | 403 | PASS |
| `/api/jobs` | GET | ไม่มี token | 401 | PASS |
| `/api/jobs` | GET | list default | 200 | PASS |
| `/api/jobs` | GET | filter + pagination | 200 | PASS |
| `/api/jobs/:id` | GET | invalid id | 400 | PASS |
| `/api/jobs/:id` | GET | job ไม่พบ | 404 | PASS |
| `/api/jobs/:id` | GET | job detail | 200 | PASS |
| `/api/jobs/:id/timeline` | GET | invalid id | 400 | PASS |
| `/api/jobs/:id/timeline` | GET | timeline list | 200 | PASS |
| `/api/jobs/notifications` | GET | notification list | 200 | PASS |
| `/api/jobs/notifications/read` | PATCH | mark read | 200 | PASS |
| `/api/jobs/:id/admin-confirm` | PATCH | ADMIN transition | 200 | PASS |
| `/api/jobs/:id/driver-confirm` | PATCH | DRIVER transition | 200 | PASS |
| `/api/jobs/:id/pickup` | PATCH | DRIVER transition | 200 | PASS |
| `/api/jobs/:id/in-transit` | PATCH | DRIVER transition | 200 | PASS |
| `/api/jobs/:id/complete` | PATCH | DRIVER transition | 200 | PASS |
| `/api/jobs/:id/return-approve` | PATCH | ADMIN transition | 200 | PASS |
| `/api/jobs/:id/return-driver-confirm` | PATCH | DRIVER transition | 200 | PASS |
| `/api/jobs/:id/return-pickup` | PATCH | DRIVER transition | 200 | PASS |
| `/api/jobs/:id/return-in-transit` | PATCH | DRIVER transition | 200 | PASS |
| `/api/jobs/:id/return-complete` | PATCH | DRIVER transition | 200 | PASS |
| `/api/jobs/:id/reject` | PATCH | ADMIN transition | 200 | PASS |
| `/api/jobs/:id/reject-driver-confirm` | PATCH | DRIVER transition | 200 | PASS |
| `/api/jobs/:id/reject-approve` | PATCH | ADMIN transition | 200 | PASS |
| `/api/jobs/:id/customer-reject` | PATCH | USER transition | 200 | PASS |
| `/api/jobs/:id/customer-reject-acknowledge` | PATCH | DRIVER transition | 200 | PASS |
| `/api/jobs/:id/customer-reject-complete` | PATCH | ADMIN transition | 200 | PASS |
| `/api/jobs/:id/request-cancellation` | PATCH | USER transition | 200 | PASS |
| `/api/jobs/:id/approve-cancellation` | PATCH | ADMIN transition | 200 | PASS |
| `/api/jobs/:id/upload-proof` | PATCH | role ไม่ถูกต้อง | 403 | PASS |
| `/api/jobs/:id/upload-proof` | PATCH | ไม่มีไฟล์ | 400 | PASS |
| `/api/jobs/:id/upload-proof` | PATCH | invalid file extension | 400 | PASS |
| `/api/jobs/:id/upload-proof` | PATCH | invalid id | 400 | PASS |
| `/api/jobs/:id/upload-proof` | PATCH | job ไม่พบ | 404 | PASS |
| `/api/jobs/:id/upload-proof` | PATCH | upload สำเร็จ | 200 | PASS |
| `/api/users/register` | POST | register สำเร็จ | 201 | PASS |
| `/api/users/register` | POST | invalid email | 400 | PASS |
| `/api/users/login` | POST | login สำเร็จ | 200 | PASS |
| `/api/users/:id` | GET | ไม่มี cookie | 401 | PASS |
| `/api/users/:id` | PATCH | ไม่มี cookie | 401 | PASS |
| `/api/users/:id` | DELETE | ไม่มี cookie | 401 | PASS |
| `/api/products` | GET | list products | 200 | PASS |
| `/api/products/createProduct` | POST | create product | 201 | PASS |
| `/api/products/createProduct` | POST | incomplete payload | 404 | PASS |
| `/api/products/newBrand` | POST | create brand | 201 | PASS |
| `/api/products/:brand` | GET | brand body ถูกส่งมา | 200 | PASS |
| `/api/products/:category` | GET | route ถูก shadow โดย `/:brand` | 400 | PASS |
| `/api/staff` | GET | list staff | 200 | PASS |
| `/api/staff/:staffId` | GET | current implementation error | 500 | PASS |
| `/api/staff/:id` | PATCH | ไม่มี cookie | 401 | PASS |
| `/api/staff/staffRegister` | POST | register staff | 201 | PASS |
| `/api/order` | GET | ไม่มี cookie | 401 | PASS |
| `/api/order/create-order` | POST | ไม่มี cookie | 401 | PASS |
| `/api/order/:id` | DELETE | ไม่มี cookie | 401 | PASS |
| `/api/shoes/:id` | GET | invalid id | 400 | PASS |
| `/api/shoes/:id` | GET | shoe ไม่พบ | 404 | PASS |
| `/api/shoes/:id` | GET | shoe detail | 200 | PASS |

## Result Summary

* Passed: 117
* Failed: 0
* Skipped: 0

## Findings

- ตอนนี้ automated test ครอบคลุมทุก route ที่ mount ใน `src/routes/index.js`
- Authorization ครอบคลุมทั้ง JWT middleware และ role guard
- Validation ครอบคลุม missing field, invalid role, invalid job type, invalid ObjectId และ invalid file extension
- Error cases ครอบคลุม 400, 401, 403, 404 และ 409
- State machine test ครอบคลุม delivery, return, reject, final state guard, role guard และ invalid transition
- API implementation มี customer reject และ cancellation routes แต่ `docs/delivery-api.yaml` ยังไม่ได้ระบุ endpoint เหล่านี้
- `GET /api/products/:category` ถูก route `GET /api/products/:brand` shadow เพราะ path pattern เหมือนกันและ `/:brand` ถูกประกาศก่อน
- `GET /api/staff/:staffId` คืน 500 เพราะ `staff.controller.js` ใช้ `mongoose.Types.ObjectId` แต่ไม่ได้ import `mongoose`

## Bugs Found

พบ bug/behavior risk จาก legacy route:

- `GET /api/staff/:staffId` ควร validate id และคืน 400/404 แต่ implementation ปัจจุบันคืน 500 เพราะขาด `import mongoose from "mongoose";`
- `GET /api/products/:category` ไม่สามารถเข้าถึง handler `getCategory` ได้จริง เพราะถูก `GET /api/products/:brand` shadow
- `authUser.js` มีโค้ดหลัง `next()` ที่อ้าง `userId` ซึ่งไม่ได้ประกาศ อาจทำให้ protected route ที่มี token ถูกต้องเกิด response ซ้ำหรือ 401 ผิดพลาด
- `getUserById` ใน `user.controller.js` มีการอ้าง `password` ที่ไม่ได้ประกาศหลังพบ user อาจทำให้ happy path ของ `GET /api/users/:id` ล้มเหลวเมื่อ auth ผ่าน
- `POST /api/order/create-order` ยังไม่มี response implementation ใน `newOrder`

## Risk

- Test ชุดนี้เป็น Express + Supertest โดย mock MongoDB models และ service dependencies จึงยังไม่ใช่ live DB integration test
- ยิง API กับ server จริงบน `localhost:5000` แล้วในรอบ Live API Verification และ Legacy Bug Fix Verification
- ไม่มี `build` script ใน `package.json` ทำให้ตรวจ build ด้วย `npm.cmd run build` ไม่ได้
- รายงานเดิมใน `docs/API_TEST_REPORT.md` ถูกลบอยู่ใน working tree; รอบนี้บันทึกรายงานไว้ที่ `API_TEST_REPORT/API_TEST_REPORT.md`

## Evidence

คำสั่งที่รัน:

```bash
npm.cmd test
```

ผลลัพธ์:

```text
Test Suites: 4 passed, 4 total
Tests:       117 passed, 117 total
Snapshots:   0 total
Time:        3.073 s
Ran all test suites.
```

## What Was Done

- อ่าน route จริงทั้งหมดที่ mount ใน `src/routes/index.js`
- เพิ่ม legacy API smoke tests ใน `tests/legacy.api.test.js`
- เพิ่ม automated test ใน `tests/delivery/jobs.api.test.js`
- เทส users, staff, products, order, shoes, delivery auth, jobs, timeline, notifications, delivery flow, return flow, reject flow, customer reject flow, cancellation flow และ upload proof
- รัน test suite ทั้งหมดจนผ่าน
- อัปเดตรายงานผลเทสให้ทีมอ่านต่อได้

## Next Plan

- เพิ่ม live integration test กับ MongoDB จริง
- เพิ่ม HTTP/manual test run จาก `tests/http/delivery.http` ถ้าต้องยืนยัน environment จริง
- อัปเดต `docs/delivery-api.yaml` ให้ครอบคลุม customer reject และ cancellation endpoints
- แก้ legacy bugs ที่พบใน `staff.controller.js`, `product.router.js`, `authUser.js`, `user.controller.js` และ `orders.controller.js`

## Coverage Matrix

| Route Group | Endpoint | Method | Automated Test | Live Test | Status | Note |
| --- | --- | --- | --- | --- | --- | --- |
| Health | `/` | GET | N/A | PASS | PASS | Live health ได้ 200 |
| Users | `/api/users/register` | POST | PASS | PASS | PASS | register live ได้ 201 |
| Users | `/api/users/login` | POST | PASS | FAIL | PARTIAL | live login หลัง register ได้ 404 เพราะ controller ค้น `userEmail` แต่ register บันทึก `email` |
| Users | `/api/users/:id` | GET | PASS | FAIL | PARTIAL | no-cookie ได้ 401; signed cookie ยังได้ 401 และ server log มี headers sent error |
| Users | `/api/users/:id` | PATCH | PASS | FAIL | PARTIAL | signed cookie ได้ 401; เสี่ยงจาก `authUser.js` |
| Users | `/api/users/:id` | DELETE | PASS | NOT RUN | PARTIAL | automated ครอบคลุม no-cookie; live cookie ไม่ทดสอบต่อเพราะ auth middleware fail |
| Staff | `/api/staff` | GET | PASS | PASS | PASS | live ได้ 200 |
| Staff | `/api/staff/:staffId` | GET | PASS | PASS | PARTIAL | live ยืนยัน bug ได้ 500 เพราะ `mongoose` ไม่ได้ import |
| Staff | `/api/staff/:id` | PATCH | PASS | FAIL | PARTIAL | signed cookie ยังได้ 401 จาก legacy auth flow |
| Staff | `/api/staff/staffRegister` | POST | PASS | NOT RUN | PARTIAL | automated ผ่าน; live ไม่ยิงเพื่อเลี่ยงสร้าง staff จริงเพิ่ม |
| Products | `/api/products` | GET | PASS | PASS | PASS | live ได้ 200 |
| Products | `/api/products/createProduct` | POST | PASS | NOT RUN | PARTIAL | automated ผ่าน; live ไม่สร้าง product จริงเพิ่ม |
| Products | `/api/products/newBrand` | POST | PASS | NOT RUN | PARTIAL | automated ผ่าน; live ไม่สร้าง brand จริงเพิ่ม |
| Products | `/api/products/:brand` | GET | PASS | PARTIAL | PARTIAL | route ใช้ GET body ทำให้ client ปกติทดสอบยาก |
| Products | `/api/products/:category` | GET | PASS | PASS | PARTIAL | live ได้ 400 และยืนยันว่าถูก `/:brand` shadow |
| Order | `/api/order` | GET | PASS | PARTIAL | PARTIAL | no-cookie ได้ 401; signed cookie ยัง fail จาก `authUser` |
| Order | `/api/order/create-order` | POST | PASS | FAIL | PARTIAL | signed cookie fail และ `newOrder` ยังไม่มี response implementation |
| Order | `/api/order/:id` | DELETE | PASS | NOT RUN | PARTIAL | automated ครอบคลุม no-cookie; live cookie ไม่ทดสอบต่อเพราะ auth middleware fail |
| Shoes | `/api/shoes/:id` | GET | PASS | PASS | PASS | live invalid id ได้ 400; automated ครอบคลุม 404/200 |
| Delivery Auth | `/api/delivery-auth/register` | POST | PASS | PASS | PASS | live register admin/driver/user ได้ 201 และ duplicate ได้ 409 |
| Delivery Auth | `/api/delivery-auth/login` | POST | PASS | PASS | PASS | live login ได้ 200 และ missing payload ได้ 400 |
| Delivery Auth | `/api/delivery-auth/me` | GET | PASS | PASS | PASS | live Bearer token ได้ 200 |
| Jobs | `/api/jobs` | GET | PASS | PASS | PASS | no-token ได้ 401; Bearer token ได้ 200 |
| Jobs | `/api/jobs` | POST | PASS | PASS | PASS | live create ได้ 201, invalid type ได้ 400, DRIVER create ได้ 403 |
| Jobs | `/api/jobs/:id` | GET | PASS | PASS | PASS | live invalid id ได้ 400 และ detail ได้ 200 |
| Jobs | `/api/jobs/:id/timeline` | GET | PASS | PASS | PASS | live ได้ 200 |
| Jobs | `/api/jobs/notifications` | GET | PASS | PASS | PASS | live ได้ 200 |
| Jobs | `/api/jobs/notifications/read` | PATCH | PASS | PASS | PASS | live ได้ 200 |
| Jobs | `/api/jobs/:id/admin-confirm` | PATCH | PASS | PASS | PASS | live transition ได้ 200 |
| Jobs | `/api/jobs/:id/driver-confirm` | PATCH | PASS | PASS | PASS | live transition ได้ 200 |
| Jobs | `/api/jobs/:id/pickup` | PATCH | PASS | NOT RUN | PARTIAL | automated ผ่าน; live ไม่ยิงต่อเพื่อไม่เปลี่ยน state เพิ่ม |
| Jobs | `/api/jobs/:id/in-transit` | PATCH | PASS | NOT RUN | PARTIAL | automated ผ่าน; live ไม่ยิงต่อเพื่อไม่เปลี่ยน state เพิ่ม |
| Jobs | `/api/jobs/:id/complete` | PATCH | PASS | PASS | PASS | live invalid transition ได้ 409 |
| Jobs | `/api/jobs/:id/return-approve` | PATCH | PASS | NOT RUN | PARTIAL | automated ผ่าน |
| Jobs | `/api/jobs/:id/return-driver-confirm` | PATCH | PASS | NOT RUN | PARTIAL | automated ผ่าน |
| Jobs | `/api/jobs/:id/return-pickup` | PATCH | PASS | NOT RUN | PARTIAL | automated ผ่าน |
| Jobs | `/api/jobs/:id/return-in-transit` | PATCH | PASS | NOT RUN | PARTIAL | automated ผ่าน |
| Jobs | `/api/jobs/:id/return-complete` | PATCH | PASS | NOT RUN | PARTIAL | automated ผ่าน |
| Jobs | `/api/jobs/:id/reject` | PATCH | PASS | NOT RUN | PARTIAL | automated ผ่าน |
| Jobs | `/api/jobs/:id/reject-driver-confirm` | PATCH | PASS | NOT RUN | PARTIAL | automated ผ่าน |
| Jobs | `/api/jobs/:id/reject-approve` | PATCH | PASS | NOT RUN | PARTIAL | automated ผ่าน |
| Jobs | `/api/jobs/:id/customer-reject` | PATCH | PASS | NOT RUN | PARTIAL | automated ผ่าน |
| Jobs | `/api/jobs/:id/customer-reject-acknowledge` | PATCH | PASS | NOT RUN | PARTIAL | automated ผ่าน |
| Jobs | `/api/jobs/:id/customer-reject-complete` | PATCH | PASS | NOT RUN | PARTIAL | automated ผ่าน |
| Jobs | `/api/jobs/:id/request-cancellation` | PATCH | PASS | NOT RUN | PARTIAL | automated ผ่าน |
| Jobs | `/api/jobs/:id/approve-cancellation` | PATCH | PASS | NOT RUN | PARTIAL | automated ผ่าน |
| Jobs | `/api/jobs/:id/upload-proof` | PATCH | PASS | PASS | PASS | live no-file ได้ 400; automated ครอบคลุม role/invalid/upload success |

## Live API Verification

- Server: `npm run dev`
- Base URL: `http://localhost:5000`
- Database: MongoDB จริงจาก `.env`, server log แสดง `Connected Data base !!`
- Auth Method: Bearer JWT สำหรับ delivery API, cookie `accessToken` สำหรับ legacy API
- Result: PARTIAL

Live cases ที่ผ่าน:

- health check `/` ได้ 200
- public routes: `/api/products`, `/api/staff`, `/api/shoes/bad-id`
- auth routes: delivery register/login/me
- protected routes ไม่มี token: `/api/jobs`, `/api/order`
- protected routes มี Bearer token จริง: `/api/jobs`, create job, get detail, timeline, admin-confirm, driver-confirm, notifications
- error cases สำคัญ: 400, 401, 403, 409

Live cases ที่ไม่ผ่าน:

- `/api/users/login` ได้ 404 หลัง register สำเร็จ เพราะ login ค้น field `userEmail` แต่ schema/register ใช้ `email`
- legacy protected routes ที่ใช้ cookie ยังได้ 401 แม้ส่ง signed JWT cookie แล้ว และ server log มี `Cannot set headers after they are sent to the client`
- `/api/staff/:staffId` ได้ 500 จาก bug ขาด import `mongoose`

## Legacy Bug Fix Status

แก้ bug legacy API ที่ทำให้ Live API Test เป็น `PARTIAL` ครบตาม scope รอบนี้แล้ว:

- `/api/users/login` ใช้ field `email` ตรงกับ schema/register แล้ว
- `authUser.js` ไม่มี response ซ้ำหลัง `next()` แล้ว
- `/api/staff/:staffId` validate ObjectId ได้ถูกต้อง และคืน 400/404 ตามเคส
- `/api/products/:brand` และ `/api/products/:category` ถูกเปลี่ยนเป็น `/api/products/brand/:brand` และ `/api/products/category/:category` เพื่อไม่ให้ route shadow กัน
- `POST /api/order/create-order` คืน `501 Not Implemented` ชัดเจน ไม่ปล่อย request ค้าง

## Post-Fix Legacy Verification

แก้เฉพาะ bug legacy API ที่ทำให้ Live API Test เป็น `PARTIAL` และยิง live re-test กับ `http://localhost:5000` แล้ว

| Endpoint | Method | Case | Expected | Live Result | Status |
| --- | --- | --- | --- | --- | --- |
| `/api/users/register` | POST | สร้าง user จริง | 201 | 201 | PASS |
| `/api/users/login` | POST | login ด้วย user ที่เพิ่ง register | 200 | 200 | PASS |
| `/api/users/:id` | GET | ใช้ cookie จาก login จริง | 200 | 200 | PASS |
| `/api/users/:id` | PATCH | ใช้ cookie จาก login จริง | 200 | 200 | PASS |
| `/api/order` | GET | ใช้ cookie จาก login จริง | 200 | 200 | PASS |
| `/api/order/create-order` | POST | ยังไม่ implement แต่ต้องไม่ค้าง | 501 | 501 | PASS |
| `/api/staff/:id` | PATCH | cookie user ที่ไม่ใช่ admin | 403 | 403 | PASS |
| `/api/staff/bad-id` | GET | invalid ObjectId | 400 | 400 | PASS |
| `/api/staff/:staffId` | GET | staff ไม่พบ | 404 | 404 | PASS |
| `/api/products/brand/:brand` | GET | route ใหม่สำหรับ brand | 200 | 200 | PASS |
| `/api/products/category/:category` | GET | route ใหม่สำหรับ category | 200 | 200 | PASS |
| `/api/products/:legacyDynamicPath` | GET | route เก่าที่ ambiguous ตกไปที่ shoe id validation | 400 | 400 | PASS |

Fix summary:

- `/api/users/login` เปลี่ยนจากค้น `userEmail` เป็น `email`
- `authUser.js` หยุดทำงานทันทีหลัง `return next()` และไม่ส่ง response ซ้ำ
- `staff.controller.js` import `mongoose` เพื่อ validate ObjectId ถูกต้อง
- product dynamic routes เปลี่ยนเป็น `/brand/:brand` และ `/category/:category`
- `POST /api/order/create-order` คืน `501 Not Implemented` ชัดเจน

Breaking change note:

- route เก่า `/api/products/:brand` และ `/api/products/:category` ถูกแทนด้วย `/api/products/brand/:brand` และ `/api/products/category/:category`
- ถ้า frontend ยังเรียก path เก่า ต้องอัปเดต frontend route ให้ตรง path ใหม่

## Server Restart Verification After Merge

แก้ syntax error จาก merge conflict ที่ทำให้ server restart ไม่ได้:

- Root cause: `src/modules/controller/products.controller.js` มี `export const getBrand` ซ้ำ
- Fix: ลบ duplicate declaration และคง `getBrand` สำหรับ `/api/products/brand/:brand`
- Fix: จัด route order ใน `src/routes/product.router/product.router.js` ให้ `/brand/:brand` และ `/category/:category` อยู่ก่อน `/:id`
- Test update: ปรับ `tests/legacy.api.test.js` ให้ตรง request shape ปัจจุบันของ user/product API

Verification:

- `node --check src/modules/controller/products.controller.js`: PASS
- `node --check src/routes/product.router/product.router.js`: PASS
- `node --check src/modules/controller/staff.controller.js`: PASS
- `node --check tests/legacy.api.test.js`: PASS
- `npm.cmd test`: PASS, 4 suites / 117 tests
- Live boot check: PASS, `GET http://localhost:5000/` ได้ `200 Welcome to Kinetix`

## Final Status

Automated Test: PASS
Legacy Live Re-Test: PASS
Server Restart Verification: PASS
Overall Status: PASS สำหรับ bugfix scope รอบนี้
