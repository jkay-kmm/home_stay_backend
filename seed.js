const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./src/models/User');
const Homestay = require('./src/models/Homestay');
const Booking = require('./src/models/Booking');

// Load env vars
dotenv.config();

// Connect to database
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

// Sample data
const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany();
    await Homestay.deleteMany();
    await Booking.deleteMany();

    // Create users
    const users = [
      {
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'Password123',
        role: 'admin'
      },
      {
        name: 'Host Duc',
        email: 'duc.host@example.com',
        password: 'Password123',
        role: 'host'
      },
      {
        name: 'Host Mai',
        email: 'mai.host@example.com',
        password: 'Password123',
        role: 'host'
      },
      {
        name: 'User Khach',
        email: 'khach@example.com',
        password: 'Password123',
        role: 'user'
      }
    ];

    const createdUsers = await User.create(users);
    console.log('Users created!');

    // Get host users
    const hosts = createdUsers.filter(user => user.role === 'host');

    // Create homestays
    const homestays = [
      {
        title: 'Villa sang trọng view núi Đà Lạt',
        description: 'Villa đẹp với view núi tuyệt đẹp, không gian yên tĩnh, thích hợp cho gia đình nghỉ dưỡng. Có đầy đủ tiện nghi hiện đại.',
        location: 'Đà Lạt',
        address: '123 Đường Trần Phú, Phường 4, Thành phố Đà Lạt, Lâm Đồng',
        price: 1500000,
        maxGuests: 6,
        bedrooms: 3,
        bathrooms: 2,
        amenities: ['Wifi', 'Bể bơi', 'Bãi đậu xe', 'Điều hòa', 'Bếp'],
        images: [
          { url: 'https://example.com/dalat1.jpg', alt: 'Villa view' },
          { url: 'https://example.com/dalat2.jpg', alt: 'Living room' }
        ],
        host: hosts[0]._id,
        coordinates: { latitude: 11.9404, longitude: 108.4583 }
      },
      {
        title: 'Căn hộ hiện đại trung tâm Hà Nội',
        description: 'Căn hộ sang trọng tại trung tâm Hà Nội, gần các địa điểm du lịch nổi tiếng. Đầy đủ tiện nghi, an ninh tốt.',
        location: 'Hà Nội',
        address: '456 Đường Hoàn Kiếm, Quận Hoàn Kiếm, Hà Nội',
        price: 2000000,
        maxGuests: 4,
        bedrooms: 2,
        bathrooms: 1,
        amenities: ['Wifi', 'Điều hòa', 'Tivi', 'Bếp', 'Thang máy'],
        images: [
          { url: 'https://example.com/hanoi1.jpg', alt: 'Apartment view' },
          { url: 'https://example.com/hanoi2.jpg', alt: 'Bedroom' }
        ],
        host: hosts[1]._id,
        coordinates: { latitude: 21.0285, longitude: 105.8542 }
      },
      {
        title: 'Biệt thự biển Nha Trang',
        description: 'Biệt thự view biển tuyệt đẹp tại Nha Trang. Có bể bơi riêng, phù hợp cho nhóm bạn, gia đình du lịch.',
        location: 'Nha Trang',
        address: '789 Đường Trần Phú, Thành phố Nha Trang, Khánh Hòa',
        price: 3000000,
        maxGuests: 8,
        bedrooms: 4,
        bathrooms: 3,
        amenities: ['Wifi', 'Bể bơi', 'Bãi đậu xe', 'Điều hòa', 'BBQ', 'Sân vườn'],
        images: [
          { url: 'https://example.com/nhatrang1.jpg', alt: 'Beach villa' },
          { url: 'https://example.com/nhatrang2.jpg', alt: 'Pool area' }
        ],
        host: hosts[0]._id,
        coordinates: { latitude: 12.2388, longitude: 109.1967 }
      },
      {
        title: 'Nhà gỗ truyền thống Sapa',
        description: 'Nhà gỗ truyền thống với view ruộng bậc thang tuyệt đẹp. Trải nghiệm văn hóa dân tộc thiểu số.',
        location: 'Sapa',
        address: '321 Đường Cầu Mây, Thị trấn Sapa, Lào Cai',
        price: 800000,
        maxGuests: 4,
        bedrooms: 2,
        bathrooms: 1,
        amenities: ['Wifi', 'Lò sưởi', 'Sân vườn', 'Ban công'],
        images: [
          { url: 'https://example.com/sapa1.jpg', alt: 'Wooden house' },
          { url: 'https://example.com/sapa2.jpg', alt: 'Rice terrace view' }
        ],
        host: hosts[1]._id,
        coordinates: { latitude: 22.3380, longitude: 103.8442 }
      },
      {
        title: 'Studio cozy Quận 1 TPHCM',
        description: 'Studio nhỏ xinh tại trung tâm Sài Gòn, thuận tiện di chuyển, phù hợp cho business trip hoặc cặp đôi.',
        location: 'TP Hồ Chí Minh',
        address: '159 Đường Nguyễn Huệ, Quận 1, TP Hồ Chí Minh',
        price: 1200000,
        maxGuests: 2,
        bedrooms: 1,
        bathrooms: 1,
        amenities: ['Wifi', 'Điều hòa', 'Tivi', 'Bếp', 'Thang máy'],
        images: [
          { url: 'https://example.com/hcm1.jpg', alt: 'Studio room' },
          { url: 'https://example.com/hcm2.jpg', alt: 'City view' }
        ],
        host: hosts[0]._id,
        coordinates: { latitude: 10.7769, longitude: 106.7009 }
      }
    ];

    await Homestay.create(homestays);
    console.log('Homestays created!');

    console.log('✅ Seed data completed successfully!');
    console.log('👤 Users created: 4');
    console.log('🏠 Homestays created: 5');
    
    process.exit();
  } catch (err) {
    console.error('❌ Error seeding data:', err);
    process.exit(1);
  }
};

seedData();