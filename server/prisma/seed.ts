import { PrismaClient } from "../generated/client/index";
import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "argon2";

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
  }),
});

async function main() {
  console.log("Seeding database...");

  await prisma.note.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await hash("password123");

  const alice = await prisma.user.create({
    data: {
      email: "alice@example.com",
      name: "Alice Johnson",
      passwordHash,
    },
  });

  const bob = await prisma.user.create({
    data: {
      email: "bob@example.com",
      name: "Bob Williams",
      passwordHash,
    },
  });

  await prisma.note.createMany({
    data: [
      {
        title: "Grocery List",
        content: "Milk, eggs, bread, butter, apples, chicken breast, rice, olive oil.",
        userId: alice.id,
      },
      {
        title: "Workout Plan",
        content:
          "Monday: Chest & Triceps\nTuesday: Back & Biceps\nWednesday: Rest\nThursday: Shoulders & Abs\nFriday: Legs\nSaturday: Cardio\nSunday: Rest.",
        summary:
          "A weekly workout schedule splitting muscle groups across 5 training days with 2 rest days for recovery.",
        userId: alice.id,
      },
      {
        title: "Project Ideas",
        content:
          "1. A habit tracker with streak visualization.\n2. An AI-powered recipe generator based on fridge contents.\n3. A collaborative whiteboard for remote teams.\n4. A personal finance dashboard with spending insights.",
        userId: alice.id,
      },
      {
        title: "Books to Read",
        content:
          "- Deep Work by Cal Newport\n- Atomic Habits by James Clear\n- The Pragmatic Programmer\n- Designing Data-Intensive Applications\n- Clean Code by Robert C. Martin",
        summary:
          "A curated reading list of productivity and software engineering books covering focus, habits, programming practices, and system design.",
        userId: alice.id,
      },
      {
        title: "Meeting Notes – Sprint Planning",
        content:
          "Sprint goal: Complete user profile page.\nTasks: API endpoint for avatar upload (John), frontend form (Sarah), unit tests (Mike).\nBlockers: CDN caching issue, John will investigate.\nNext retro: Friday 4 PM.",
        summary:
          "Sprint planning for user profile page with assigned tasks for avatar upload API, frontend form, and unit tests. CDN caching is an active blocker.",
        userId: bob.id,
      },
      {
        title: "Conference Talk Draft",
        content:
          "Title: Building Resilient Backends\nKey points:\n- Graceful degradation over perfect uptime\n- Circuit breakers and retry strategies\n- Observability: logs, metrics, traces\n- Real-world incident stories\nDuration: 30 mins.",
        userId: bob.id,
      },
      {
        title: "Weekend Trip Packing",
        content:
          "Clothes: 2 t-shirts, jeans, jacket, sneakers.\nToiletries: toothbrush, toothpaste, deodorant.\nElectronics: phone charger, power bank, headphones.\nMisc: water bottle, snacks, book.",
        userId: bob.id,
      },
    ],
  });

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
