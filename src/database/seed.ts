import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...\n');

    // ─── Users ──────────────────────────────────────────────
    const passwordHash = await bcrypt.hash('admin123', 12);
    const cashierHash = await bcrypt.hash('cashier123', 12);
    const kitchenHash = await bcrypt.hash('kitchen123', 12);
    const inventoryHash = await bcrypt.hash('inventory123', 12);

    const admin = await prisma.user.upsert({
        where: { email: 'admin@possathi.com' },
        update: {},
        create: {
            email: 'admin@possathi.com',
            username: 'admin',
            passwordHash,
            firstName: 'Super',
            lastName: 'Admin',
            role: Role.ADMIN,
            phone: '9876543210',
        },
    });
    console.log('✅ Admin user created:', admin.email);

    const cashier = await prisma.user.upsert({
        where: { email: 'cashier@possathi.com' },
        update: {},
        create: {
            email: 'cashier@possathi.com',
            username: 'cashier1',
            passwordHash: cashierHash,
            firstName: 'Ravi',
            lastName: 'Kumar',
            role: Role.CASHIER,
            phone: '9876543211',
        },
    });
    console.log('✅ Cashier user created:', cashier.email);

    const kitchen = await prisma.user.upsert({
        where: { email: 'kitchen@possathi.com' },
        update: {},
        create: {
            email: 'kitchen@possathi.com',
            username: 'kitchen1',
            passwordHash: kitchenHash,
            firstName: 'Suresh',
            lastName: 'Patel',
            role: Role.KITCHEN,
            phone: '9876543212',
        },
    });
    console.log('✅ Kitchen user created:', kitchen.email);

    const inventoryManager = await prisma.user.upsert({
        where: { email: 'inventory@possathi.com' },
        update: {},
        create: {
            email: 'inventory@possathi.com',
            username: 'inventory1',
            passwordHash: inventoryHash,
            firstName: 'Priya',
            lastName: 'Sharma',
            role: Role.INVENTORY_MANAGER,
            phone: '9876543213',
        },
    });
    console.log('✅ Inventory Manager created:', inventoryManager.email);

    // ─── Categories ─────────────────────────────────────────
    const categories = await Promise.all([
        prisma.category.upsert({
            where: { slug: 'snacks' },
            update: {},
            create: { name: 'Snacks', slug: 'snacks', icon: '🍟', sortOrder: 1, description: 'Quick bites and finger foods' },
        }),
        prisma.category.upsert({
            where: { slug: 'meals' },
            update: {},
            create: { name: 'Meals', slug: 'meals', icon: '🍛', sortOrder: 2, description: 'Full meal options' },
        }),
        prisma.category.upsert({
            where: { slug: 'beverages' },
            update: {},
            create: { name: 'Beverages', slug: 'beverages', icon: '🥤', sortOrder: 3, description: 'Hot and cold drinks' },
        }),
        prisma.category.upsert({
            where: { slug: 'desserts' },
            update: {},
            create: { name: 'Desserts', slug: 'desserts', icon: '🍰', sortOrder: 4, description: 'Sweet treats' },
        }),
        prisma.category.upsert({
            where: { slug: 'breakfast' },
            update: {},
            create: { name: 'Breakfast', slug: 'breakfast', icon: '🥞', sortOrder: 5, description: 'Morning specials', },
        }),
    ]);
    console.log('✅ Categories created:', categories.length);

    // ─── Menu Items ─────────────────────────────────────────
    const menuItems = [
        // Snacks
        { name: 'Samosa', slug: 'samosa', categoryId: categories[0].id, basePrice: 15, taxRate: 5, isVeg: true, prepTime: 5, description: 'Crispy fried pastry with spiced filling' },
        { name: 'Vada Pav', slug: 'vada-pav', categoryId: categories[0].id, basePrice: 25, taxRate: 5, isVeg: true, prepTime: 5, description: 'Mumbai style potato vada in bread' },
        { name: 'Pav Bhaji', slug: 'pav-bhaji', categoryId: categories[0].id, basePrice: 60, taxRate: 5, isVeg: true, prepTime: 12, description: 'Mashed vegetables with butter pav' },
        { name: 'Paneer Tikka', slug: 'paneer-tikka', categoryId: categories[0].id, basePrice: 80, taxRate: 5, isVeg: true, prepTime: 15, description: 'Grilled cottage cheese with spices' },
        { name: 'French Fries', slug: 'french-fries', categoryId: categories[0].id, basePrice: 50, taxRate: 5, isVeg: true, prepTime: 8, description: 'Crispy golden fries' },
        { name: 'Chicken Roll', slug: 'chicken-roll', categoryId: categories[0].id, basePrice: 70, taxRate: 5, isVeg: false, prepTime: 10, description: 'Spiced chicken wrapped in paratha' },

        // Meals
        { name: 'Veg Thali', slug: 'veg-thali', categoryId: categories[1].id, basePrice: 120, taxRate: 5, isVeg: true, prepTime: 15, description: 'Full veg meal with roti, rice, dal, sabzi' },
        { name: 'Chicken Biryani', slug: 'chicken-biryani', categoryId: categories[1].id, basePrice: 150, taxRate: 5, isVeg: false, prepTime: 20, description: 'Aromatic rice with spiced chicken' },
        { name: 'Paneer Butter Masala', slug: 'paneer-butter-masala', categoryId: categories[1].id, basePrice: 130, taxRate: 5, isVeg: true, prepTime: 15, description: 'Rich creamy paneer curry' },
        { name: 'Dal Rice', slug: 'dal-rice', categoryId: categories[1].id, basePrice: 80, taxRate: 5, isVeg: true, prepTime: 10, description: 'Comfort food - dal tadka with steamed rice' },
        { name: 'Rajma Chawal', slug: 'rajma-chawal', categoryId: categories[1].id, basePrice: 90, taxRate: 5, isVeg: true, prepTime: 12, description: 'Kidney bean curry with rice' },
        { name: 'Egg Curry Rice', slug: 'egg-curry-rice', categoryId: categories[1].id, basePrice: 100, taxRate: 5, isVeg: false, prepTime: 12, description: 'Egg curry served with steamed rice' },

        // Beverages
        { name: 'Masala Chai', slug: 'masala-chai', categoryId: categories[2].id, basePrice: 15, taxRate: 5, isVeg: true, prepTime: 3, description: 'Traditional Indian spiced tea' },
        { name: 'Coffee', slug: 'coffee', categoryId: categories[2].id, basePrice: 20, taxRate: 5, isVeg: true, prepTime: 3, description: 'Fresh brewed coffee' },
        { name: 'Cold Coffee', slug: 'cold-coffee', categoryId: categories[2].id, basePrice: 45, taxRate: 5, isVeg: true, prepTime: 5, description: 'Iced coffee with ice cream' },
        { name: 'Fresh Lime Soda', slug: 'fresh-lime-soda', categoryId: categories[2].id, basePrice: 30, taxRate: 5, isVeg: true, prepTime: 3, description: 'Sweet or salty lime soda' },
        { name: 'Mango Lassi', slug: 'mango-lassi', categoryId: categories[2].id, basePrice: 40, taxRate: 5, isVeg: true, prepTime: 4, description: 'Thick mango yogurt drink' },
        { name: 'Buttermilk', slug: 'buttermilk', categoryId: categories[2].id, basePrice: 20, taxRate: 5, isVeg: true, prepTime: 3, description: 'Spiced refreshing chaas' },

        // Desserts
        { name: 'Gulab Jamun', slug: 'gulab-jamun', categoryId: categories[3].id, basePrice: 30, taxRate: 5, isVeg: true, prepTime: 2, description: 'Soft milk-solid dumplings in syrup' },
        { name: 'Ice Cream', slug: 'ice-cream', categoryId: categories[3].id, basePrice: 40, taxRate: 5, isVeg: true, prepTime: 2, description: 'Creamy ice cream (2 scoops)' },
        { name: 'Jalebi', slug: 'jalebi', categoryId: categories[3].id, basePrice: 35, taxRate: 5, isVeg: true, prepTime: 5, description: 'Crispy sweet spiral' },

        // Breakfast
        { name: 'Idli Sambhar', slug: 'idli-sambhar', categoryId: categories[4].id, basePrice: 40, taxRate: 5, isVeg: true, prepTime: 5, description: 'Steamed rice cakes with lentil soup', availableFrom: '07:00', availableTo: '11:00' },
        { name: 'Dosa', slug: 'dosa', categoryId: categories[4].id, basePrice: 50, taxRate: 5, isVeg: true, prepTime: 7, description: 'Crispy rice crepe with chutney', availableFrom: '07:00', availableTo: '11:00' },
        { name: 'Poha', slug: 'poha', categoryId: categories[4].id, basePrice: 30, taxRate: 5, isVeg: true, prepTime: 8, description: 'Flattened rice with spices', availableFrom: '07:00', availableTo: '11:00' },
        { name: 'Upma', slug: 'upma', categoryId: categories[4].id, basePrice: 35, taxRate: 5, isVeg: true, prepTime: 8, description: 'Semolina porridge with vegetables', availableFrom: '07:00', availableTo: '11:00' },
    ];

    for (const item of menuItems) {
        await prisma.menuItem.upsert({
            where: { slug: item.slug },
            update: {},
            create: item,
        });
    }
    console.log('✅ Menu items created:', menuItems.length);

    // ─── Variants ───────────────────────────────────────────
    const coffeeItem = await prisma.menuItem.findUnique({ where: { slug: 'coffee' } });
    const coldCoffeeItem = await prisma.menuItem.findUnique({ where: { slug: 'cold-coffee' } });
    const iceCreamItem = await prisma.menuItem.findUnique({ where: { slug: 'ice-cream' } });

    if (coffeeItem) {
        await prisma.menuVariant.createMany({
            data: [
                { menuItemId: coffeeItem.id, name: 'Small', priceAddon: 0 },
                { menuItemId: coffeeItem.id, name: 'Medium', priceAddon: 10 },
                { menuItemId: coffeeItem.id, name: 'Large', priceAddon: 20 },
            ],
            skipDuplicates: true,
        });
    }

    if (coldCoffeeItem) {
        await prisma.menuVariant.createMany({
            data: [
                { menuItemId: coldCoffeeItem.id, name: 'Regular', priceAddon: 0 },
                { menuItemId: coldCoffeeItem.id, name: 'Large', priceAddon: 15 },
            ],
            skipDuplicates: true,
        });
    }

    if (iceCreamItem) {
        await prisma.menuVariant.createMany({
            data: [
                { menuItemId: iceCreamItem.id, name: 'Vanilla', priceAddon: 0 },
                { menuItemId: iceCreamItem.id, name: 'Chocolate', priceAddon: 10 },
                { menuItemId: iceCreamItem.id, name: 'Strawberry', priceAddon: 10 },
                { menuItemId: iceCreamItem.id, name: 'Butterscotch', priceAddon: 15 },
            ],
            skipDuplicates: true,
        });
    }
    console.log('✅ Variants created');

    // ─── Inventory Items ───────────────────────────────────
    const inventoryItems = [
        { name: 'Rice', unit: 'kg', currentStock: 50, minStock: 10, costPerUnit: 45 },
        { name: 'Wheat Flour', unit: 'kg', currentStock: 30, minStock: 5, costPerUnit: 35 },
        { name: 'Cooking Oil', unit: 'liters', currentStock: 20, minStock: 5, costPerUnit: 120 },
        { name: 'Sugar', unit: 'kg', currentStock: 15, minStock: 3, costPerUnit: 42 },
        { name: 'Milk', unit: 'liters', currentStock: 30, minStock: 10, costPerUnit: 55 },
        { name: 'Coffee Powder', unit: 'kg', currentStock: 5, minStock: 1, costPerUnit: 350 },
        { name: 'Tea Leaves', unit: 'kg', currentStock: 3, minStock: 1, costPerUnit: 250 },
        { name: 'Paneer', unit: 'kg', currentStock: 10, minStock: 3, costPerUnit: 280 },
        { name: 'Chicken', unit: 'kg', currentStock: 15, minStock: 5, costPerUnit: 200 },
        { name: 'Onions', unit: 'kg', currentStock: 20, minStock: 5, costPerUnit: 30 },
        { name: 'Tomatoes', unit: 'kg', currentStock: 15, minStock: 5, costPerUnit: 35 },
        { name: 'Potatoes', unit: 'kg', currentStock: 25, minStock: 5, costPerUnit: 25 },
        { name: 'Bread', unit: 'pieces', currentStock: 100, minStock: 20, costPerUnit: 2 },
        { name: 'Butter', unit: 'kg', currentStock: 5, minStock: 1, costPerUnit: 450 },
        { name: 'Spices Mix', unit: 'kg', currentStock: 3, minStock: 1, costPerUnit: 200 },
    ];

    // Check if inventory items already exist
    const existingInventory = await prisma.inventoryItem.count();
    if (existingInventory === 0) {
        for (const item of inventoryItems) {
            await prisma.inventoryItem.create({ data: item });
        }
        console.log('✅ Inventory items created:', inventoryItems.length);
    } else {
        console.log('⏭️  Inventory items already exist, skipping');
    }

    // ─── Vendors ────────────────────────────────────────────
    const vendors = [
        { name: 'Fresh Farms Ltd', contact: 'Rahul Verma', phone: '9876543220', email: 'fresh@farms.com', address: 'Local Market, Main Road' },
        { name: 'Daily Dairy', contact: 'Amit Singh', phone: '9876543221', email: 'daily@dairy.com', address: 'Dairy Colony, Sector 5' },
        { name: 'Spice Traders', contact: 'Meena Devi', phone: '9876543222', email: 'spice@traders.com', address: 'Spice Market, Old City' },
    ];

    const existingVendors = await prisma.vendor.count();
    if (existingVendors === 0) {
        for (const vendor of vendors) {
            await prisma.vendor.create({ data: vendor });
        }
        console.log('✅ Vendors created:', vendors.length);
    } else {
        console.log('⏭️  Vendors already exist, skipping');
    }

    // ─── Coupons ────────────────────────────────────────────
    await prisma.coupon.createMany({
        data: [
            {
                code: 'WELCOME10',
                description: '10% off on first order',
                discountType: 'PERCENTAGE',
                discountValue: 10,
                maxDiscount: 50,
                usageLimit: 100,
                validFrom: new Date(),
                validTo: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
            },
            {
                code: 'FLAT20',
                description: 'Flat ₹20 off',
                discountType: 'FLAT',
                discountValue: 20,
                minOrder: 100,
                usageLimit: 200,
                validFrom: new Date(),
                validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            },
        ],
        skipDuplicates: true,
    });
    console.log('✅ Coupons created');

    // ─── System Settings ────────────────────────────────────
    const settings = [
        { key: 'college_name', value: 'Sathi Engineering College', group: 'general', label: 'College Name' },
        { key: 'gst_number', value: '29ABCDE1234F1ZH', group: 'billing', label: 'GST Number' },
        { key: 'default_tax_rate', value: '5', type: 'number', group: 'billing', label: 'Default Tax Rate (%)' },
        { key: 'currency_symbol', value: '₹', group: 'general', label: 'Currency Symbol' },
        { key: 'receipt_footer', value: 'Thank you! Visit again.', group: 'billing', label: 'Receipt Footer Message' },
        { key: 'kitchen_alert_sound', value: 'true', type: 'boolean', group: 'kitchen', label: 'Kitchen Alert Sound' },
        { key: 'order_auto_confirm', value: 'true', type: 'boolean', group: 'orders', label: 'Auto-confirm orders' },
        { key: 'max_counters', value: '3', type: 'number', group: 'general', label: 'Number of Counters' },
    ];

    for (const setting of settings) {
        await prisma.systemSetting.upsert({
            where: { key: setting.key },
            update: {},
            create: setting,
        });
    }
    console.log('✅ System settings created');

    console.log('\n🎉 Seed completed successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('  Admin:     admin@possathi.com / admin123');
    console.log('  Cashier:   cashier@possathi.com / cashier123');
    console.log('  Kitchen:   kitchen@possathi.com / kitchen123');
    console.log('  Inventory: inventory@possathi.com / inventory123');
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
