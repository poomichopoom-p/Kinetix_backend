import mongoose from "mongoose";
import { faker } from "@faker-js/faker";
import { connectDB } from "./config/mongoDB.js";

import { User } from "./modules/Model/users-model.js";
import { Products } from "./modules/Model/products-model.js";
import { Brand } from "./modules/Model/Brand-model.js";
import { Orders } from "./modules/Model/Orders-model.js";

const shoeColors = ["Black", "White", "Red", "Navy", "Grey", "Green"];
const shoeNames = ["Air Max", "Ultra Boost", "Gel-Kayano", "React Infinity", "Fresh Foam", "Pegasus"];
const brandNames = ["Nike", "Adidas", "Asics", "Hoka", "New Balance", "On Running"];

async function seedDashboard() {
  await connectDB();
  console.log("\n🌱 Seeding Dashboard Data...\n");

  // 1. Clear existing specific test data (optional, but good for clean state)
  // await User.deleteMany({ email: "testuser@kinetix.com" });

  // 2. Create Brands
  console.log("Creating Brands...");
  await Brand.deleteMany({});
  const brands = await Brand.insertMany(
    brandNames.map(name => ({ brandName: name, isActive: true }))
  );

  // 3. Create Products
  console.log("Creating Products...");
  await Products.deleteMany({});
  const productsData = Array.from({ length: 10 }, () => {
    const brand = faker.helpers.arrayElement(brands);
    return {
      modelName: `${faker.helpers.arrayElement(shoeNames)} ${faker.number.int({ min: 1, max: 99 })}`,
      description: faker.commerce.productDescription(),
      brandId: brand._id,
      gender: faker.helpers.arrayElement(["men", "women", "unisex"]),
      category: faker.helpers.arrayElement(["Road", "Trail", "Daily trainer"]),
      rentalPlan: [{ "1day": 150, "3day": 400, "7day": 800 }],
      variants: [{
        skuColorCode: faker.string.alphanumeric(6).toUpperCase(),
        colorName: faker.helpers.arrayElement(shoeColors),
        images: ["https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&q=80&w=400&h=400"],
        size: [
          { size: 42, stock: 10 },
          { size: 43, stock: 10 }
        ]
      }],
      isActive: true
    };
  });
  const products = await Products.insertMany(productsData);

  // 4. Create a specific Test User
  console.log("Creating Test User...");
  let testUser = await User.findOne({ email: "testuser@kinetix.com" });
  if (testUser) {
    testUser.name = "Somchai";
    testUser.surname = "Runner";
    testUser.password = "password123";
    testUser.address = "123 Sukhumvit Rd, Bangkok, Thailand";
    testUser.userRank = "gold";
    testUser.points = 2340;
    await testUser.save();
  } else {
    testUser = new User({
      name: "Somchai",
      surname: "Runner",
      email: "testuser@kinetix.com",
      password: "password123",
      address: "123 Sukhumvit Rd, Bangkok, Thailand",
      userRank: "gold",
      points: 2340,
      role: "user"
    });
    await testUser.save();
  }

  // 5. Create Orders for the Test User
  console.log("Creating Orders for Test User...");
  await Orders.deleteMany({ customerId: testUser._id });

  // Active Rentals
  const activeOrders = Array.from({ length: 2 }, () => ({
    customerId: testUser._id,
    status: "successful",
    shippingStatus: "delivered",
    ordered_at: faker.date.recent({ days: 3 }),
    delivery_date: faker.date.soon({ days: 4 }),
    item: {
      ProductId: faker.helpers.arrayElement(products)._id,
      status: "successful",
      sku_color_code: "COLOR123",
      deposit_amount: 150,
      rental_plan: { "1day": 150, "3day": 400, "7day": 800 }
    }
  }));

  // Historical Rentals
  const historyOrders = Array.from({ length: 5 }, () => ({
    customerId: testUser._id,
    status: "Done",
    shippingStatus: "successful",
    ordered_at: faker.date.past({ years: 1 }),
    delivery_date: faker.date.past({ years: 1 }),
    item: {
      ProductId: faker.helpers.arrayElement(products)._id,
      status: "Done",
      sku_color_code: "HIST456",
      deposit_amount: 800,
      rental_plan: { "1day": 150, "3day": 400, "7day": 800 }
    }
  }));

  await Orders.insertMany([...activeOrders, ...historyOrders]);

  console.log("\n✅ Dashboard Data Seeded Successfully!");
  console.log("─────────────────────────────────────────");
  console.log("Email    : testuser@kinetix.com");
  console.log("Password : password123");
  console.log("─────────────────────────────────────────\n");

  await mongoose.disconnect();
}

seedDashboard().catch(err => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
