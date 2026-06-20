import { PrismaClient, Role, Visibility } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

let PASSWORD_HASH: string;

const USERS = [
  { email: "alice@example.com", name: "Alice Carter" },
  { email: "bob@example.com", name: "Bob Nguyen" },
  { email: "carol@example.com", name: "Carol Smith" },
  { email: "dan@example.com", name: "Dan Kowalski" },
];

const GROCERY_ITEMS = [
  "Whole milk", "Sourdough bread", "Free-range eggs", "Greek yoghurt", "Cheddar cheese",
  "Unsalted butter", "Olive oil", "Garlic", "Brown onions", "Cherry tomatoes",
  "Baby spinach", "Rocket leaves", "Avocados", "Lemons", "Limes",
  "Chicken thighs", "Salmon fillets", "Minced beef", "Bacon rashers", "Halloumi",
  "Penne pasta", "Basmati rice", "Quinoa", "Chickpeas (tin)", "Black beans (tin)",
  "Vegetable stock", "Coconut milk", "Soy sauce", "Sriracha", "Dijon mustard",
  "Honey", "Maple syrup", "Dark chocolate", "Rolled oats", "Almonds",
  "Frozen peas", "Frozen corn", "Broccoli", "Sweet potatoes", "Carrots",
  "Bell peppers", "Cucumber", "Celery", "Fresh basil", "Fresh coriander",
  "Sea salt", "Black pepper", "Cumin", "Paprika", "Turmeric",
  "Sparkling water", "Orange juice", "Oat milk", "Green tea bags", "Coffee beans",
  "Toilet paper", "Dish soap", "Laundry detergent", "Hand soap", "Sponges",
];

const WISHLIST_ITEMS = [
  "Sony WH-1000XM5 headphones", "Kindle Paperwhite", "Lego Technic F1 car",
  "De'Longhi espresso machine", "Dyson V15 vacuum", "iPad Pro 13\"",
  "Instant Pot Duo 7-in-1", "KitchenAid stand mixer", "Weber charcoal grill",
  "Patagonia down jacket", "Allbirds Wool Runners", "Merino wool blanket",
  "Ember temperature mug", "Fellow Stagg kettle", "Aesop hand cream set",
  "Le Creuset dutch oven", "Vitamix blender", "Theragun massage gun",
  "Nintendo Switch OLED", "Bose QuietComfort earbuds", "Moleskine notebook set",
  "LAMY Safari fountain pen", "Polaroid camera", "Fujifilm Instax film pack",
  "Salt lamp", "Himalayan bath salts", "Aromatherapy diffuser",
  "Weighted blanket", "Silk pillowcase", "Cashmere socks",
];

const OFFICE_ITEMS = [
  "Printer ink cartridges", "A4 paper reams (5)", "Sticky notes (pack)",
  "Whiteboard markers", "Highlighters set", "Ballpoint pens (box)",
  "Stapler + staples", "Scissors", "Tape dispenser", "Binder clips (assorted)",
  "Manila folders", "Ring binders", "Printer paper (colour)", "Envelopes (C5)",
  "Rubber bands", "Correction fluid", "Ruler 30cm", "Calculator",
  "Desk calendar refill", "Label maker tape",
];

const PARTY_ITEMS = [
  "Balloons (50 pack)", "Streamers", "Party hats", "Paper plates (50)",
  "Plastic cups (100)", "Napkins", "Tablecloth", "Candles", "Birthday banner",
  "Confetti", "Noise makers", "Piñata", "Piñata filler sweets",
  "Cake mix", "Icing sugar", "Food colouring", "Sprinkles",
  "Prosecco (6 bottles)", "Beer (24 pack)", "Sparkling grape juice",
  "Crisps (3 bags)", "Dip selection", "Cheese platter ingredients",
  "Mini sausage rolls", "Pizza rolls", "Brownie mix", "Ice cream tubs (3)",
];

function pick<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function main() {
  PASSWORD_HASH = await bcrypt.hash("password123", 10);
  console.log("Seeding database...");

  await prisma.item.deleteMany();
  await prisma.invite.deleteMany();
  await prisma.listMember.deleteMany();
  await prisma.list.deleteMany();
  await prisma.emailVerificationToken.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const users = await Promise.all(
    USERS.map((u) =>
      prisma.user.create({
        data: { ...u, password: PASSWORD_HASH, emailVerified: true },
      })
    )
  );

  const [alice, bob, carol, dan] = users;
  console.log(`Created ${users.length} users`);

  // Helper: create a list owned by a user, with optional extra members
  async function createList(
    owner: typeof alice,
    name: string,
    visibility: Visibility,
    items: string[],
    members: { user: typeof alice; role: Role }[] = []
  ) {
    const list = await prisma.list.create({
      data: {
        name,
        visibility,
        members: {
          create: [
            { userId: owner.id, role: Role.OWNER },
            ...members.map((m) => ({ userId: m.user.id, role: m.role })),
          ],
        },
      },
    });

    await prisma.item.createMany({
      data: items.map((itemName, i) => ({
        listId: list.id,
        name: itemName,
        quantity: rand(1, 4),
        checked: i % 5 === 0,
        url:
          i % 7 === 0
            ? `https://example.com/product/${itemName.toLowerCase().replace(/\s+/g, "-")}`
            : null,
      })),
    });

    return list;
  }

  // Alice's lists
  const aliceGrocery = await createList(
    alice,
    "Weekly grocery run",
    Visibility.PRIVATE,
    pick(GROCERY_ITEMS, 48),
    [{ user: bob, role: Role.MEMBER }]
  );

  const aliceWishlist = await createList(
    alice,
    "My 2026 wishlist ✨",
    Visibility.PUBLIC,
    pick(WISHLIST_ITEMS, 28)
  );

  await createList(
    alice,
    "Office supplies Q3",
    Visibility.PRIVATE,
    OFFICE_ITEMS
  );

  // Bob's lists
  const bobParty = await createList(
    bob,
    "Summer BBQ party 🎉",
    Visibility.PRIVATE,
    PARTY_ITEMS,
    [
      { user: alice, role: Role.MEMBER },
      { user: carol, role: Role.VIEWER },
    ]
  );

  await createList(
    bob,
    "Bob's grocery list",
    Visibility.PRIVATE,
    pick(GROCERY_ITEMS, 22)
  );

  // Carol's lists
  await createList(
    carol,
    "Carol's wishlist",
    Visibility.PUBLIC,
    pick(WISHLIST_ITEMS, 15)
  );

  const carolShared = await createList(
    carol,
    "Shared house shopping",
    Visibility.PRIVATE,
    pick(GROCERY_ITEMS, 35),
    [
      { user: dan, role: Role.MEMBER },
      { user: bob, role: Role.VIEWER },
    ]
  );

  // Dan's lists
  await createList(
    dan,
    "Dan's very long grocery list with absolutely everything in it",
    Visibility.PRIVATE,
    GROCERY_ITEMS // all 60
  );

  await createList(
    dan,
    "Birthday gifts for Carol 🎂",
    Visibility.PRIVATE,
    pick(WISHLIST_ITEMS, 10)
  );

  // Pending invites so the invites screen has content
  await prisma.invite.createMany({
    data: [
      {
        listId: aliceWishlist.id,
        inviterId: alice.id,
        inviteeId: carol.id,
        role: Role.VIEWER,
        status: "PENDING",
      },
      {
        listId: aliceWishlist.id,
        inviterId: alice.id,
        inviteeId: dan.id,
        role: Role.MEMBER,
        status: "PENDING",
      },
      {
        listId: bobParty.id,
        inviterId: bob.id,
        inviteeId: dan.id,
        role: Role.VIEWER,
        status: "PENDING",
      },
      {
        listId: carolShared.id,
        inviterId: carol.id,
        inviteeId: alice.id,
        role: Role.MEMBER,
        status: "PENDING",
      },
    ],
  });

  const listCount = await prisma.list.count();
  const itemCount = await prisma.item.count();
  const inviteCount = await prisma.invite.count();
  console.log(`Done. ${listCount} lists, ${itemCount} items, ${inviteCount} invites.`);
  console.log("\nAccounts (all passwords: password123):");
  users.forEach((u) => console.log(`  ${u.email}`));
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
