# Fong User API Summary

วันที่อัปเดต: 2026-05-29

## ภาษาไทย

### ภาพรวม

งานส่วนนี้เป็น API ฝั่ง User ที่รับผิดชอบโดย fong ตามแผนใน Figma เฉพาะ endpoint ที่ต้องใช้ token:

- `GET /api/users/:id` - ดูข้อมูลส่วนตัวของ user
- `PATCH /api/users/:id` - แก้ไขข้อมูลส่วนตัวของ user
- `DELETE /api/users/:id` - ลบ account ของ user

หมายเหตุ: `POST /register` และ `POST /login` ไม่อยู่ใน scope ของงานนี้ จึงไม่ได้สร้างหรือผูก route ในไฟล์ `users.routes.js`

### Flow การทำงาน

1. Client ส่ง request มาที่ `/api/users/:id`
2. Route เรียก `authUser` middleware ก่อนเข้า controller
3. Middleware ตรวจ token จาก cookie `accessToken` หรือ header `Authorization: Bearer <token>`
4. ถ้า token ถูกต้อง ระบบจะใส่ user id ไว้ที่ `req.user._id`
5. Controller ตรวจว่า token owner ตรงกับ `:id` หรือไม่
6. ถ้าตรงกันจึงอ่าน แก้ไข หรือลบข้อมูลใน MongoDB ผ่าน `User` model

### ส่วนย่อยที่ทำงานอะไร

#### `src/roues/user.router/users.routes.js`

ไฟล์นี้กำหนด route ของ user API:

- `router.get("/:id", authUser, getUserById)`
- `router.patch("/:id", authUser, updateUserById)`
- `router.delete("/:id", authUser, deleteUserById)`

ทุก route ต้องผ่าน `authUser` ก่อน เพื่อกันไม่ให้คนที่ไม่มี token เรียกข้อมูล user ได้

#### `src/roues/user.router/user.controller.js`

ไฟล์นี้เก็บ logic หลักของ API:

- `getUserById` ตรวจ id และ owner แล้วดึงข้อมูล user
- `updateUserById` ตรวจ id และ owner แล้วอัปเดตเฉพาะ field ที่อนุญาต
- `deleteUserById` ตรวจ id และ owner แล้วลบ account
- `isValidUserId` กัน id ที่ไม่ใช่ MongoDB ObjectId เพื่อลด error ที่ไม่จำเป็น
- `isOwner` กัน user คนอื่นมาอ่าน แก้ไข หรือลบ account ที่ไม่ใช่ของตัวเอง
- `sanitizeUser` ลบ password ออกจาก response ก่อนส่งกลับ

Field ที่อนุญาตให้อัปเดต:

- `name`
- `surname`
- `email`
- `password`
- `address`

#### `src/middelware/authUser.js`

ไฟล์นี้ตรวจ authentication:

- รับ token จาก cookie `accessToken`
- รับ token จาก header `Authorization: Bearer <token>`
- verify ด้วย `process.env.JWT_SECRETKEY`
- รองรับ payload key ได้หลายแบบ: `userId`, `id`, `_id`
- ถ้า token ไม่มี หมดอายุ หรือ payload ไม่ถูกต้อง จะตอบ `401`

#### `src/modules/users-model.js`

แก้ hook การ hash password จาก arrow function เป็น normal function:

- ใช้ `function ()` เพื่อให้ `this.isModified("password")` ทำงานถูกต้อง
- ถ้า user แก้ password ผ่าน `PATCH /:id` password จะถูก hash ก่อน save

#### `src/server.js`

แก้จุดที่ทำให้ server และ error handling ปลอดภัยขึ้น:

- import `cors` แบบ default import ให้ถูกต้อง
- ใช้ `cors(corsOption)` ตาม config ที่มีอยู่
- ย้าย error middleware ไปหลัง route เพื่อให้จับ error จาก API ได้จริง
- แก้ `new Data()` เป็น `new Date()`
- ไม่ส่ง `stack` กลับไปหา client ใน production

#### `src/roues/index.js`

แก้การ mount route:

- `/api/users` สำหรับ user API
- `/api/staff` สำหรับ staff API
- `/api/products` สำหรับ product API

เดิม `staff` และ `products` ถูก mount ใต้ `/users` ทำให้ path สับสน

### Response สำคัญ

ไม่มี token:

```json
{
  "success": false,
  "message": "Access denied. No token! please signIn again"
}
```

token ไม่ถูกต้องหรือหมดอายุ:

```json
{
  "success": false,
  "message": "Invalid or expired token. please signIn again"
}
```

เรียก user id ที่ไม่ใช่เจ้าของ token:

```json
{
  "success": false,
  "message": "You can only access your own user data"
}
```

### สรุป commit ที่แนะนำ

ยังไม่ได้สร้าง git commit ในรอบนี้ ตารางนี้คือการแบ่ง commit ที่แนะนำให้ทีมใช้ตอน commit งาน:

| Commit | Message ที่แนะนำ | ทำอะไร |
| --- | --- | --- |
| 1 | `Implement protected user account endpoints` | เพิ่ม route และ controller สำหรับ `GET`, `PATCH`, `DELETE /api/users/:id` |
| 2 | `Fix user auth middleware token handling` | แก้ middleware ให้รับ token จาก cookie และ Bearer token พร้อมตรวจ payload |
| 3 | `Fix server routing and error handling` | แก้ `cors`, error middleware, `Date`, และ route mount ของ users/staff/products |
| 4 | `Document fong user API work` | เพิ่มเอกสารสรุปงาน API สองภาษา |

### วิธีทดสอบเร็ว

ใช้ token ที่ได้จากระบบ login ของทีม แล้วเรียก:

```http
GET /api/users/<USER_ID>
Authorization: Bearer <TOKEN>
```

```http
PATCH /api/users/<USER_ID>
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "name": "New name"
}
```

```http
DELETE /api/users/<USER_ID>
Authorization: Bearer <TOKEN>
```

## English

### Overview

This work covers fong's protected User API scope from the Figma API plan:

- `GET /api/users/:id` - get the current user's profile
- `PATCH /api/users/:id` - update the current user's profile
- `DELETE /api/users/:id` - delete the current user's account

Note: `POST /register` and `POST /login` are intentionally not included in this scope.

### Request Flow

1. The client sends a request to `/api/users/:id`
2. The route runs the `authUser` middleware first
3. The middleware reads the token from the `accessToken` cookie or `Authorization: Bearer <token>` header
4. If the token is valid, the middleware stores the authenticated user id in `req.user._id`
5. The controller checks that the authenticated user owns the requested `:id`
6. If ownership is valid, the controller reads, updates, or deletes the MongoDB user document through the `User` model

### File Responsibilities

#### `src/roues/user.router/users.routes.js`

Defines the protected user routes:

- `GET /:id`
- `PATCH /:id`
- `DELETE /:id`

All routes use `authUser` before reaching the controller.

#### `src/roues/user.router/user.controller.js`

Contains the protected user business logic:

- `getUserById` validates id and ownership, then returns the user
- `updateUserById` validates id and ownership, then updates allowed fields only
- `deleteUserById` validates id and ownership, then deletes the account
- `isValidUserId` blocks invalid MongoDB ObjectId values
- `isOwner` prevents users from reading, editing, or deleting another account
- `sanitizeUser` removes password before returning user data

Allowed update fields:

- `name`
- `surname`
- `email`
- `password`
- `address`

#### `src/middelware/authUser.js`

Handles authentication:

- Reads token from `accessToken` cookie
- Reads token from `Authorization: Bearer <token>`
- Verifies token with `process.env.JWT_SECRETKEY`
- Supports token payload keys: `userId`, `id`, `_id`
- Returns `401` for missing, invalid, expired, or malformed tokens

#### `src/modules/users-model.js`

Fixes password hashing:

- Uses a normal `function ()` in the Mongoose `pre("save")` hook
- Keeps `this.isModified("password")` working correctly
- Re-hashes password when it is changed through `PATCH /:id`

#### `src/server.js`

Fixes server stability and safer error handling:

- Corrects the `cors` import
- Applies the existing `corsOption`
- Moves error middleware after routes
- Fixes `new Data()` to `new Date()`
- Hides stack traces from production responses

#### `src/roues/index.js`

Fixes route mounting:

- `/api/users` for user API
- `/api/staff` for staff API
- `/api/products` for product API

Previously, staff and products were mounted under `/users`, which made the API paths confusing.

### Suggested Commit Breakdown

No git commit was created in this work session. This table is the recommended commit split for the team:

| Commit | Suggested message | What it does |
| --- | --- | --- |
| 1 | `Implement protected user account endpoints` | Adds routes and controllers for `GET`, `PATCH`, `DELETE /api/users/:id` |
| 2 | `Fix user auth middleware token handling` | Allows cookie and Bearer tokens, validates token payload |
| 3 | `Fix server routing and error handling` | Fixes `cors`, error middleware order, `Date`, and users/staff/products route mounts |
| 4 | `Document fong user API work` | Adds this bilingual API summary document |

### Quick Test

Use the token generated by the team's login system:

```http
GET /api/users/<USER_ID>
Authorization: Bearer <TOKEN>
```

```http
PATCH /api/users/<USER_ID>
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "name": "New name"
}
```

```http
DELETE /api/users/<USER_ID>
Authorization: Bearer <TOKEN>
```
