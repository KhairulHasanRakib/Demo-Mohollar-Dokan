import { db } from '@/db';
import { sellers, profiles } from '@/db/schema';

async function main() {
    // Verify profile IDs exist before creating sellers
    const profilesData = await db.select().from(profiles);
    
    if (profilesData.length < 4) {
        throw new Error('Not enough profiles found. Please run profiles seeder first.');
    }

    const sampleSellers = [
        {
            userId: 2,
            displayName: 'TechHub SF',
            description: 'Premium electronics and gadgets store in San Francisco',
            rating: 4.8,
            latitude: 37.7749,
            longitude: -122.4194,
            city: 'San Francisco',
            country: 'United States',
            createdAt: new Date('2024-01-10').toISOString(),
        },
        {
            userId: 3,
            displayName: 'StyleWorks LA',
            description: 'Trendy fashion and accessories for modern lifestyle',
            rating: 4.5,
            latitude: 34.0522,
            longitude: -118.2437,
            city: 'Los Angeles',
            country: 'United States',
            createdAt: new Date('2024-02-05').toISOString(),
        },
        {
            userId: 4,
            displayName: 'ElectroMart Chicago',
            description: 'Affordable consumer electronics and computer parts',
            rating: 4.2,
            latitude: 41.8781,
            longitude: -87.6298,
            city: 'Chicago',
            country: 'United States',
            createdAt: new Date('2024-03-12').toISOString(),
        }
    ];

    await db.insert(sellers).values(sampleSellers);
    
    console.log('✅ Sellers seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});