# Secret Santa Web Application

A lightweight Secret Santa website with family groups, participant-specific URLs, editable wishlists, and automated database seeding from CSV files.

---

## Features

### Family Groups
- Each CSV file defines a Secret Santa family group.
- First line of the CSV is the **family slug**, which becomes the URL segment (e.g., `smith-2025`).
- Each family gets its own page under:
  ```
  /families/[familySlug]
  ```

### Participant Pages (Auth by URL)
- Each participant receives their own URL of the form:
  ```
  /families/[familySlug]/[memberSlug]
  ```
- No email/password required.
- Accessing your URL shows:
  - Who you are.
  - Who you are Secret Santa for.
  - Your wishlist (editable).
  - Your receiver's wishlist.

### Wishlists
- Stored in the database.
- Editable via a client-side component (`EditableWishlist`).
- Updated through a Next.js API route.
- Automatically created empty for each participant when seeding.

### CSV-Based Seeding
- Place CSV files inside `prisma/data/`.
- Seed script accepts:
  ```bash
  ts-node prisma/seed-from-csv.ts prisma/data/file.csv
  ts-node prisma/seed-from-csv.ts --file prisma/data/file.csv
  ts-node prisma/seed-from-csv.ts --slug family-slug
  ```
- The script:
  - Creates/updates `FamilyGroup`
  - Creates members & slugs
  - Generates empty wishlists
  - Creates Secret Santa assignments
  - Prints participant URLs for easy sharing

---

## Project Structure

```
app/
  families/
    [slug]/
      [memberSlug]/page.tsx
components/
  EditableWishlist.tsx
prisma/
  schema.prisma
  seed-from-csv.ts
  data/*.csv
lib/
  prisma.ts
```

---

## Local Development

### 1. Install dependencies
```bash
npm install
```

### 2. Set up environment variables
Create `.env`:
```
DATABASE_URL="postgres://user:password@host:port/db"
```

### 3. Create database schema
```bash
npx prisma db push --force-reset
```

### 4. Seed data
```bash
npx ts-node prisma/seed-from-csv.ts --file prisma/data/serdio-2025.csv
```

### 5. Start the dev server
```bash
npm run dev
```
Visit:
```
http://localhost:3000/families/<slug>/<memberSlug>
```

---

## Deployment

### Recommended Hosting
- **Vercel** for frontend (Next.js 16).
- **Neon / Supabase / Railway** for Postgres.

### Steps
1. Push repo to GitHub.
2. Create a project in Vercel.
3. Add environment variable:
   ```
   DATABASE_URL
   ```
4. Deploy.
5. Run seed script pointing at production DB if needed.

---

## CSV Format
```
family-slug
giver,receiver
name1,name2
ame2,name3
...
```
Example:
```
serdio-2025
giver,receiver
pedro,lala
lala,eva
eva,pedro
```

---

## Wishlist API Route
POST:
```
/api/families/[slug]/[memberSlug]/wishlist
```
Payload:
```json
{
  "content": "My wishlist text..."
}
```
Updates or creates the wishlist entry.

---

## Future Enhancements
- Styling and layout improvements
- Authentication via private links
- Admin interface for managing families
- Optional email notifications

---

## License
MIT

