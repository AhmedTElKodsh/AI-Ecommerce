// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import { hash } from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting database seed...");

  // Create admin user
  const adminPassword = await hash("admin123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      name: "Admin User",
      password: adminPassword,
      role: "ADMIN",
    },
  });
  console.log("Admin user created:", admin.email);

  // Create regular user
  const userPassword = await hash("user123", 10);
  const user = await prisma.user.upsert({
    where: { email: "user@example.com" },
    update: {},
    create: {
      email: "user@example.com",
      name: "Regular User",
      password: userPassword,
      role: "USER",
    },
  });
  console.log("Regular user created:", user.email);

  // Create categories - removing custom IDs
  const categoryData = [
    {
      name: "Electronics",
      description: "Electronic devices and gadgets",
      image:
        "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800",
    },
    {
      name: "Clothing",
      description: "Apparel and fashion items",
      image:
        "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800",
    },
    {
      name: "Home Goods",
      description: "Items for your home",
      image:
        "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800",
    },
  ];

  // Create categories and store the created categories with their IDs
  const categoryMap = new Map();

  for (const category of categoryData) {
    // Find or create the category by name
    const createdCategory = await prisma.category.upsert({
      where: { name: category.name },
      update: {
        description: category.description,
        image: category.image,
      },
      create: {
        name: category.name,
        description: category.description,
        image: category.image,
      },
    });

    // Store the created category ID with its name as the key
    categoryMap.set(category.name, createdCategory.id);
    console.log(
      `Category created/updated: ${category.name} with ID: ${createdCategory.id}`
    );
  }

  // Create products with proper category references
  const products = [
    {
      name: "Smartphone X",
      description:
        "The latest smartphone with advanced features and a stunning display.",
      price: 999.99,
      stock: 50,
      images: [
        "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800",
        "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=800",
      ],
      categoryName: "Electronics", // Changed from categoryId to categoryName
    },
    {
      name: "Laptop Pro",
      description: "Powerful laptop for professionals and creatives.",
      price: 1499.99,
      stock: 30,
      images: [
        "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800",
      ],
      categoryName: "Electronics",
    },
    {
      name: "Wireless Headphones",
      description: "Premium sound quality with noise cancellation.",
      price: 199.99,
      stock: 100,
      images: [
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800",
      ],
      categoryName: "Electronics",
    },
    {
      name: "Men's T-Shirt",
      description: "Comfortable cotton t-shirt for everyday wear.",
      price: 24.99,
      stock: 200,
      images: [
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800",
      ],
      categoryName: "Clothing",
    },
    {
      name: "Women's Jeans",
      description: "Classic fit jeans with stretch for comfort.",
      price: 49.99,
      stock: 150,
      images: [
        "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800",
      ],
      categoryName: "Clothing",
    },
    {
      name: "Running Shoes",
      description: "Lightweight and supportive shoes for runners.",
      price: 89.99,
      stock: 75,
      images: [
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800",
      ],
      categoryName: "Clothing",
    },
    {
      name: "Coffee Table",
      description: "Modern coffee table with storage space.",
      price: 149.99,
      stock: 25,
      images: [
        "https://images.unsplash.com/photo-1532372576444-dda954194ad0?w=800",
      ],
      categoryName: "Home Goods",
    },
    {
      name: "Bedding Set",
      description:
        "Soft and comfortable bedding set with duvet cover and pillowcases.",
      price: 79.99,
      stock: 40,
      images: [
        "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800",
      ],
      categoryName: "Home Goods",
    },
  ];

  // Create products with reference to actual category IDs
  for (const product of products) {
    const { categoryName, ...productData } = product;
    const categoryId = categoryMap.get(categoryName);

    if (!categoryId) {
      console.log(`Category not found for ${product.name}, skipping`);
      continue;
    }

    // Check if product exists
    const existingProduct = await prisma.product.findFirst({
      where: { name: product.name },
    });

    if (existingProduct) {
      // Update existing product
      await prisma.product.update({
        where: { id: existingProduct.id },
        data: {
          ...productData,
          categoryId,
        },
      });
      console.log("Product updated:", product.name);
    } else {
      // Create new product
      await prisma.product.create({
        data: {
          ...productData,
          categoryId,
        },
      });
      console.log("Product created:", product.name);
    }
  }

  console.log("Database seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error during database seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
