import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// simple slugify from the CSV "name"
function memberSlugFromName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-') // spaces -> dashes
    .replace(/[^a-z0-9\-]/g, ''); // remove weird chars
}

// parse CLI args: supports
//   ts-node prisma/seed-from-csv.ts prisma/data/file.csv
//   ts-node prisma/seed-from-csv.ts --file prisma/data/file.csv
//   ts-node prisma/seed-from-csv.ts --slug family-slug
function parseArgs() {
  const args = process.argv.slice(2).filter(Boolean);

  // no args -> error
  if (args.length === 0) {
    throw new Error(
      'Usage:\n' +
        '  ts-node prisma/seed-from-csv.ts prisma/data/file.csv\n' +
        '  ts-node prisma/seed-from-csv.ts --file prisma/data/file.csv\n' +
        '  ts-node prisma/seed-from-csv.ts --slug family-slug'
    );
  }

  // positional: first arg not a flag -> treat as file
  if (!args[0].startsWith('-')) {
    return { fileArg: args[0] as string, slugArg: undefined as string | undefined };
  }

  let fileArg: string | undefined;
  let slugArg: string | undefined;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--file') {
      if (!args[i + 1] || args[i + 1].startsWith('--')) {
        throw new Error('Missing value after --file');
      }
      fileArg = args[i + 1];
      i++;
      continue;
    }

    if (arg === '--slug') {
      if (!args[i + 1] || args[i + 1].startsWith('--')) {
        throw new Error('Missing value after --slug');
      }
      slugArg = args[i + 1];
      i++;
      continue;
    }
  }

  if (!fileArg && !slugArg) {
    throw new Error(
      'Usage:\n' +
        '  ts-node prisma/seed-from-csv.ts prisma/data/file.csv\n' +
        '  ts-node prisma/seed-from-csv.ts --file prisma/data/file.csv\n' +
        '  ts-node prisma/seed-from-csv.ts --slug family-slug'
    );
  }

  return { fileArg, slugArg };
}

function resolveCsvPath(fileArg: string | undefined, slugArg: string | undefined): string {
  // direct file provided
  if (fileArg) {
    return path.resolve(process.cwd(), fileArg);
  }

  // search by slug inside prisma/data
  if (!slugArg) {
    throw new Error('Either fileArg or slugArg must be provided');
  }

  const dataDir = path.resolve(process.cwd(), 'prisma/data');
  if (!fs.existsSync(dataDir) || !fs.statSync(dataDir).isDirectory()) {
    throw new Error(`Data directory not found: ${dataDir}`);
  }

  const lowerSlug = slugArg.toLowerCase();

  const candidates = fs
    .readdirSync(dataDir)
    .filter((name) => {
      const lower = name.toLowerCase();
      return lower.endsWith('.csv') && lower.includes(lowerSlug);
    });

  if (candidates.length === 0) {
    throw new Error(
      `No CSV found in ${dataDir} matching slug "${slugArg}". ` +
        `Expected something like "${slugArg}.csv".`
    );
  }

  if (candidates.length > 1) {
    throw new Error(
      `Multiple CSV files match slug "${slugArg}" in ${dataDir}: ${candidates.join(
        ', '
      )}. Use --file <exact-path> instead.`
    );
  }

  const chosen = candidates[0];
  console.log(`Using CSV file: ${path.join('prisma/data', chosen)}`);

  return path.join(dataDir, chosen);
}

async function main() {
  const { fileArg, slugArg } = parseArgs();
  const filePath = resolveCsvPath(fileArg, slugArg);

  const raw = fs.readFileSync(filePath, 'utf-8').trimEnd();

  const lines = raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length < 3) {
    throw new Error('CSV must have at least 3 lines: slug, header, and one pairing');
  }

  // 1) First line = family slug
  const familySlug = lines[0];

  // Optional consistency check if user passed --slug
  if (slugArg && slugArg !== familySlug) {
    console.warn(
      `Warning: --slug "${slugArg}" does not match first line of CSV "${familySlug}". Using "${familySlug}" from file.`
    );
  }

  // 2) Second line = header
  const headerLine = lines[1];
  console.log(`Header: ${headerLine}`);

  // 3) Remaining lines = giver,receiver
  const pairLines = lines.slice(2);

  type Pair = { giverName: string; receiverName: string };
  const pairs: Pair[] = [];
  const nameSet = new Set<string>();

  for (const line of pairLines) {
    const parts = line.split(',').map((p) => p.trim());
    if (parts.length < 2) {
      console.warn(`Skipping invalid line (expected "giver,receiver"): "${line}"`);
      continue;
    }

    const [giverName, receiverName] = parts;

    if (!giverName || !receiverName) {
      console.warn(`Skipping line with empty names: "${line}"`);
      continue;
    }

    nameSet.add(giverName);
    nameSet.add(receiverName);
    pairs.push({ giverName, receiverName });
  }

  if (pairs.length === 0) {
    throw new Error('No valid giver/receiver pairs found in CSV');
  }

  console.log(`Family slug: ${familySlug}`);
  console.log(`Participants: ${Array.from(nameSet).join(', ')}`);
  console.log('Pairs:', pairs);

  // 4) Upsert FamilyGroup
  const family = await prisma.familyGroup.upsert({
    where: { slug: familySlug },
    update: {},
    create: {
      slug: familySlug,
      name: familySlug,
    },
  });

  console.log(`Using FamilyGroup id=${family.id}, slug=${family.slug}`);

  // 5) Ensure Members + Wishlists exist for each name in this family
  const nameToMemberId = new Map<string, string>();
  const slugToMember = new Map<string, { name: string; slug: string; id: string }>();

  for (const name of nameSet) {
    const slug = memberSlugFromName(name);

    // Unique on (familyGroupId, slug)
    let member = await prisma.member.findUnique({
      where: {
        familyGroupId_slug: {
          familyGroupId: family.id,
          slug,
        },
      },
    });

    if (!member) {
      member = await prisma.member.create({
        data: {
          name,
          slug,
          familyGroupId: family.id,
        },
      });
      console.log(`Created Member: ${name} (slug=${slug}) -> id=${member.id}`);
    } else {
      console.log(`Found existing Member: ${name} (slug=${slug}) -> id=${member.id}`);
    }

    // Ensure a wishlist row exists (empty by default)
    await prisma.wishlist.upsert({
      where: { memberId: member.id },
      update: {},
      create: {
        memberId: member.id,
        content: '',
      },
    });

    nameToMemberId.set(name, member.id);
    slugToMember.set(slug, { name, slug, id: member.id });
  }

  // 6) Clear existing assignments for this family (for repeatable tests)
  await prisma.assignment.deleteMany({
    where: { familyGroupId: family.id },
  });
  console.log(`Deleted existing assignments for family ${family.slug}`);

  // 7) Create assignments
  for (const { giverName, receiverName } of pairs) {
    const giverId = nameToMemberId.get(giverName);
    const receiverId = nameToMemberId.get(receiverName);

    if (!giverId || !receiverId) {
      console.warn(
        `Skipping assignment ${giverName} -> ${receiverName} (missing Member record)`,
      );
      continue;
    }

    await prisma.assignment.create({
      data: {
        familyGroupId: family.id,
        giverId,
        receiverId,
      },
    });

    console.log(
      `Created assignment: ${giverName} (id=${giverId}) -> ${receiverName} (id=${receiverId})`,
    );
  }

  // 8) Print shareable URLs for each member for local dev
  console.log('\nShareable links for this family (local dev):');
  for (const { name, slug } of slugToMember.values()) {
    const url = `http://localhost:3000/families/${family.slug}/${slug}`;
    console.log(`${name}: ${url}`);
  }

  console.log('\nSeeding from CSV complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
