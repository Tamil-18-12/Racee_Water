import bcrypt from 'bcryptjs';
import Owner from '../models/Owner.js';
import Settings from '../models/Settings.js';

const INITIAL_OWNER_ID = 'owner001';
const INITIAL_PASSWORD = 'Admin@123';
const INITIAL_PRICE_PER_CAN = 20.0;
const INITIAL_BUSINESS_NAME = 'Racee Water';
const INITIAL_PHONE = '9345038836';
const INITIAL_ADDRESS = 'Laligam bus stop, laligam, Dharmapuri 636804';

export const initializeData = async () => {
  try {
    // Seed default owner if no owner exists in MongoDB
    const existingOwner = await Owner.findOne();
    if (!existingOwner) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(INITIAL_PASSWORD, salt);

      await Owner.create({
        ownerId: INITIAL_OWNER_ID,
        passwordHash,
        name: 'Owner Admin',
        mobile: INITIAL_PHONE,
        role: 'ROLE_OWNER',
      });
      console.log(`✅ MongoDB initialized with default owner: ${INITIAL_OWNER_ID}`);
    }

    // Seed default settings if no settings exist in MongoDB
    const existingSettings = await Settings.findOne();
    if (!existingSettings) {
      await Settings.create({
        pricePerCan: INITIAL_PRICE_PER_CAN,
        businessName: INITIAL_BUSINESS_NAME,
        phoneNumber: INITIAL_PHONE,
        address: INITIAL_ADDRESS,
        totalCansCount: 50,
      });
      console.log(`✅ MongoDB initialized with default settings: ₹${INITIAL_PRICE_PER_CAN}/can`);
    }
  } catch (err) {
    console.error('⚠️ Warning in database initialization:', err.message);
  }
};

