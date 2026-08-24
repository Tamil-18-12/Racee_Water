import bcrypt from 'bcryptjs';
import Owner from '../models/Owner.js';
import Settings from '../models/Settings.js';

export const initializeData = async () => {
  try {
    const defaultOwnerId = process.env.OWNER_ID || 'owner001';
    const defaultPassword = process.env.OWNER_PASSWORD || 'Admin@123';
    const defaultPricePerCan = Number(process.env.DEFAULT_PRICE_PER_CAN) || 20.0;
    const defaultBusinessName = process.env.DEFAULT_BUSINESS_NAME || 'Racee Water';
    const defaultPhone = process.env.DEFAULT_PHONE || '9345038836';
    const defaultAddress = process.env.DEFAULT_ADDRESS || 'Laligam bus stop, laligam, Dharmapuri 636804';

    // Seed default owner
    const existingOwner = await Owner.findOne({ ownerId: defaultOwnerId });
    if (!existingOwner) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(defaultPassword, salt);

      await Owner.create({
        ownerId: defaultOwnerId,
        passwordHash,
        name: 'Owner Admin',
        mobile: defaultPhone,
        role: 'ROLE_OWNER',
      });
      console.log(`✅ Default owner created: ${defaultOwnerId} (Password: ${defaultPassword})`);
    }

    // Seed default settings
    const existingSettings = await Settings.findOne();
    if (!existingSettings) {
      await Settings.create({
        pricePerCan: defaultPricePerCan,
        businessName: defaultBusinessName,
        phoneNumber: defaultPhone,
        address: defaultAddress,
      });
      console.log(`✅ Default settings created with price ₹${defaultPricePerCan} per can`);
    }
  } catch (err) {
    console.error('⚠️ Warning in database initialization:', err.message);
  }
};
