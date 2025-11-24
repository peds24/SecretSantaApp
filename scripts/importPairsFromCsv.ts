// scripts/importPairsFromCsv.ts
import { prisma } from "../lib/db.js";
import { randomUUID } from "crypto";
import fs from "fs";
import path from "path";

type PairRow = {
  giver: string;
  receiver: string;
};

function parseCsv(filePath: string): PairRow[] {
  const absPath = path.resolve(filePath);
  const raw = fs.readFileSync(absPath, "utf8");

  const lines = raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length < 2) {
    throw new Error("CSV seems empty or missing data rows.");
  }

  const header = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const giverIndex = header.indexOf("giver");
  let receiverIndex = header.indexOf("receiver");

  // Optional: also accept common misspelling "reciever"
  if (receiverIndex === -1) {
    receiverIndex = header.indexOf("reciever");
  }

  if (giverIndex === -1 || receiverIndex === -1) {
    throw new Error('CSV must have headers "giver" and "receiver"/"reciever".');
  }

  const rows: PairRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",").map((c) => c.trim());
    if (cols.length <= Math.max(giverIndex, receiverIndex)) continue;

    const giver = cols[giverIndex];
    const receiver = cols[receiverIndex];

    if (!giver || !receiver) continue;

    rows.push({ giver, receiver });
  }

  return rows;
}

async function main() {
  const csvPath = process.argv[2] || "data/pairs.csv";

  console.log(`Reading pairs from: ${csvPath}`);
  const rows = parseCsv(csvPath);

  if (rows.length === 0) {
    throw new Error("No valid rows found in CSV.");
  }

  // Build a stable ID mapping for every distinct name
  const nameToId = new Map<string, number>();
  let nextId = 1;

  function getId(name: string): number {
    if (!nameToId.has(name)) {
      nameToId.set(name, nextId++);
    }
    return nameToId.get(name)!;
  }

  // Pre-assign IDs for all names
  for (const row of rows) {
    getId(row.giver);
    getId(row.receiver);
  }

  console.log("Name → ID mapping:");
  for (const [name, id] of nameToId.entries()) {
    console.log(`  ${id} : ${name}`);
  }

  console.log("Clearing existing pairs, tokens and wishlists...");
  await prisma.authToken.deleteMany({});
  await prisma.wishlist.deleteMany({});
  await prisma.pair.deleteMany({});

  console.log("Inserting new pairs, tokens, and empty wishlists...");

  // Track which IDs we've already created wishlists for
  const createdWishlistFor = new Set<number>();

  // Track token per giver so we can generate link files
  const tokenMap = new Map<number, string>();

  for (const row of rows) {
    const giverId = getId(row.giver);
    const receiverId = getId(row.receiver);

    const token = randomUUID();

    // Create Pair
    await prisma.pair.create({
      data: {
        giverId,
        giverName: row.giver,
        receiverId,
        receiverName: row.receiver,
      },
    });

    // Create AuthToken for the giver
    await prisma.authToken.create({
      data: {
        token,
        giverId,
      },
    });

    tokenMap.set(giverId, token);

    // Create empty wishlist for this giver if not already
    if (!createdWishlistFor.has(giverId)) {
      await prisma.wishlist.create({
        data: {
          receiverId: giverId,
          wishlist: "",
        },
      });
      createdWishlistFor.add(giverId);
    }

    console.log(`${row.giver} → ${row.receiver} | token: ${token}`);
  }

  // Generate link files for distribution
  const baseUrl = process.env.BASE_URL ?? "http://localhost:3000";

  const txtLines: string[] = [];
  const csvLines: string[] = ["name,link"];

  for (const [name, id] of nameToId.entries()) {
    const token = tokenMap.get(id);
    if (!token) continue;

    const link = `${baseUrl}/?token=${token}`;
    txtLines.push(`${name}: ${link}`);
    csvLines.push(`${name},${link}`);
  }

  fs.writeFileSync("generated_links.txt", txtLines.join("\n"), "utf8");
  fs.writeFileSync("generated_links.csv", csvLines.join("\n"), "utf8");

  console.log("Import complete.");
  console.log("Links written to generated_links.txt and generated_links.csv");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
