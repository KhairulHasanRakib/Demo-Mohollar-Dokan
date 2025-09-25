import { db } from '@/db';
import { workers } from '@/db/schema';

async function main() {
    const sampleWorkers = [
        {
            userId: 5,
            displayName: 'Mike Express Delivery',
            rating: 4.9,
            vehicleType: 'motorcycle',
            serviceRadiusKm: 25,
            latitude: 37.7749,
            longitude: -122.4194,
            city: 'San Francisco',
            country: 'USA',
            createdAt: new Date('2024-01-15').toISOString(),
        },
        {
            userId: 6,
            displayName: 'Sarah Swift Courier',
            rating: 4.7,
            vehicleType: 'bicycle',
            serviceRadiusKm: 15,
            latitude: 34.0522,
            longitude: -118.2437,
            city: 'Los Angeles',
            country: 'USA',
            createdAt: new Date('2024-01-20').toISOString(),
        },
        {
            userId: 8,
            displayName: 'Anna Quick Transport',
            rating: 4.6,
            vehicleType: 'car',
            serviceRadiusKm: 30,
            latitude: 41.8781,
            longitude: -87.6298,
            city: 'Chicago',
            country: 'USA',
            createdAt: new Date('2024-02-01').toISOString(),
        }
    ];

    await db.insert(workers).values(sampleWorkers);
    
    console.log('✅ Workers seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});