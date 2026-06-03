import mongoose from "mongoose";
import { faker } from "@faker-js/faker";
import { connectDB } from "./config/mongoDB.js";

import { User } from "./modules/Model/users-model.js";
<<<<<<< HEAD
import { Staff as staff } from "./modules/Model/staff-model.js";
=======
import { staff } from "./modules/Model/staff-model.js";
>>>>>>> 7742c9b (fixrebase)
import { Shoe } from "./modules/Model/Shoe-model.js";
import { Orders } from "./modules/Model/Orders-model.js";
import { Brand } from "./modules/Model/Brand-model.js";
import { Products } from "./modules/Model/products-model.js";

// ── helpers ──────────────────────────────────────────────
const shoeColors = ["Black", "White", "Red", "Navy", "Grey", "Green"];
const shoeNames  = ["Air Max", "Ultra Boost", "Gel-Kayano", "React Infinity", "Fresh Foam", "Pegasus"];
const brandNames = ["Nike", "Adidas", "Asics", "New Balance", "Brooks", "Saucony"];

// ── seed functions ────────────────────────────────────────

async function seedUsers() {
  await User.deleteMany({});
  const users = Array.from({ length: 5 }, () => ({
    name:     faker.person.firstName(),
    surname:  faker.person.lastName(),
    email:    faker.internet.email().toLowerCase(),
    password: "password123",
    address:  faker.location.streetAddress({ useFullAddress: true }),
    userRank: faker.helpers.arrayElement(["bronze", "gold", "silver", "platinum", "Diamond"]),
  }));
  const created = await User.insertMany(users);
  console.log(`✅ Users:   ${created.length} documents`);
  return created;
}

async function seedStaff() {
  await staff.deleteMany({});
  const members = [
    // fixed admin account — use this to test admin-only APIs
    {
      name:    "Super",
      surname: "Admin",
      email:   "admin@kinetix.com",
      role:    "admin",
    },
    ...Array.from({ length: 4 }, () => ({
      name:    faker.person.firstName(),
      surname: faker.person.lastName(),
      email:   faker.internet.email().toLowerCase(),
      role:    "staff",
    })),
  ];
  const created = await staff.insertMany(members);
  console.log(`✅ Staff:   ${created.length} documents`);
  return created;
}

async function seedBrands() {
  await Brand.deleteMany({});
  const brands = brandNames.map((name) => ({ brandName: name, isActive: true }));
  const created = await Brand.insertMany(brands);
  console.log(`✅ Brands:  ${created.length} documents`);
  return created;
}

async function seedShoes() {
  await Shoe.deleteMany({});
  const shoes = Array.from({ length: 10 }, () => ({
    name:      faker.helpers.arrayElement(shoeNames),
    brand:     faker.helpers.arrayElement(brandNames),
    size:      faker.helpers.arrayElement([38, 39, 40, 41, 42, 43, 44, 45]),
    color:     faker.helpers.arrayElement(shoeColors),
    price:     faker.number.int({ min: 500, max: 5000 }),
    stock:     faker.number.int({ min: 0, max: 50 }),
    is_active: true,
  }));
  const created = await Shoe.insertMany(shoes);
  console.log(`✅ Shoes:   ${created.length} documents`);
  return created;
}

async function seedProducts(brands) {
  await Products.deleteMany({});
  const products = Array.from({ length: 6 }, () => ({
    modleName:   `${faker.helpers.arrayElement(shoeNames)} ${faker.number.int({ min: 1, max: 9 })}`,
    description: faker.commerce.productDescription(),
    brandId:     faker.helpers.arrayElement(brands)._id,
    gender:      faker.helpers.arrayElement(["men", "women", "unisex"]),
    category:    faker.helpers.arrayElement(["Road", "Trail", "Daily trainer"]),
    price: [{
      "1day": faker.number.int({ min: 100, max: 300 }),
      "3day": faker.number.int({ min: 250, max: 700 }),
      "7day": faker.number.int({ min: 500, max: 1500 }),
    }],
    variants: [{
      skuColorCode: faker.string.alphanumeric(6).toUpperCase(),
      colorName:    faker.helpers.arrayElement(shoeColors),
      images:       faker.image.url(),
      size: [
        { size: 42, stock: faker.number.int({ min: 0, max: 20 }) },
        { size: 43, stock: faker.number.int({ min: 0, max: 20 }) },
      ],
    }],
    isActive: true,
  }));
  const created = await Products.insertMany(products);
  console.log(`✅ Products: ${created.length} documents`);
  return created;
}

async function seedOrders(products) {
  await Orders.deleteMany({});
  const orders = Array.from({ length: 8 }, () => ({
    status:       faker.helpers.arrayElement(["successful", "Waiting", "Fail", "Done"]),
    ordered_at:   faker.date.recent({ days: 30 }),
    delivery_date: faker.date.soon({ days: 7 }),
    is_active:    true,
    item: {
      ProductId:      faker.helpers.arrayElement(products)._id,
      status:         "Waiting",
      sku_color_code: faker.string.alphanumeric(6).toUpperCase(),
      deposit_amount: faker.number.int({ min: 500, max: 3000 }),
      rental_plan: {
        "1day": 200,
        "3day": 500,
        "7day": 1000,
      },
    },
  }));
  const created = await Orders.insertMany(orders);
  console.log(`✅ Orders:  ${created.length} documents`);
  return created;
}

// ── main ──────────────────────────────────────────────────

async function seed() {
  await connectDB();
  console.log("\n🌱 Seeding database...\n");

  const brands   = await seedBrands();
  const products = await seedProducts(brands);
  await seedUsers();
  const staffDocs = await seedStaff();
  const shoes    = await seedShoes();
  const orders   = await seedOrders(products);

  // Print IDs for easy copy-paste into Postman
  console.log("\n─────────────────────────────────────────");
  console.log("📋 Copy these IDs into Postman:\n");
  console.log(`ADMIN staff _id : ${staffDocs[0]._id}  (role: admin)`);
  console.log(`shoe_id         : ${shoes[0]._id}`);
  console.log(`staff_id        : ${staffDocs[1]._id}  (role: staff)`);
  console.log(`order_id        : ${orders[0]._id}`);
  console.log("─────────────────────────────────────────\n");

  await mongoose.disconnect();
  console.log("✅ Done! Database disconnected.\n");
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
