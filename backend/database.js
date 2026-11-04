const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'cafeteria-db.json');

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

let dbData = {
  users: [],
  categories: [],
  food_items: [],
  queue_sequences: {},
  orders: [],
  order_items: [],
  lastIds: {
    users: 0,
    categories: 0,
    food_items: 0,
    orders: 0,
    order_items: 0
  }
};

function saveDatabase() {
  const tmpFile = DB_FILE + '.tmp';
  fs.writeFileSync(tmpFile, JSON.stringify(dbData, null, 2), 'utf-8');
  fs.renameSync(tmpFile, DB_FILE);
}

function loadDatabase() {
  if (fs.existsSync(DB_FILE)) {
    try {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      dbData = JSON.parse(content);
    } catch (err) {
      console.error('Error reading DB file, reinitializing:', err);
    }
  }
}

function initDatabase() {
  loadDatabase();
  seedDefaultData();
  saveDatabase();
}

function seedDefaultData() {
  // 1. Seed Users
  if (!dbData.users || dbData.users.length === 0) {
    dbData.users = [];
    const hash = bcrypt.hashSync('password123', 10);

    const defaultUsers = [
      {
        id: 1,
        name: 'Alex Johnson (Student)',
        email: 'student@college.edu',
        password: hash,
        role: 'student',
        phone: '+1 (555) 234-5678',
        student_id: 'CS-2024-089',
        department: 'Computer Science & Engineering',
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        name: 'Chef Marcus (Counter Staff)',
        email: 'staff@college.edu',
        password: hash,
        role: 'staff',
        phone: '+1 (555) 345-6789',
        student_id: 'EMP-014',
        department: 'Culinary & Cafeteria Operations',
        created_at: new Date().toISOString()
      },
      {
        id: 3,
        name: 'Dr. Sarah Vance (Admin)',
        email: 'admin@college.edu',
        password: hash,
        role: 'admin',
        phone: '+1 (555) 456-7890',
        student_id: 'ADM-001',
        department: 'Campus Dining Services Directorate',
        created_at: new Date().toISOString()
      }
    ];

    dbData.users = defaultUsers;
    dbData.lastIds.users = 3;
  }

  // 2. Seed Categories
  if (!dbData.categories || dbData.categories.length === 0) {
    dbData.categories = [
      { id: 1, name: 'Breakfast', slug: 'breakfast', icon: 'Coffee', display_order: 1 },
      { id: 2, name: 'Lunch', slug: 'lunch', icon: 'Utensils', display_order: 2 },
      { id: 3, name: 'Fast Food', slug: 'fast-food', icon: 'Pizza', display_order: 3 },
      { id: 4, name: 'Snacks', slug: 'snacks', icon: 'Cookie', display_order: 4 },
      { id: 5, name: 'Beverages', slug: 'beverages', icon: 'CupSoda', display_order: 5 },
      { id: 6, name: 'Desserts', slug: 'desserts', icon: 'IceCream', display_order: 6 }
    ];
    dbData.lastIds.categories = 6;
  }

  // 3. Seed Food Items
  if (!dbData.food_items || dbData.food_items.length === 0) {
    const items = [
      {
        id: 1,
        name: 'Crispy Masala Dosa with Sambar',
        description: 'Golden fermented rice crepe filled with fragrant spiced potatoes, accompanied by fresh coconut chutney and slow-simmered lentil sambar.',
        price: 4.50,
        category_id: 1,
        category_name: 'Breakfast',
        is_veg: 1,
        prep_time_minutes: 8,
        is_available: 1,
        image_url: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=700&q=80',
        calories: 320,
        rating: 4.8,
        is_featured: 1,
        is_special: 1,
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        name: 'Avocado & Organic Poached Egg Sourdough',
        description: 'Artisanal toasted sourdough topped with chunky spiced Hass avocado mash, free-range poached egg, chili flakes, and extra virgin olive oil.',
        price: 5.75,
        category_id: 1,
        category_name: 'Breakfast',
        is_veg: 0,
        prep_time_minutes: 7,
        is_available: 1,
        image_url: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=700&q=80',
        calories: 380,
        rating: 4.7,
        is_featured: 0,
        is_special: 0,
        created_at: new Date().toISOString()
      },
      {
        id: 3,
        name: 'Fluffy Stack of Buttermilk Pancakes',
        description: 'Trio of thick, golden buttermilk pancakes crowned with pure Canadian maple syrup, whipped butter, and fresh wild blueberries.',
        price: 4.95,
        category_id: 1,
        category_name: 'Breakfast',
        is_veg: 1,
        prep_time_minutes: 10,
        is_available: 1,
        image_url: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=700&q=80',
        calories: 430,
        rating: 4.6,
        is_featured: 1,
        is_special: 0,
        created_at: new Date().toISOString()
      },
      {
        id: 4,
        name: 'Campus Royal Chicken Dum Biryani',
        description: 'Long grain aged Basmati rice layered with fragrant whole spices, tender marinated chicken, caramelized onions, served with cooling mint raita.',
        price: 8.50,
        category_id: 2,
        category_name: 'Lunch',
        is_veg: 0,
        prep_time_minutes: 12,
        is_available: 1,
        image_url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=700&q=80',
        calories: 670,
        rating: 4.9,
        is_featured: 1,
        is_special: 1,
        created_at: new Date().toISOString()
      },
      {
        id: 5,
        name: 'Paneer Butter Masala Deluxe Thali',
        description: 'Soft cottage cheese simmered in rich creamy tomato cashew gravy, served with two hot butter naans, jeera pulao, dal tadka, and salad.',
        price: 7.25,
        category_id: 2,
        category_name: 'Lunch',
        is_veg: 1,
        prep_time_minutes: 10,
        is_available: 1,
        image_url: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=700&q=80',
        calories: 590,
        rating: 4.8,
        is_featured: 1,
        is_special: 0,
        created_at: new Date().toISOString()
      },
      {
        id: 6,
        name: 'Mediterranean Grilled Chicken Bowl',
        description: 'Juicy herb-marinated chicken breast served over fluffy quinoa, crisp Persian cucumbers, Kalamata olives, cherry tomatoes, and tzatziki.',
        price: 8.20,
        category_id: 2,
        category_name: 'Lunch',
        is_veg: 0,
        prep_time_minutes: 9,
        is_available: 1,
        image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=700&q=80',
        calories: 510,
        rating: 4.7,
        is_featured: 0,
        is_special: 0,
        created_at: new Date().toISOString()
      },
      {
        id: 7,
        name: 'The Varsity Prime Cheeseburger',
        description: '100% prime grilled beef patty, melted Wisconsin aged cheddar, crispy lettuce, vine tomatoes, pickles, and our signature burger sauce on brioche.',
        price: 6.95,
        category_id: 3,
        category_name: 'Fast Food',
        is_veg: 0,
        prep_time_minutes: 10,
        is_available: 1,
        image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=700&q=80',
        calories: 620,
        rating: 4.9,
        is_featured: 1,
        is_special: 1,
        created_at: new Date().toISOString()
      },
      {
        id: 8,
        name: 'Crunchy Veggie Supreme Burger',
        description: 'Crispy spiced vegetable & edamame patty, melted mozzarella, pickled red onions, and smoked garlic aioli on a toasted sesame bun.',
        price: 5.50,
        category_id: 3,
        category_name: 'Fast Food',
        is_veg: 1,
        prep_time_minutes: 8,
        is_available: 1,
        image_url: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=700&q=80',
        calories: 450,
        rating: 4.6,
        is_featured: 0,
        is_special: 0,
        created_at: new Date().toISOString()
      },
      {
        id: 9,
        name: 'Wood-Fired Margherita Pizza (Personal)',
        description: 'San Marzano plum tomato sauce, creamy fresh Fior di Latte mozzarella, fragrant basil leaves, and cold-pressed extra virgin olive oil.',
        price: 7.80,
        category_id: 3,
        category_name: 'Fast Food',
        is_veg: 1,
        prep_time_minutes: 12,
        is_available: 1,
        image_url: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?auto=format&fit=crop&w=700&q=80',
        calories: 580,
        rating: 4.8,
        is_featured: 1,
        is_special: 0,
        created_at: new Date().toISOString()
      },
      {
        id: 10,
        name: 'Fiery Peri-Peri Loaded Fries',
        description: 'Golden skin-on Idaho potatoes dusted in our secret African bird’s eye chili blend, served with creamy sour cream and chive dip.',
        price: 3.25,
        category_id: 3,
        category_name: 'Fast Food',
        is_veg: 1,
        prep_time_minutes: 5,
        is_available: 1,
        image_url: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=700&q=80',
        calories: 340,
        rating: 4.7,
        is_featured: 0,
        is_special: 0,
        created_at: new Date().toISOString()
      },
      {
        id: 11,
        name: 'Authentic Punjabi Samosas (2 Pcs)',
        description: 'Flaky shortcrust pastry hand-folded with spiced Yukon gold potatoes, sweet green peas, whole cumin, served with date-tamarind chutney.',
        price: 2.80,
        category_id: 4,
        category_name: 'Snacks',
        is_veg: 1,
        prep_time_minutes: 4,
        is_available: 1,
        image_url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=700&q=80',
        calories: 270,
        rating: 4.9,
        is_featured: 1,
        is_special: 1,
        created_at: new Date().toISOString()
      },
      {
        id: 12,
        name: 'Crispy Veg Spring Rolls (3 Pcs)',
        description: 'Crisp wonton wrappers packed with julienned cabbage, shiitake mushrooms, carrots, scallions, served with sweet Thai chili dipping sauce.',
        price: 3.90,
        category_id: 4,
        category_name: 'Snacks',
        is_veg: 1,
        prep_time_minutes: 6,
        is_available: 1,
        image_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=700&q=80',
        calories: 250,
        rating: 4.5,
        is_featured: 0,
        is_special: 0,
        created_at: new Date().toISOString()
      },
      {
        id: 13,
        name: 'Signature Nitro Cold Brew Caramel Latte',
        description: 'Slow cold-brewed for 18 hours using Colombian beans, infused with creamy oat milk and salted house-made caramel drizzle.',
        price: 4.25,
        category_id: 5,
        category_name: 'Beverages',
        is_veg: 1,
        prep_time_minutes: 3,
        is_available: 1,
        image_url: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=700&q=80',
        calories: 180,
        rating: 4.9,
        is_featured: 1,
        is_special: 1,
        created_at: new Date().toISOString()
      },
      {
        id: 14,
        name: 'Chilled Alphonso Mango Mint Cooler',
        description: 'Refreshing crush of genuine Alphonso mango puree, fresh crushed garden spearmint, sparkling lemon-lime soda, and crushed ice.',
        price: 3.50,
        category_id: 5,
        category_name: 'Beverages',
        is_veg: 1,
        prep_time_minutes: 3,
        is_available: 1,
        image_url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=700&q=80',
        calories: 140,
        rating: 4.7,
        is_featured: 0,
        is_special: 0,
        created_at: new Date().toISOString()
      },
      {
        id: 15,
        name: 'Kolkata Clay-Pot Masala Chai',
        description: 'Bold Assam black CTC tea simmered with fresh crushed ginger, green cardamom pods, cinnamon, cloves, and whole milk.',
        price: 2.00,
        category_id: 5,
        category_name: 'Beverages',
        is_veg: 1,
        prep_time_minutes: 2,
        is_available: 1,
        image_url: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=700&q=80',
        calories: 90,
        rating: 4.9,
        is_featured: 1,
        is_special: 0,
        created_at: new Date().toISOString()
      },
      {
        id: 16,
        name: 'Warm Belgian Double Dark Fudge Brownie',
        description: 'Gooey 70% dark Callebaut chocolate brownie served warm with a scoop of French vanilla bean ice cream and roasted pecan crumble.',
        price: 4.50,
        category_id: 6,
        category_name: 'Desserts',
        is_veg: 1,
        prep_time_minutes: 4,
        is_available: 1,
        image_url: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=700&q=80',
        calories: 410,
        rating: 4.9,
        is_featured: 1,
        is_special: 1,
        created_at: new Date().toISOString()
      },
      {
        id: 17,
        name: 'New York Raspberry Swirl Cheesecake',
        description: 'Dense and creamy Philadelphia style cheesecake over a buttery cinnamon graham cracker crust, topped with tart wild raspberry coulis.',
        price: 5.20,
        category_id: 6,
        category_name: 'Desserts',
        is_veg: 1,
        prep_time_minutes: 2,
        is_available: 1,
        image_url: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=700&q=80',
        calories: 390,
        rating: 4.8,
        is_featured: 0,
        is_special: 0,
        created_at: new Date().toISOString()
      }
    ];

    dbData.food_items = items;
    dbData.lastIds.food_items = 17;
  }

  // 4. Seed Live Queue Sample Orders
  if (!dbData.orders || dbData.orders.length === 0) {
    const today = new Date().toISOString().split('T')[0];
    const dateSlug = today.replace(/-/g, '');

    const initialOrders = [
      {
        id: 1,
        order_number: `ORD-${dateSlug}-001`,
        user_id: 1,
        customer_name: 'Alex Johnson (Student)',
        customer_email: 'student@college.edu',
        customer_phone: '+1 (555) 234-5678',
        pickup_date: today,
        pickup_time: '11:45 AM',
        total_amount: 9.00,
        tax_amount: 0.45,
        final_amount: 9.45,
        status: 'Completed',
        payment_method: 'Campus Card / Wallet',
        payment_status: 'Paid',
        special_instructions: 'Extra coconut chutney please',
        queue_token: 'A001',
        queue_sequence: 1,
        estimated_wait_time: 0,
        ready_at: new Date(Date.now() - 3600000).toISOString(),
        completed_at: new Date(Date.now() - 1800000).toISOString(),
        created_at: new Date(Date.now() - 5400000).toISOString(),
        items: [
          {
            id: 1,
            order_id: 1,
            food_id: 1,
            food_name: 'Crispy Masala Dosa with Sambar',
            price: 4.50,
            quantity: 2,
            subtotal: 9.00,
            image_url: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=300&q=80'
          }
        ]
      },
      {
        id: 2,
        order_number: `ORD-${dateSlug}-002`,
        user_id: 1,
        customer_name: 'Maya Patel (Student)',
        customer_email: 'maya.p@college.edu',
        customer_phone: '+1 (555) 789-1234',
        pickup_date: today,
        pickup_time: '12:15 PM',
        total_amount: 12.75,
        tax_amount: 0.64,
        final_amount: 13.39,
        status: 'Ready for Pickup',
        payment_method: 'UPI / Online',
        payment_status: 'Paid',
        special_instructions: 'Less ice in cold brew',
        queue_token: 'A002',
        queue_sequence: 2,
        estimated_wait_time: 0,
        ready_at: new Date(Date.now() - 600000).toISOString(),
        created_at: new Date(Date.now() - 2400000).toISOString(),
        items: [
          {
            id: 2,
            order_id: 2,
            food_id: 4,
            food_name: 'Campus Royal Chicken Dum Biryani',
            price: 8.50,
            quantity: 1,
            subtotal: 8.50,
            image_url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=300&q=80'
          },
          {
            id: 3,
            order_id: 2,
            food_id: 13,
            food_name: 'Signature Nitro Cold Brew Caramel Latte',
            price: 4.25,
            quantity: 1,
            subtotal: 4.25,
            image_url: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=300&q=80'
          }
        ]
      },
      {
        id: 3,
        order_number: `ORD-${dateSlug}-003`,
        user_id: 1,
        customer_name: 'Kevin Zhao (Student)',
        customer_email: 'kevin.z@college.edu',
        customer_phone: '+1 (555) 678-2345',
        pickup_date: today,
        pickup_time: '12:45 PM',
        total_amount: 10.20,
        tax_amount: 0.51,
        final_amount: 10.71,
        status: 'Preparing',
        payment_method: 'Campus Card / Wallet',
        payment_status: 'Paid',
        special_instructions: 'Well done patty, no pickles',
        queue_token: 'A003',
        queue_sequence: 3,
        estimated_wait_time: 8,
        created_at: new Date(Date.now() - 1200000).toISOString(),
        items: [
          {
            id: 4,
            order_id: 3,
            food_id: 7,
            food_name: 'The Varsity Prime Cheeseburger',
            price: 6.95,
            quantity: 1,
            subtotal: 6.95,
            image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=300&q=80'
          },
          {
            id: 5,
            order_id: 3,
            food_id: 10,
            food_name: 'Fiery Peri-Peri Loaded Fries',
            price: 3.25,
            quantity: 1,
            subtotal: 3.25,
            image_url: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=300&q=80'
          }
        ]
      },
      {
        id: 4,
        order_number: `ORD-${dateSlug}-004`,
        user_id: 1,
        customer_name: 'Alex Johnson (Student)',
        customer_email: 'student@college.edu',
        customer_phone: '+1 (555) 234-5678',
        pickup_date: today,
        pickup_time: '01:15 PM',
        total_amount: 11.75,
        tax_amount: 0.59,
        final_amount: 12.34,
        status: 'Confirmed',
        payment_method: 'Campus Card / Wallet',
        payment_status: 'Paid',
        special_instructions: 'Warm brownie with extra vanilla drizzle',
        queue_token: 'A004',
        queue_sequence: 4,
        estimated_wait_time: 15,
        created_at: new Date(Date.now() - 600000).toISOString(),
        items: [
          {
            id: 6,
            order_id: 4,
            food_id: 5,
            food_name: 'Paneer Butter Masala Deluxe Thali',
            price: 7.25,
            quantity: 1,
            subtotal: 7.25,
            image_url: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=300&q=80'
          },
          {
            id: 7,
            order_id: 4,
            food_id: 16,
            food_name: 'Warm Belgian Double Dark Fudge Brownie',
            price: 4.50,
            quantity: 1,
            subtotal: 4.50,
            image_url: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=300&q=80'
          }
        ]
      }
    ];

    dbData.orders = initialOrders;
    dbData.queue_sequences[today] = 4;
    dbData.lastIds.orders = 4;
    dbData.lastIds.order_items = 7;
  }
}

// Atomic Queue Token Generator
function generateAtomicQueueToken(dateKey = new Date().toISOString().split('T')[0]) {
  loadDatabase();
  const currentNum = (dbData.queue_sequences[dateKey] || 0) + 1;
  dbData.queue_sequences[dateKey] = currentNum;

  // Prefix letter cycles every 100 orders: A for 1-99, B for 100-199, etc.
  const letterIndex = Math.floor((currentNum - 1) / 100) % 26;
  const letter = String.fromCharCode(65 + letterIndex);
  const tokenNumber = ((currentNum - 1) % 100) + 1;
  const token = `${letter}${String(tokenNumber).padStart(3, '0')}`;

  saveDatabase();
  return { token, sequence: currentNum };
}

// Database API helper functions
const db = {
  users: {
    find: (filter = {}) => {
      loadDatabase();
      return dbData.users.filter(u => {
        for (const k in filter) {
          if (u[k] !== filter[k]) return false;
        }
        return true;
      });
    },
    findOne: (filter) => {
      loadDatabase();
      return dbData.users.find(u => {
        for (const k in filter) {
          if (u[k] !== filter[k]) return false;
        }
        return true;
      });
    },
    findById: (id) => {
      loadDatabase();
      return dbData.users.find(u => u.id === Number(id));
    },
    create: (data) => {
      loadDatabase();
      dbData.lastIds.users++;
      const newUser = {
        id: dbData.lastIds.users,
        ...data,
        created_at: new Date().toISOString()
      };
      dbData.users.push(newUser);
      saveDatabase();
      return newUser;
    },
    update: (id, updates) => {
      loadDatabase();
      const index = dbData.users.findIndex(u => u.id === Number(id));
      if (index === -1) return null;
      dbData.users[index] = { ...dbData.users[index], ...updates };
      saveDatabase();
      return dbData.users[index];
    }
  },

  categories: {
    find: () => {
      loadDatabase();
      return [...dbData.categories].sort((a, b) => a.display_order - b.display_order);
    },
    findById: (id) => {
      loadDatabase();
      return dbData.categories.find(c => c.id === Number(id));
    }
  },

  food_items: {
    find: (filter = {}) => {
      loadDatabase();
      return dbData.food_items.filter(item => {
        for (const k in filter) {
          if (item[k] !== filter[k]) return false;
        }
        return true;
      });
    },
    findById: (id) => {
      loadDatabase();
      return dbData.food_items.find(item => item.id === Number(id));
    },
    create: (data) => {
      loadDatabase();
      dbData.lastIds.food_items++;
      const newItem = {
        id: dbData.lastIds.food_items,
        name: data.name,
        description: data.description || '',
        price: Number(data.price),
        category_id: Number(data.category_id) || 1,
        category_name: data.category_name || 'Fast Food',
        is_veg: data.is_veg !== undefined ? Number(data.is_veg) : 1,
        prep_time_minutes: Number(data.prep_time_minutes) || 10,
        is_available: data.is_available !== undefined ? Number(data.is_available) : 1,
        image_url: data.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=700&q=80',
        calories: Number(data.calories) || 300,
        rating: Number(data.rating) || 4.5,
        is_featured: data.is_featured ? 1 : 0,
        is_special: data.is_special ? 1 : 0,
        created_at: new Date().toISOString()
      };
      dbData.food_items.push(newItem);
      saveDatabase();
      return newItem;
    },
    update: (id, updates) => {
      loadDatabase();
      const idx = dbData.food_items.findIndex(item => item.id === Number(id));
      if (idx === -1) return null;
      dbData.food_items[idx] = { ...dbData.food_items[idx], ...updates };
      saveDatabase();
      return dbData.food_items[idx];
    },
    delete: (id) => {
      loadDatabase();
      const idx = dbData.food_items.findIndex(item => item.id === Number(id));
      if (idx === -1) return false;
      dbData.food_items.splice(idx, 1);
      saveDatabase();
      return true;
    }
  },

  orders: {
    find: (filter = {}) => {
      loadDatabase();
      return dbData.orders.filter(ord => {
        for (const k in filter) {
          if (ord[k] !== filter[k]) return false;
        }
        return true;
      }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    },
    findById: (id) => {
      loadDatabase();
      return dbData.orders.find(ord => ord.id === Number(id));
    },
    findByNumber: (orderNumber) => {
      loadDatabase();
      return dbData.orders.find(ord => ord.order_number === orderNumber);
    },
    findByToken: (queueToken) => {
      loadDatabase();
      return dbData.orders.find(ord => ord.queue_token.toUpperCase() === queueToken.toUpperCase());
    },
    create: (data) => {
      loadDatabase();
      dbData.lastIds.orders++;
      const orderId = dbData.lastIds.orders;
      
      const newItems = (data.items || []).map(it => {
        dbData.lastIds.order_items++;
        return {
          id: dbData.lastIds.order_items,
          order_id: orderId,
          food_id: it.food_id,
          food_name: it.food_name,
          price: Number(it.price),
          quantity: Number(it.quantity),
          subtotal: Number(it.subtotal || it.price * it.quantity),
          image_url: it.image_url || ''
        };
      });

      const newOrder = {
        id: orderId,
        order_number: data.order_number,
        user_id: data.user_id ? Number(data.user_id) : null,
        customer_name: data.customer_name,
        customer_email: data.customer_email,
        customer_phone: data.customer_phone || '',
        pickup_date: data.pickup_date,
        pickup_time: data.pickup_time,
        total_amount: Number(data.total_amount),
        tax_amount: Number(data.tax_amount || 0),
        final_amount: Number(data.final_amount),
        status: data.status || 'Confirmed',
        payment_method: data.payment_method || 'Campus Card / Wallet',
        payment_status: data.payment_status || 'Paid',
        special_instructions: data.special_instructions || '',
        queue_token: data.queue_token,
        queue_sequence: Number(data.queue_sequence),
        estimated_wait_time: Number(data.estimated_wait_time || 15),
        created_at: new Date().toISOString(),
        items: newItems
      };

      dbData.orders.push(newOrder);
      saveDatabase();
      return newOrder;
    },
    update: (id, updates) => {
      loadDatabase();
      const idx = dbData.orders.findIndex(ord => ord.id === Number(id));
      if (idx === -1) return null;
      dbData.orders[idx] = { ...dbData.orders[idx], ...updates };
      saveDatabase();
      return dbData.orders[idx];
    }
  }
};

module.exports = {
  db,
  initDatabase,
  generateAtomicQueueToken
};
