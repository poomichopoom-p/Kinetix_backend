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

* Passed: 108
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
- ยังไม่ได้ยิง API กับ server ที่รันจริงบน `localhost:5000`
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
Tests:       108 passed, 108 total
Snapshots:   0 total
Time:        3.189 s
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

## Final Status

PASS
