# Fong User API Code Walkthrough

เอกสารนี้อธิบายโค้ดชุด `GET /api/users/:id`, `PATCH /api/users/:id`, `DELETE /api/users/:id` แบบเห็นภาพ เพื่อให้ไล่อ่านตามไฟล์ได้ง่าย

## 1. ภาพรวมใหญ่

API ชุดนี้มีหน้าที่ให้ user จัดการข้อมูล account ของตัวเองเท่านั้น

```text
Client / Frontend
      |
      v
Express Server
      |
      v
/api/users/:id
      |
      v
authUser middleware
      |
      v
user.controller.js
      |
      v
User model
      |
      v
MongoDB
```

สิ่งสำคัญคือ user ต้องมี token และ token นั้นต้องเป็นของ user id เดียวกับ `:id` ใน URL

ตัวอย่าง:

```text
GET /api/users/665012345678abcdef123456
Authorization: Bearer <TOKEN>
```

ถ้า token บอกว่า user id คือ `665012345678abcdef123456` จึงผ่าน
ถ้า token เป็นของ user คนอื่น ระบบจะตอบ `403`

## 2. Route เริ่มตรงไหน

ไฟล์: `src/roues/index.js`

```js
router.use("/users", usersRouter);
```

บรรทัดนี้แปลว่า route ทั้งหมดใน `users.routes.js` จะอยู่ใต้ path:

```text
/api/users
```

เพราะใน `server.js` มี:

```js
app.use("/api", apiRouter);
```

ดังนั้น path จริงจะเป็น:

```text
/api/users/:id
```

## 3. users.routes.js ทำอะไร

ไฟล์: `src/roues/user.router/users.routes.js`

```js
router.get("/:id", authUser, getUserById);
router.patch("/:id", authUser, updateUserById);
router.delete("/:id", authUser, deleteUserById);
```

ให้อ่านจากซ้ายไปขวา:

```text
request เข้า route
      |
      v
authUser ตรวจ token
      |
      v
controller ทำงานจริง
```

ตัวอย่าง `GET /api/users/:id`:

```text
GET /api/users/665...
      |
      v
authUser
      |
      v
getUserById
```

หมายเหตุ: งานนี้ไม่ทำ `POST /register` และ `POST /login`

## 4. authUser middleware ทำอะไร

ไฟล์: `src/middelware/authUser.js`

หน้าที่ของ middleware คือเช็กว่า request นี้มี token ที่ถูกต้องไหม

### 4.1 หา token จากที่ไหน

โค้ดรองรับ 2 แบบ:

```text
1. Cookie
   accessToken=<TOKEN>

2. Header
   Authorization: Bearer <TOKEN>
```

โค้ดส่วนนี้:

```js
const token = req.cookies?.accessToken || bearerToken;
```

แปลว่า:

- ถ้ามี cookie `accessToken` ให้ใช้ cookie
- ถ้าไม่มี cookie ให้ใช้ Bearer token จาก header

### 4.2 ถ้าไม่มี token

ระบบตอบ:

```json
{
  "success": false,
  "message": "Access denied. No token! please signIn again"
}
```

status code คือ `401`

### 4.3 ถ้ามี token

ระบบ verify token ด้วย:

```js
jwt.verify(token, process.env.JWT_SECRETKEY);
```

แปลว่า token ต้องถูกสร้างจาก secret เดียวกันกับ `JWT_SECRETKEY` ใน `.env`

หลัง verify แล้ว middleware จะหา user id จาก payload:

```js
const userId = decodeToken.userId || decodeToken.id || decodeToken._id;
```

รองรับหลายชื่อเพราะ login อาจจะสร้าง token เป็น:

```js
{ userId: "..." }
```

หรือ:

```js
{ id: "..." }
```

หรือ:

```js
{ _id: "..." }
```

ถ้าถูกต้อง จะเก็บไว้ใน request:

```js
req.user = { _id: userId };
```

แล้วส่งต่อไป controller ด้วย:

```js
next();
```

## 5. user.controller.js ทำอะไร

ไฟล์: `src/roues/user.router/user.controller.js`

ไฟล์นี้คือหัวใจของ API ฝั่ง fong

## 6. Helper functions ใน controller

### 6.1 sanitizeUser

```js
const sanitizeUser = (user) => {
  const userObject = user.toObject();
  delete userObject.password;
  return userObject;
};
```

หน้าที่:

- แปลง Mongoose document เป็น object ธรรมดา
- ลบ `password` ออกก่อนส่ง response

เหตุผล:

- ห้ามส่ง password กลับไปหา client
- ถึง password จะ hash แล้วก็ไม่ควรส่งออกไป

### 6.2 isOwner

```js
const isOwner = (req) => req.user?._id === req.params.id;
```

หน้าที่:

- เช็กว่า id จาก token ตรงกับ id ใน URL หรือไม่

ภาพ:

```text
token user id     = 665abc
URL /users/:id    = 665abc
ผลลัพธ์           = ผ่าน
```

```text
token user id     = 111aaa
URL /users/:id    = 665abc
ผลลัพธ์           = ไม่ผ่าน 403
```

### 6.3 isValidUserId

```js
const isValidUserId = (req, res) => {
  if (/^[0-9a-fA-F]{24}$/.test(req.params.id)) return true;

  res.status(400).json({
    success: false,
    message: "Invalid user id",
  });
  return false;
};
```

หน้าที่:

- เช็กว่า `:id` เป็น MongoDB ObjectId หรือไม่
- ObjectId ต้องเป็นตัวอักษร/ตัวเลขฐาน 16 ความยาว 24 ตัว

ตัวอย่างที่ผ่าน:

```text
665012345678abcdef123456
```

ตัวอย่างที่ไม่ผ่าน:

```text
abc
123
hello
```

ถ้าไม่เช็กตรงนี้ Mongoose อาจ throw error ยาว ๆ ออกมา

## 7. getUserById ทำงานยังไง

```js
export const getUserById = async (req, res, next) => {
```

Flow:

```text
GET /api/users/:id
      |
      v
เช็กว่า id ถูก format ไหม
      |
      v
เช็กว่าเป็นเจ้าของ account ไหม
      |
      v
หา user ใน MongoDB
      |
      v
ส่ง user กลับ
```

กรณีที่เป็นไปได้:

| กรณี | Response |
| --- | --- |
| id format ผิด | `400 Invalid user id` |
| token ไม่ใช่เจ้าของ id | `403 You can only access your own user data` |
| ไม่เจอ user | `404 User not found` |
| สำเร็จ | `200` พร้อมข้อมูล user |

## 8. updateUserById ทำงานยังไง

Flow:

```text
PATCH /api/users/:id
      |
      v
เช็ก id format
      |
      v
เช็ก owner
      |
      v
เลือกเฉพาะ field ที่อนุญาต
      |
      v
หา user
      |
      v
Object.assign(user, updates)
      |
      v
user.save()
      |
      v
ส่งข้อมูลใหม่กลับ
```

Field ที่แก้ได้:

```js
["name", "surname", "email", "password", "address"]
```

ถ้า request body ส่ง field อื่นมา เช่น `role`, `isAdmin`, `createdAt` จะไม่ถูกนำไป update

ตัวอย่าง body ที่ถูกต้อง:

```json
{
  "name": "Fong",
  "address": "Bangkok Thailand"
}
```

ถ้าแก้ password:

```json
{
  "password": "newpassword123"
}
```

ระบบจะ `user.save()` และ Mongoose hook ใน `users-model.js` จะ hash password ให้อัตโนมัติ

## 9. deleteUserById ทำงานยังไง

Flow:

```text
DELETE /api/users/:id
      |
      v
เช็ก id format
      |
      v
เช็ก owner
      |
      v
findByIdAndDelete
      |
      v
clearCookie("accessToken")
      |
      v
ตอบ Delete user success
```

เหตุผลที่ clear cookie:

- เมื่อลบ account แล้ว token เดิมไม่ควรค้างอยู่ใน browser

## 10. users-model.js เกี่ยวข้องยังไง

ไฟล์: `src/modules/users-model.js`

ส่วนสำคัญ:

```js
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});
```

แปลว่า:

- ก่อน save user
- ถ้า password ถูกแก้
- ให้ hash password ก่อนเก็บเข้า database

ต้องใช้ `function ()` ไม่ใช่ arrow function เพราะ Mongoose ต้องใช้ `this` เพื่อชี้ไปที่ document ปัจจุบัน

## 11. วิธีเช็กว่าโค้ดถูกต้อง

### 11.1 เช็ก syntax

ใช้คำสั่ง:

```bash
node --check src/server.js
```

หรือเช็กทุกไฟล์:

```powershell
Get-ChildItem -Recurse -Filter *.js | ForEach-Object { node --check $_.FullName }
```

ถ้าถูกต้อง คำสั่งจะไม่แสดง error

### 11.2 เช็กว่า route ไม่หลุด scope

ใช้คำสั่ง:

```bash
rg "register|login" src/roues/user.router/users.routes.js src/roues/user.router/user.controller.js
```

ถ้าไม่มีผลลัพธ์ แปลว่าไฟล์งาน fong ไม่มี `register/login` ปนอยู่

### 11.3 เช็กด้วย Postman หรือ Thunder Client

ต้องมีของ 3 อย่าง:

- server รันอยู่
- MongoDB เชื่อมได้ผ่าน `MONGODB_URI`
- token ที่สร้างด้วย `JWT_SECRETKEY` เดียวกับ backend

ตัวอย่าง request:

```http
GET http://localhost:5000/api/users/<USER_ID>
Authorization: Bearer <TOKEN>
```

```http
PATCH http://localhost:5000/api/users/<USER_ID>
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "name": "Fong"
}
```

```http
DELETE http://localhost:5000/api/users/<USER_ID>
Authorization: Bearer <TOKEN>
```

## 12. เช็กลิสต์ผลลัพธ์ที่ควรได้

| สิ่งที่ลอง | ผลที่ควรได้ |
| --- | --- |
| ไม่ส่ง token | `401` |
| ส่ง token ผิด | `401` |
| ส่ง id format ผิด | `400` |
| token เป็นของ user คนอื่น | `403` |
| id ถูก แต่ไม่มี user ใน DB | `404` |
| id ถูก token ถูก และมี user | `200` |
| PATCH field ที่อนุญาต | `200` และข้อมูลเปลี่ยน |
| PATCH field ที่ไม่อนุญาตอย่างเดียว | `400 No valid fields to update` |
| DELETE สำเร็จ | `200 Delete user success` |

## 13. จำสั้น ๆ

```text
routes = บอกว่า URL ไหนเรียก controller ตัวไหน
middleware = ยามตรวจ token
controller = logic หลักของ API
model = โครงสร้างข้อมูลและ hook ก่อน save
MongoDB = ที่เก็บข้อมูลจริง
```
