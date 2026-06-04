# API Test Report

## Date

2026-06-04

## Scope

ตรวจสอบ Delivery & Return Management API จาก `docs/delivery-api.yaml` และ route จริงใต้ `/api/delivery-auth` กับ `/api/jobs`

ทดสอบ:
- Delivery Auth API: register, login guard, current profile auth guard
- Jobs API: create job, list jobs, validation ของ job ID
- Delivery, return และ reject state transitions ผ่าน API route handler และ state machine service
- Role-based authorization, JWT authorization, validation, conflict, not found และ error response behavior

ไม่ทดสอบ:
- Legacy commerce API: `/api/users`, `/api/products`, `/api/order`, `/api/shoes`
- Live MongoDB integration และข้อมูลจริงในฐานข้อมูล
- Multipart upload จริงของ `/api/jobs/:id/upload-proof`
- Side effect ของ notification service ภายนอก mocked service calls

## Tested Endpoints

| Endpoint | Method | Auth | Payload / Params | Status | Result | Note |
| --- | --- | --- | --- | --- | --- | --- |
| `/api/delivery-auth/register` | POST | None | missing required fields | 400 | PASS | validation ทำงานถูกต้อง |
| `/api/delivery-auth/register` | POST | None | invalid role `SUPERUSER` | 400 | PASS | enforce role enum |
| `/api/jobs` | POST | USER token | `{ "jobType": "DELIVERY" }` | 201 | PASS | สร้าง delivery job และ status เริ่มต้นถูกต้อง |
| `/api/jobs` | POST | USER token | `{ "jobType": "RETURN" }` | 201 | PASS | สร้าง return job และ status เริ่มต้นถูกต้อง |
| `/api/jobs` | POST | USER token | `{}` | 400 | PASS | reject missing `jobType` |
| `/api/jobs` | POST | USER token | `{ "jobType": "INVALID" }` | 400 | PASS | reject invalid job type |
| `/api/jobs` | POST | DRIVER token | `{ "jobType": "DELIVERY" }` | 403 | PASS | DRIVER สร้าง job ไม่ได้ |
| `/api/jobs` | GET | ไม่มี token | none | 401 | PASS | unauthorized ถูก block |
| `/api/jobs` | GET | ADMIN token | default query | 200 | PASS | response มี `total`, `page`, `limit`, `data` |
| `/api/jobs/:id/admin-confirm` | PATCH | USER token | valid ObjectId | 403 | PASS | role guard block USER |
| `/api/jobs/:id/admin-confirm` | PATCH | DRIVER token | valid ObjectId | 403 | PASS | role guard block DRIVER |
| `/api/jobs/:id/admin-confirm` | PATCH | ADMIN token | malformed id | 400 | PASS | invalid ObjectId ถูก reject |
| `/api/jobs/:id/admin-confirm` | PATCH | ADMIN token | valid transition | 200 | PASS | success response เป็น `{ data }` |
| `/api/jobs/:id/admin-confirm` | PATCH | ADMIN token | invalid transition จาก service | 409 | PASS | conflict ถูก map ถูกต้อง |
| `/api/jobs/:id/driver-confirm` | PATCH | DRIVER token | role blocked จาก service | 403 | PASS | forbidden ถูก map ถูกต้อง |
| delivery state machine | Service/API logic | ADMIN/DRIVER | valid sequence | 200-equivalent | PASS | delivery transitions ผ่านครบ |
| return state machine | Service/API logic | ADMIN/DRIVER | valid sequence | 200-equivalent | PASS | return transitions ผ่านครบ |
| reject state machine | Service/API logic | ADMIN/DRIVER | valid sequence | 200-equivalent | PASS | reject transitions ผ่านครบ |
| state machine not found | Service/API logic | valid role | missing job | 404 | PASS | not found ถูกต้องใน service layer |
| final-state guard | Service/API logic | DRIVER | final statuses | 409 | PASS | final state ไม่ให้ transition ต่อ |
| JWT delivery auth middleware | Middleware | missing token | none | 401 | PASS | ไม่มี token ถูก block |
| JWT delivery auth middleware | Middleware | malformed token | `Bearer badtoken` | 401 | PASS | invalid token ถูก block |
| JWT delivery auth middleware | Middleware | valid token | signed JWT | next | PASS | set `req.user` ถูกต้อง |

## Result Summary

* Passed: 45
* Failed: 0
* Skipped: 0

## Findings

- API route coverage ของ delivery domain ตรงกับ OpenAPI scope หลัก
- Authorization ทำงานทั้งระดับ JWT middleware และ route role guard
- State machine คืน 403 สำหรับ role ที่ไม่มีสิทธิ์, 404 สำหรับ job ที่ไม่พบ และ 409 สำหรับ invalid/final-state transition
- Response shape ฝั่ง success ของ job operations ใช้ `{ data }` สม่ำเสมอ
- Error response shape ยังมีความต่างระหว่าง controller direct response กับ global error handler
- `docs/delivery-api.yaml` ยังไม่มี customer reject และ cancellation endpoints ที่ implementation เปิด route แล้ว

## Bugs Found

ไม่พบ blocking bug ใน scope ที่ทดสอบ

Documentation gap:
- ควรอัปเดต OpenAPI ถ้า customer reject และ cancellation endpoints เป็น public API

## Risk

- Automated API tests ปัจจุบัน mock MongoDB models และ services จึงตรวจ route/controller/state-machine logic ได้ แต่ยังไม่ยืนยัน database indexes, connection behavior หรือ persistence side effects จริง
- ยังไม่มี test สำหรับ upload proof endpoint
- `package.json` ไม่มี build script จึงตรวจ build ได้ด้วย test และ syntax check เท่านั้น

## Evidence

Command:

```bash
npm.cmd test
```

Result:

```text
Test Suites: 3 passed, 3 total
Tests:       45 passed, 45 total
Snapshots:   0 total
Time:        3.546 s
```

Dependency restore:

```bash
npm.cmd install
```

Result:

```text
added 417 packages
found 0 vulnerabilities
```

## What Was Done

- อ่าน context files ตามที่มีจริง และยืนยันว่า `PROJECT_CONTEXT.md`, `SPEC.md`, `PLAN.md`, `TASKS.md`, `PROJECT_WORK_LOG.md` ไม่มีอยู่ที่ root ก่อนเริ่มงาน
- reviewed delivery API docs, route mapping, controller, middleware, model และ state machine service
- restore npm dependencies ที่ขาดเพื่อให้ Jest ทำงานได้
- execute API-focused Jest/Supertest และ service tests
- verify happy path, validation, authorization, forbidden, invalid ID, not found, conflict และ final-state behavior
- สร้าง `PROJECT_WORK_LOG.md` ใหม่เพราะไฟล์เดิมไม่พบ

## Next Plan

- เพิ่ม live MongoDB integration tests สำหรับ delivery API
- เพิ่ม test สำหรับ `/api/jobs/:id/upload-proof`
- อัปเดต `docs/delivery-api.yaml` สำหรับ customer reject และ cancellation endpoints ถ้าเป็น public API

## Final Status

PASS
