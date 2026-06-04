# API Manual Test Guide

## เป้าหมาย

ใช้คู่มือนี้สำหรับทดลองยิง API เองจากไฟล์ HTTP โดยไม่ต้องเขียนโค้ดเพิ่ม

ไฟล์ที่ใช้:

- `tests/http/delivery.http`: สำหรับ delivery/job flow หลัก
- `tests/http/all-api.http`: สำหรับยิงทุก route ที่ mount จริงใน backend

## สิ่งที่ต้องมี

- เปิดโปรเจกต์ที่โฟลเดอร์ `Kinetix_backend`
- มีไฟล์ `.env` พร้อมค่า MongoDB/JWT
- ติดตั้ง VS Code extension ชื่อ `REST Client`

## วิธีรัน Server

เปิด Terminal ที่โฟลเดอร์ `Kinetix_backend` แล้วรัน:

```bash
npm run dev
```

ถ้ารันสำเร็จควรเห็นประมาณนี้:

```text
Connected Data base !!
Server is running on Port: 5000 !!
```

ตรวจ health check ได้ที่:

```text
http://localhost:5000/
```

ผลที่ควรได้:

```text
Welcome to Kinetix
```

## วิธีกดยิง API ใน VS Code

1. เปิดไฟล์ `tests/http/delivery.http` หรือ `tests/http/all-api.http`
2. มองหาปุ่ม `Send Request` ที่อยู่เหนือ request แต่ละอัน
3. กด `Send Request`
4. ดู response ที่แถบขวาหรือแท็บ response ของ REST Client

## ลำดับการเทส Delivery API

1. ยิง `Register ADMIN`
2. ยิง `Register DRIVER`
3. ยิง `Register USER`
4. ยิง `Login ADMIN`
5. copy ค่า `token` จาก response ไปใส่ `@adminToken` ด้านบนไฟล์
6. ยิง `Login DRIVER`
7. copy ค่า `token` จาก response ไปใส่ `@driverToken`
8. ยิง `Login USER`
9. copy ค่า `token` จาก response ไปใส่ `@userToken`
10. ยิง `Get My Profile` เพื่อเช็คว่า token ใช้งานได้

## วิธีเทสทุกเส้น

ใช้ไฟล์ `tests/http/all-api.http`

ลำดับที่แนะนำ:

1. รัน `Health check`
2. รันกลุ่ม `Legacy Users` เพื่อ register/login และให้ REST Client เก็บ cookie
3. copy user `_id` จาก response ไปใส่ `@legacyUserId`
4. รันกลุ่ม `Legacy Staff`
5. รันกลุ่ม `Products and Shoes`
6. รันกลุ่ม `Legacy Orders`
7. รันกลุ่ม `Delivery Auth` แล้ว copy token ไปใส่ `@adminToken`, `@driverToken`, `@userToken`
8. รันกลุ่ม `Jobs - Common Query and Notifications`
9. รัน flow งานทีละชุด และ copy `_id` ไปใส่ตัวแปรของ flow นั้น:
   - `@deliveryJobId`
   - `@returnJobId`
   - `@rejectJobId`
   - `@customerRejectJobId`
   - `@cancelJobId`

หมายเหตุ:

- บาง request ต้องใส่ id จริงก่อน เช่น `@shoeId`, `@legacyStaffId`, `@legacyOrderId`
- `POST /api/order/create-order` ตอนนี้คาดหวัง `501` เมื่อ auth ผ่าน เพราะยังไม่ implement
- `GET /api/products/{{categoryName}}` ตั้งใจไว้เช็ค legacy ambiguous path และอาจได้ `400`
- upload proof ต้องมีไฟล์จริงก่อน ถ้าไม่มีไฟล์ให้ใช้เคส no-file เพื่อคาดหวัง `400`

## วิธีสร้าง Job และเทส Flow

1. ยิง request `สร้าง Job (USER)`
2. copy ค่า `_id` จาก response ไปใส่ `@jobId` ด้านบนไฟล์
3. ยิง flow ตามลำดับ:
   - `admin-confirm`
   - `driver-confirm`
   - `pickup`
   - `in-transit`
   - `complete`

ห้ามข้าม step ถ้าเป็น flow ปกติ เพราะ API มี state machine guard และอาจได้ `409`

## วิธีเทส Error Cases

ใช้ section `ERROR CASES` ใน `delivery.http`

ควรได้ผลประมาณนี้:

- ไม่มี token: `401`
- role ผิด: `403`
- id format ผิด: `400`
- transition ผิดลำดับ: `409`

## วิธีเทสด้วย curl ถ้าไม่ใช้ REST Client

ตัวอย่าง login:

```bash
curl -X POST http://localhost:5000/api/delivery-auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"admin@test.com\",\"password\":\"123456\"}"
```

ตัวอย่างยิง endpoint ที่ต้องใช้ token:

```bash
curl http://localhost:5000/api/jobs ^
  -H "Authorization: Bearer PASTE_TOKEN_HERE"
```

## Checklist ก่อนส่งผลเทส

- Server รันอยู่ที่ `localhost:5000`
- Login แล้วได้ token
- ใส่ token ในตัวแปรด้านบนของ `delivery.http`
- สร้าง job แล้ว copy `_id` ไปใส่ `@jobId`
- ยิง flow ตามลำดับ
- บันทึก status code และ response สำคัญลงรายงานถ้าพบ bug

## Troubleshooting

- ได้ `401`: token ว่าง ผิด หรือหมดอายุ ให้ login ใหม่
- ได้ `403`: role ไม่ตรงกับ endpoint
- ได้ `409`: ยิง state transition ผิดลำดับ หรือ job อยู่ final state แล้ว
- ได้ `500`: ดู terminal ที่รัน server แล้วแนบ log ให้ทีม backend
- กด `Send Request` ไม่ขึ้น: ตรวจว่าติดตั้ง VS Code REST Client แล้ว
