
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import Card from '../shared/models/Card.model';

// Load env vars
dotenv.config({ path: path.join(__dirname, '../../.env') });

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    console.error('MONGO_URI not found in .env');
    process.exit(1);
}

const seed = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        // Clear existing cards
        await Card.deleteMany({});
        console.log('Cleared existing cards');

        const cards = [];

        // --- 1. NORMAL CARDS (30) ---
        const normalImages = [
            'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800&q=80',
            'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?w=800&q=80'
        ];

        const normalNames = [
            'Stone Grid I', 'Stone Grid II', 'Iron Panel I', 'Iron Panel II', 'Marble Square I',
            'Bronze Tile I', 'Silver Fragment I', 'Moss Block I', 'Clay Patch I', 'Neutral Block I',
            'Granite Base I', 'Iron Frame I', 'Grid Core I', 'Metal Square I', 'Plain Surface I',
            'Base Tile I', 'Steel Segment I', 'Core Block I', 'Flat Grid I', 'Basic Tile I',
            'Stone Grid III', 'Stone Grid IV', 'Iron Panel III', 'Iron Panel IV', 'Marble Square II',
            'Bronze Tile II', 'Silver Fragment II', 'Moss Block II', 'Clay Patch II', 'Neutral Block II'
        ]; // Extended to 30

        for (let i = 0; i < 30; i++) {
            cards.push({
                name: normalNames[i] || `Normal Card ${i + 1}`,
                image: normalImages[i % 2],
                points: Math.floor(Math.random() * (6 - 2 + 1)) + 2, // 2-6
                duration: Math.floor(Math.random() * (60 - 30 + 1)) + 30, // 30-60 seconds
                type: 'normal',
                ownerId: null,
                expiresAt: null
            });
        }

        // --- 2. RARE CARDS (12) ---
        const rareCards = [
            { name: "Emily the Strategist", image: "https://ui.dimaac.com/_next/image?url=%2Femily0.png&w=1080&q=75", points: 22, duration: 90 },
            { name: "Roin the Swift", image: "https://ui.dimaac.com/_next/image?url=%2Froiin0.png&w=1080&q=75", points: 25, duration: 110 },
            { name: "Daisy of Light", image: "https://ui.dimaac.com/_next/image?url=%2Fdaisy0.png&w=1080&q=75", points: 20, duration: 80 },
            { name: "Lance the Guardian", image: "https://ui.dimaac.com/_next/image?url=%2Flance0.png&w=1080&q=75", points: 30, duration: 120 },
            { name: "Linda the Shadow", image: "https://ui.dimaac.com/_next/image?url=%2Flinda0.png&w=1080&q=75", points: 24, duration: 90 },
            { name: "Renei the Mystic", image: "https://ui.dimaac.com/_next/image?url=%2Frenei0.png&w=1080&q=75", points: 28, duration: 100 },
            { name: "Flame Warden", image: "https://i.pinimg.com/736x/d2/b5/27/d2b5271afaafa138387831f810a14c21.jpg", points: 32, duration: 100 },
            { name: "Storm Caller", image: "https://i.pinimg.com/736x/8f/5a/af/8f5aaf8a9b006a434b9dd415818294ae.jpg", points: 26, duration: 75 },
            { name: "Void Knight", image: "https://i.pinimg.com/1200x/87/14/0d/87140d8f7dd8b3fc9974058b14b634d6.jpg", points: 35, duration: 120 },
            { name: "Frost Queen", image: "https://i.pinimg.com/1200x/fc/87/9f/fc879f67541051d0ccfe8a5743e6df5a.jpg", points: 31, duration: 110 },
            { name: "Arcane Archer", image: "https://i.pinimg.com/736x/f9/ff/c9/f9ffc9bf79c6aaf467821d88f2c2a594.jpg", points: 27, duration: 90 },
            { name: "Nightblade", image: "https://i.pinimg.com/1200x/39/9b/00/399b007f0a02ad01e450a9387d246881.jpg", points: 29, duration: 95 }
        ];

        rareCards.forEach(c => {
            cards.push({ ...c, type: 'rare', ownerId: null, expiresAt: null });
        });

        // --- 3. TRAP CARDS (18) ---
        // 13 Unique + 5 Random Duplicates
        const trapPool = [
            { name: "Cursed Sigil", image: "https://i.pinimg.com/736x/c6/88/ce/c688cee4f38d7149bd85832b62ad7433.jpg", points: -12, duration: 15 },
            { name: "Burning Rift", image: "https://i.pinimg.com/736x/bc/6c/4b/bc6c4b623e43c60a51253f8d79e20aca.jpg", points: -15, duration: 20 },
            { name: "Glitch Collapse", image: "https://i.pinimg.com/736x/38/e2/9e/38e29e7e4599b124f86ca6aff4bc8ca5.jpg", points: -10, duration: 15 },
            { name: "Blood Omen", image: "https://i.pinimg.com/736x/ab/20/1a/ab201a7cbd2c72d54385fa16595948c0.jpg", points: -18, duration: 25 },
            { name: "Shadow Fracture", image: "https://i.pinimg.com/736x/0a/ed/58/0aed5834472bfbf846e188237319304d.jpg", points: -11, duration: 15 },
            { name: "Dark Collapse", image: "https://i.pinimg.com/736x/28/26/24/28262490eef98fd7d688008fd962b7c5.jpg", points: -13, duration: 20 },
            { name: "Poison Seal", image: "https://i.pinimg.com/736x/ac/9f/83/ac9f832186a7f3c96cd2a6b64f9ff1b5.jpg", points: -9, duration: 15 },
            { name: "Broken Mirror", image: "https://i.pinimg.com/736x/c1/fb/e4/c1fbe4f0b3f5895052d8d650abd77bbe.jpg", points: -8, duration: 10 },
            { name: "Time Distortion", image: "https://i.pinimg.com/736x/fa/e4/06/fae406f493d5ef99615f6645f8f885dc.jpg", points: -14, duration: 20 },
            { name: "Lava Vein", image: "https://i.pinimg.com/736x/20/10/9f/20109f4f6a1c75e5311ca6eaf3f0a7b2.jpg", points: -10, duration: 15 },
            { name: "Void Pulse", image: "https://i.pinimg.com/736x/3e/08/f0/3e08f0a6d51456431680ce96ad0609bd.jpg", points: -16, duration: 25 },
            { name: "Death Mark", image: "https://i.pinimg.com/736x/68/14/31/68143126d6b4c6545c885c6225957422.jpg", points: -14, duration: 20 },
            { name: "Abyss Crack", image: "https://i.pinimg.com/736x/2f/32/fb/2f32fbd659cabc5726d1b469de32fea2.jpg", points: -12, duration: 15 }
        ];

        // Add 13 unique
        trapPool.forEach(c => cards.push({ ...c, type: 'trap', ownerId: null, expiresAt: null }));

        // Add 5 random duplicates
        for (let i = 0; i < 5; i++) {
            const random = trapPool[Math.floor(Math.random() * trapPool.length)];
            cards.push({ ...random, type: 'trap', ownerId: null, expiresAt: null });
        }

        // Insert All
        await Card.insertMany(cards);

        console.log(`Successfully seeded ${cards.length} cards.`);
        console.log('Counts:');
        console.log(`- Normal: ${cards.filter(c => c.type === 'normal').length}`);
        console.log(`- Rare: ${cards.filter(c => c.type === 'rare').length}`);
        console.log(`- Trap: ${cards.filter(c => c.type === 'trap').length}`);

    } catch (error) {
        console.error('Error seeding database:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
};

seed();
