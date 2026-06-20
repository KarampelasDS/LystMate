import { PrismaClient, Role, Visibility } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

let PASSWORD_HASH: string;

const USERS = [
  { email: "alice@example.com",   name: "Alice Carter" },
  { email: "bob@example.com",     name: "Bob Nguyen" },
  { email: "carol@example.com",   name: "Carol Smith" },
  { email: "dan@example.com",     name: "Dan Kowalski" },
  { email: "eva@example.com",     name: "Eva Rossi" },
  { email: "frank@example.com",   name: "Frank Osei" },
  { email: "grace@example.com",   name: "Grace Kim" },
  { email: "henry@example.com",   name: "Henry Patel" },
  { email: "iris@example.com",    name: "Iris Johansson" },
  { email: "jack@example.com",    name: "Jack Moreau" },
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
  "Parmesan cheese", "Mozzarella", "Feta", "Greek olives", "Capers",
  "Sun-dried tomatoes", "Tomato passata", "Tinned chopped tomatoes", "Tomato puree",
  "Apple cider vinegar", "Balsamic vinegar", "Fish sauce", "Worcestershire sauce",
  "Panko breadcrumbs", "Plain flour", "Self-raising flour", "Baking powder", "Bicarbonate of soda",
  "Caster sugar", "Brown sugar", "Icing sugar", "Vanilla extract", "Dark cocoa powder",
  "Walnuts", "Cashews", "Pecans", "Pumpkin seeds", "Sunflower seeds",
  "Dried apricots", "Raisins", "Medjool dates", "Desiccated coconut",
  "Rice noodles", "Egg noodles", "Udon noodles", "Couscous", "Polenta",
  "Red lentils", "Green lentils", "Puy lentils", "Split peas", "Edamame (frozen)",
  "Asparagus", "Courgette", "Aubergine", "Fennel bulb", "Leeks",
  "Red cabbage", "Savoy cabbage", "Kale", "Swiss chard", "Brussels sprouts",
  "Raspberries", "Blueberries", "Strawberries", "Mango", "Pineapple chunks (tin)",
  "Greek honey", "Tahini", "Peanut butter", "Almond butter", "Nutella",
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
  "Apple Watch Ultra 2", "Garmin Fenix 7", "Oura Ring Gen 3",
  "Peak Design backpack", "Bellroy wallet", "Anker power bank 26800mAh",
  "Rain-X wiper blades", "Yeti Rambler tumbler", "Stanley Adventure quencher",
  "Fjallraven Kanken mini", "Arc'teryx Atom LT jacket", "Salomon trail runners",
  "Osprey Talon 22 daypack", "Black Diamond trekking poles", "Petzl headlamp",
  "Kindle Scribe", "reMarkable 2 tablet", "Hobonichi Techo planner",
  "Lamy 2000 fountain pen", "Rhodia dot pad A5", "Leuchtturm1917 journal",
  "Tile Mate tracker 4-pack", "AirTag 4-pack", "Govee ambient TV lights",
  "Philips Hue starter kit", "Nanoleaf shapes hexagons", "Eve Energy smart plug",
  "Oculus Quest 3", "Steam Deck OLED", "PlayStation 5 Slim",
  "Xbox Series X controller", "8BitDo Ultimate controller", "Elgato Stream Deck",
  "Blue Yeti USB microphone", "Elgato Facecam", "BenQ ScreenBar lamp",
];

const OFFICE_ITEMS = [
  "Printer ink cartridges", "A4 paper reams (5)", "Sticky notes (pack)",
  "Whiteboard markers", "Highlighters set", "Ballpoint pens (box)",
  "Stapler + staples", "Scissors", "Tape dispenser", "Binder clips (assorted)",
  "Manila folders", "Ring binders", "Printer paper (colour)", "Envelopes (C5)",
  "Rubber bands", "Correction fluid", "Ruler 30cm", "Calculator",
  "Desk calendar refill", "Label maker tape", "Shredder bags", "Toner cartridge",
  "USB-C hub", "HDMI cable 2m", "Ethernet cable Cat6", "Cable ties",
  "Monitor stand riser", "Laptop stand", "Keyboard wrist rest", "Mouse pad XL",
  "Ergonomic lumbar cushion", "Blue-light glasses", "Desk plants (small)",
  "Whiteboard eraser", "Permanent markers", "Gel pens (black)", "Mechanical pencils",
  "Lead refills 0.5mm", "Eraser set", "Pencil sharpener", "Correction tape",
  "Laminator pouches A4", "Spiral notebooks (5)", "Post-it flags", "Padded envelopes",
  "Bubble wrap roll", "Packing tape", "Box cutter", "Heavy duty stapler",
];

const PARTY_ITEMS = [
  "Balloons (50 pack)", "Streamers", "Party hats", "Paper plates (50)",
  "Plastic cups (100)", "Napkins", "Tablecloth", "Candles", "Birthday banner",
  "Confetti", "Noise makers", "Piñata", "Piñata filler sweets",
  "Cake mix", "Icing sugar", "Food colouring", "Sprinkles",
  "Prosecco (6 bottles)", "Beer (24 pack)", "Sparkling grape juice",
  "Crisps (3 bags)", "Dip selection", "Cheese platter ingredients",
  "Mini sausage rolls", "Pizza rolls", "Brownie mix", "Ice cream tubs (3)",
  "Photo booth props", "Selfie ring light", "Instant camera film",
  "Disposable BBQ grills", "Charcoal bags", "BBQ tongs", "BBQ skewers",
  "Burger buns (12)", "Hot dog buns (12)", "Beef patties (12)", "Veggie burgers (6)",
  "Condiment set", "Paper straws", "Cocktail picks", "Drink stirrers",
  "Punch bowl", "Ladle", "Ice bucket", "Drink dispenser",
];

const TRAVEL_ITEMS = [
  "Passport holder", "Travel adapter universal", "Packing cubes set",
  "Compression bags", "Travel pillow", "Eye mask", "Ear plugs",
  "Portable charger", "Travel-size toiletries", "Sunscreen SPF50",
  "Insect repellent", "Blister plasters", "Travel first aid kit",
  "Reusable water bottle", "Collapsible coffee cup", "Travel cutlery set",
  "Dry shampoo", "Travel umbrella", "Rain cover for backpack",
  "Padlocks (2)", "RFID blocking wallet", "Money belt", "Cable organiser",
  "Microfibre towel", "Flip flops", "Waterproof phone pouch",
  "Snorkelling mask", "Reef-safe sunscreen", "Rash guard", "Waterproof sandals",
  "Motion sickness bands", "Melatonin tablets", "Electrolyte sachets",
  "Portable Wi-Fi router", "Local SIM card slot adapter", "Screen wipes",
];

const HOME_ITEMS = [
  "Lightbulbs E27 (pack)", "AA batteries (16)", "AAA batteries (8)",
  "Extension cord 3m", "Blu-tack", "Picture hooks", "Wall anchors set",
  "WD-40 spray", "Duct tape", "Sandpaper assorted", "Paint roller + tray",
  "Filler + spatula", "Door stopper", "Draught excluder", "Smoke alarm battery",
  "Toilet brush + holder", "Shower squeegee", "Toilet cleaner", "Bleach",
  "All-purpose cleaner", "Glass cleaner", "Microfibre cloths (10 pack)",
  "Mop + bucket", "Vacuum cleaner bags", "Air freshener", "Bin bags (50)",
  "Recycling bags", "Compost bags", "Drawer organiser", "Cable management box",
  "Shelf brackets (4)", "Floating shelves", "Command strips", "Velcro strips",
  "Door mat", "Coat hooks (5)", "Key hooks", "Letterbox draught excluder",
  "Plant pots (assorted)", "Potting mix", "Plant food", "Watering can",
];

const FITNESS_ITEMS = [
  "Protein powder (chocolate)", "Creatine monohydrate", "BCAA powder",
  "Pre-workout supplement", "Omega-3 capsules", "Vitamin D3 drops",
  "Magnesium glycinate", "Zinc tablets", "Multivitamin", "Collagen peptides",
  "Resistance bands set", "Foam roller", "Massage ball", "Lacrosse ball",
  "Jump rope", "Gym gloves", "Lifting belt", "Knee sleeves",
  "Wrist wraps", "Ankle weights 2kg", "Pull-up bar doorframe", "Dip bars",
  "Ab wheel", "Balance board", "Yoga mat 6mm", "Yoga blocks (2)",
  "Yoga strap", "Pilates ring", "Booty bands set", "Sliders (set of 2)",
  "Running socks 5-pack", "Compression leggings", "Sports bra (high impact)",
  "Gym water bottle 1L", "Shaker bottle", "Meal prep containers (7)",
  "Calorie tracking scale", "Heart rate monitor", "Running belt",
  "Trail running shoes", "Gym bag", "Towels (2)", "Sweat towel",
];

function pick<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(n, arr.length));
}

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function createList(
  owner: { id: string },
  name: string,
  visibility: Visibility,
  itemNames: string[],
  members: { user: { id: string }; role: Role }[] = []
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

  if (itemNames.length > 0) {
    await prisma.item.createMany({
      data: itemNames.map((itemName, i) => ({
        listId: list.id,
        name: itemName,
        quantity: rand(1, 4),
        checked: i % 6 === 0,
        url:
          i % 8 === 0
            ? `https://example.com/product/${itemName.toLowerCase().replace(/\s+/g, "-")}`
            : null,
      })),
    });
  }

  return list;
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

  const users = await Promise.all(
    USERS.map((u) =>
      prisma.user.create({
        data: { ...u, password: PASSWORD_HASH, emailVerified: true },
      })
    )
  );

  const [alice, bob, carol, dan, eva, frank, grace, henry, iris, jack] = users;
  console.log(`Created ${users.length} users`);

  // ── Alice's lists (she has many) ────────────────────────────────────────────
  const aliceGrocery = await createList(alice, "Weekly grocery run", Visibility.PRIVATE, pick(GROCERY_ITEMS, 55), [
    { user: bob, role: Role.MEMBER },
    { user: carol, role: Role.VIEWER },
  ]);

  await createList(alice, "My 2026 wishlist ✨", Visibility.PUBLIC, pick(WISHLIST_ITEMS, 60));
  await createList(alice, "Office supplies Q3", Visibility.PRIVATE, OFFICE_ITEMS);
  await createList(alice, "Home improvement", Visibility.PRIVATE, pick(HOME_ITEMS, 40));
  await createList(alice, "Gym & health", Visibility.PRIVATE, pick(FITNESS_ITEMS, 35));
  await createList(alice, "Europe trip packing 🌍", Visibility.PRIVATE, TRAVEL_ITEMS);
  await createList(alice, "Secret santa gifts", Visibility.PRIVATE, pick(WISHLIST_ITEMS, 12));
  await createList(alice, "Meal prep this week", Visibility.PRIVATE, pick(GROCERY_ITEMS, 28));
  await createList(alice, "Bathroom restock", Visibility.PRIVATE, pick(HOME_ITEMS, 20));
  await createList(alice, "Christmas grocery list 🎄", Visibility.PRIVATE, pick(GROCERY_ITEMS, 45), [
    { user: bob, role: Role.MEMBER },
    { user: dan, role: Role.MEMBER },
  ]);
  await createList(alice, "Camping gear checklist", Visibility.PUBLIC, pick(TRAVEL_ITEMS, 30));
  await createList(alice, "Baby shower gifts for Mia", Visibility.PRIVATE, pick(WISHLIST_ITEMS, 18));
  await createList(alice, "Ikea haul", Visibility.PRIVATE, pick(HOME_ITEMS, 22));
  await createList(alice, "Book club reading list", Visibility.PUBLIC, [
    "The Thursday Murder Club", "Tomorrow, and Tomorrow, and Tomorrow", "Intermezzo",
    "Orbital", "James", "The Women", "All Fours", "The God of the Woods",
    "Long Island Compromise", "Percival Everett collected", "The Familiar",
    "Yellowface", "Holly", "Happy Place", "Fourth Wing", "Iron Flame",
    "A Court of Thorns and Roses", "Lessons in Chemistry", "The Covenant of Water",
    "Hello Beautiful", "Trust", "Demon Copperhead", "The Marriage Portrait",
    "Babel", "This Is How You Lose the Time War",
  ]);
  await createList(alice, "Pantry top-up", Visibility.PRIVATE, pick(GROCERY_ITEMS, 30));
  await createList(alice, "New apartment essentials", Visibility.PRIVATE, pick(HOME_ITEMS, 48));
  await createList(alice, "Housewarming party 🏠", Visibility.PRIVATE, pick(PARTY_ITEMS, 35), [
    { user: bob, role: Role.MEMBER },
    { user: grace, role: Role.VIEWER },
  ]);
  await createList(alice, "Marathon training gear", Visibility.PUBLIC, pick(FITNESS_ITEMS, 25));
  await createList(alice, "Japan trip 2026 🇯🇵", Visibility.PRIVATE, pick(TRAVEL_ITEMS, 36));
  await createList(alice, "Freezer meals batch cook", Visibility.PRIVATE, pick(GROCERY_ITEMS, 32));
  await createList(alice, "Dad's birthday wishlist", Visibility.PRIVATE, pick(WISHLIST_ITEMS, 14));
  await createList(alice, "Snack drawer restock", Visibility.PRIVATE, pick(GROCERY_ITEMS, 16));

  // ── Bob's lists ──────────────────────────────────────────────────────────────
  const bobParty = await createList(bob, "Summer BBQ party 🎉", Visibility.PRIVATE, PARTY_ITEMS, [
    { user: alice, role: Role.MEMBER },
    { user: carol, role: Role.VIEWER },
    { user: eva, role: Role.VIEWER },
  ]);

  await createList(bob, "Bob's grocery list", Visibility.PRIVATE, pick(GROCERY_ITEMS, 28));
  await createList(bob, "Tech wishlist", Visibility.PUBLIC, pick(WISHLIST_ITEMS, 40));
  await createList(bob, "Home office setup", Visibility.PRIVATE, pick(OFFICE_ITEMS, 30));
  await createList(bob, "Gym bag checklist", Visibility.PRIVATE, pick(FITNESS_ITEMS, 20));
  await createList(bob, "Weekend trip packing", Visibility.PRIVATE, pick(TRAVEL_ITEMS, 25));
  await createList(bob, "Work stationery order", Visibility.PRIVATE, pick(OFFICE_ITEMS, 22));
  await createList(bob, "Flat shopping (shared)", Visibility.PRIVATE, pick(GROCERY_ITEMS, 40), [
    { user: grace, role: Role.MEMBER },
  ]);
  await createList(bob, "New Year's Eve party 🥂", Visibility.PRIVATE, pick(PARTY_ITEMS, 30), [
    { user: alice, role: Role.MEMBER },
    { user: carol, role: Role.MEMBER },
    { user: henry, role: Role.VIEWER },
  ]);
  await createList(bob, "Cycling kit wishlist 🚴", Visibility.PUBLIC, pick(FITNESS_ITEMS, 22));
  await createList(bob, "Airbnb hosting essentials", Visibility.PRIVATE, pick(HOME_ITEMS, 35));
  await createList(bob, "Bali trip supplies 🌴", Visibility.PRIVATE, pick(TRAVEL_ITEMS, 30));

  // ── Carol's lists ────────────────────────────────────────────────────────────
  const carolShared = await createList(carol, "Shared house shopping", Visibility.PRIVATE, pick(GROCERY_ITEMS, 52), [
    { user: dan, role: Role.MEMBER },
    { user: bob, role: Role.VIEWER },
  ]);

  await createList(carol, "Carol's wishlist", Visibility.PUBLIC, pick(WISHLIST_ITEMS, 45));
  await createList(carol, "Office party supplies", Visibility.PRIVATE, pick(PARTY_ITEMS, 28));
  await createList(carol, "Moving house checklist", Visibility.PRIVATE, pick(HOME_ITEMS, 50));
  await createList(carol, "Pilates & yoga gear", Visibility.PRIVATE, pick(FITNESS_ITEMS, 18));
  await createList(carol, "Portugal holiday 🇵🇹", Visibility.PRIVATE, pick(TRAVEL_ITEMS, 32));
  await createList(carol, "Organic grocery haul", Visibility.PRIVATE, pick(GROCERY_ITEMS, 38));
  await createList(carol, "Stationery addiction 📎", Visibility.PUBLIC, pick(OFFICE_ITEMS, 25));
  await createList(carol, "Home decor wishlist", Visibility.PUBLIC, pick(HOME_ITEMS, 30));
  await createList(carol, "Kids party 🎈", Visibility.PRIVATE, pick(PARTY_ITEMS, 40), [
    { user: dan, role: Role.MEMBER },
    { user: iris, role: Role.VIEWER },
  ]);

  // ── Dan's lists ──────────────────────────────────────────────────────────────
  await createList(dan, "Dan's very long grocery list with absolutely everything in it", Visibility.PRIVATE, GROCERY_ITEMS);
  await createList(dan, "Birthday gifts for Carol 🎂", Visibility.PRIVATE, pick(WISHLIST_ITEMS, 15));
  await createList(dan, "Fitness overhaul 💪", Visibility.PRIVATE, FITNESS_ITEMS);
  await createList(dan, "Smart home wishlist", Visibility.PUBLIC, pick(WISHLIST_ITEMS, 28));
  await createList(dan, "Remote work setup", Visibility.PRIVATE, pick(OFFICE_ITEMS, 35));
  await createList(dan, "Hiking trip gear 🏔️", Visibility.PRIVATE, pick(TRAVEL_ITEMS, 40), [
    { user: frank, role: Role.MEMBER },
  ]);
  await createList(dan, "Monthly pantry restock", Visibility.PRIVATE, pick(GROCERY_ITEMS, 44));
  await createList(dan, "Garden project supplies", Visibility.PRIVATE, pick(HOME_ITEMS, 30));

  // ── Eva's lists ──────────────────────────────────────────────────────────────
  await createList(eva, "Eva's grocery run", Visibility.PRIVATE, pick(GROCERY_ITEMS, 35));
  await createList(eva, "Skincare wishlist 💅", Visibility.PUBLIC, pick(WISHLIST_ITEMS, 20));
  await createList(eva, "Baby essentials shopping", Visibility.PRIVATE, pick(HOME_ITEMS, 42));
  await createList(eva, "Yoga retreat packing", Visibility.PRIVATE, pick(TRAVEL_ITEMS, 28));
  await createList(eva, "Dinner party 🍷", Visibility.PRIVATE, pick(PARTY_ITEMS, 25), [
    { user: carol, role: Role.MEMBER },
    { user: iris, role: Role.MEMBER },
  ]);
  await createList(eva, "Supplement stack", Visibility.PRIVATE, pick(FITNESS_ITEMS, 22));
  await createList(eva, "Kitchen upgrade list", Visibility.PUBLIC, pick(WISHLIST_ITEMS, 18));

  // ── Frank's lists ────────────────────────────────────────────────────────────
  await createList(frank, "Frank's weekly shop", Visibility.PRIVATE, pick(GROCERY_ITEMS, 30));
  await createList(frank, "Photography gear wishlist 📷", Visibility.PUBLIC, pick(WISHLIST_ITEMS, 25));
  await createList(frank, "Office restocking", Visibility.PRIVATE, pick(OFFICE_ITEMS, 28));
  await createList(frank, "Van camping trip 🚐", Visibility.PRIVATE, pick(TRAVEL_ITEMS, 38), [
    { user: dan, role: Role.MEMBER },
    { user: henry, role: Role.MEMBER },
  ]);
  await createList(frank, "Power lifting essentials", Visibility.PRIVATE, pick(FITNESS_ITEMS, 30));
  await createList(frank, "Home bar wishlist 🍸", Visibility.PUBLIC, pick(WISHLIST_ITEMS, 15));

  // ── Grace's lists ────────────────────────────────────────────────────────────
  await createList(grace, "Grace's grocery list", Visibility.PRIVATE, pick(GROCERY_ITEMS, 32));
  await createList(grace, "Interior wishlist 🛋️", Visibility.PUBLIC, pick(HOME_ITEMS, 35));
  await createList(grace, "Flat essentials", Visibility.PRIVATE, pick(HOME_ITEMS, 28));
  await createList(grace, "Seoul trip 🇰🇷", Visibility.PRIVATE, pick(TRAVEL_ITEMS, 34));
  await createList(grace, "Shared flat shopping", Visibility.PRIVATE, pick(GROCERY_ITEMS, 46), [
    { user: bob, role: Role.MEMBER },
    { user: iris, role: Role.MEMBER },
  ]);
  await createList(grace, "Running gear upgrade", Visibility.PUBLIC, pick(FITNESS_ITEMS, 20));
  await createList(grace, "Birthday bash 🎉", Visibility.PRIVATE, pick(PARTY_ITEMS, 32), [
    { user: alice, role: Role.VIEWER },
    { user: carol, role: Role.VIEWER },
    { user: eva, role: Role.MEMBER },
  ]);

  // ── Henry's lists ────────────────────────────────────────────────────────────
  await createList(henry, "Henry's big grocery haul", Visibility.PRIVATE, pick(GROCERY_ITEMS, 50));
  await createList(henry, "Gadget wishlist 🤖", Visibility.PUBLIC, pick(WISHLIST_ITEMS, 55));
  await createList(henry, "Uni stationery", Visibility.PRIVATE, pick(OFFICE_ITEMS, 20));
  await createList(henry, "Interrail packing list 🚂", Visibility.PUBLIC, TRAVEL_ITEMS);
  await createList(henry, "Bulk buy month", Visibility.PRIVATE, pick(GROCERY_ITEMS, 60));
  await createList(henry, "Flat party 🎊", Visibility.PRIVATE, pick(PARTY_ITEMS, 38), [
    { user: iris, role: Role.MEMBER },
    { user: jack, role: Role.MEMBER },
    { user: grace, role: Role.VIEWER },
  ]);

  // ── Iris's lists ────────────────────────────────────────────────────────────
  await createList(iris, "Iris's grocery list", Visibility.PRIVATE, pick(GROCERY_ITEMS, 38));
  await createList(iris, "Bouldering kit wishlist 🧗", Visibility.PUBLIC, pick(FITNESS_ITEMS, 18));
  await createList(iris, "Home office wishlist", Visibility.PUBLIC, pick(WISHLIST_ITEMS, 22));
  await createList(iris, "Nordic trip 🧊", Visibility.PRIVATE, pick(TRAVEL_ITEMS, 36));
  await createList(iris, "Shared house: weekly shop", Visibility.PRIVATE, pick(GROCERY_ITEMS, 55), [
    { user: grace, role: Role.MEMBER },
    { user: jack, role: Role.MEMBER },
  ]);
  await createList(iris, "Tea & coffee station ☕", Visibility.PRIVATE, pick(GROCERY_ITEMS, 10));

  // ── Jack's lists ────────────────────────────────────────────────────────────
  await createList(jack, "Jack's grocery run", Visibility.PRIVATE, pick(GROCERY_ITEMS, 33));
  await createList(jack, "Jack's monster wishlist", Visibility.PUBLIC, pick(WISHLIST_ITEMS, 65));
  await createList(jack, "Music studio gear 🎛️", Visibility.PUBLIC, pick(WISHLIST_ITEMS, 20));
  await createList(jack, "Road trip essentials 🚗", Visibility.PRIVATE, pick(TRAVEL_ITEMS, 30));
  await createList(jack, "Climbing trip packing", Visibility.PRIVATE, pick(TRAVEL_ITEMS, 28), [
    { user: iris, role: Role.MEMBER },
    { user: frank, role: Role.MEMBER },
  ]);
  await createList(jack, "January health kick", Visibility.PRIVATE, pick(FITNESS_ITEMS, 40));
  await createList(jack, "Flat warming party 🎉", Visibility.PRIVATE, pick(PARTY_ITEMS, 35), [
    { user: henry, role: Role.MEMBER },
    { user: iris, role: Role.MEMBER },
    { user: grace, role: Role.VIEWER },
    { user: eva, role: Role.VIEWER },
  ]);

  // ── Pending invites ──────────────────────────────────────────────────────────
  await prisma.invite.createMany({
    data: [
      { listId: aliceGrocery.id, inviterId: alice.id, inviteeId: eva.id,   role: Role.VIEWER,  status: "PENDING" },
      { listId: aliceGrocery.id, inviterId: alice.id, inviteeId: frank.id, role: Role.MEMBER,  status: "PENDING" },
      { listId: bobParty.id,     inviterId: bob.id,   inviteeId: dan.id,   role: Role.VIEWER,  status: "PENDING" },
      { listId: bobParty.id,     inviterId: bob.id,   inviteeId: grace.id, role: Role.MEMBER,  status: "PENDING" },
      { listId: carolShared.id,  inviterId: carol.id, inviteeId: alice.id, role: Role.MEMBER,  status: "PENDING" },
      { listId: carolShared.id,  inviterId: carol.id, inviteeId: jack.id,  role: Role.VIEWER,  status: "PENDING" },
      { listId: carolShared.id,  inviterId: carol.id, inviteeId: henry.id, role: Role.VIEWER,  status: "PENDING" },
    ],
  });

  const listCount  = await prisma.list.count();
  const itemCount  = await prisma.item.count();
  const inviteCount = await prisma.invite.count();
  console.log(`Done. ${listCount} lists, ${itemCount} items, ${inviteCount} invites.`);
  console.log("\nAccounts (all passwords: password123):");
  users.forEach((u) => console.log(`  ${u.email}`));
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
