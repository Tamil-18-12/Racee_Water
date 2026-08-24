import Settings from '../models/Settings.js';

const getOrCreateSettings = async () => {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create({
      pricePerCan: Number(process.env.DEFAULT_PRICE_PER_CAN) || 20.0,
      businessName: process.env.DEFAULT_BUSINESS_NAME || 'Racee Water',
      phoneNumber: process.env.DEFAULT_PHONE || '9345038836',
      address: process.env.DEFAULT_ADDRESS || 'Laligam bus stop, laligam, Dharmapuri 636804',
    });
  }
  return settings;
};

export const getPublicSettings = async (req, res, next) => {
  try {
    const settings = await getOrCreateSettings();
    res.status(200).json({
      success: true,
      message: 'Success',
      data: settings,
    });
  } catch (err) {
    next(err);
  }
};

export const getSettings = async (req, res, next) => {
  try {
    const settings = await getOrCreateSettings();
    res.status(200).json({
      success: true,
      message: 'Success',
      data: settings,
    });
  } catch (err) {
    next(err);
  }
};

export const updateSettings = async (req, res, next) => {
  try {
    const { pricePerCan, businessName, phoneNumber, address } = req.body;
    const settings = await getOrCreateSettings();

    if (pricePerCan !== undefined && Number(pricePerCan) > 0) {
      settings.pricePerCan = Number(pricePerCan);
    }
    if (businessName !== undefined && businessName.trim() !== '') {
      settings.businessName = businessName.trim();
    }
    if (phoneNumber !== undefined && phoneNumber.trim() !== '') {
      settings.phoneNumber = phoneNumber.trim();
    }
    if (address !== undefined && address.trim() !== '') {
      settings.address = address.trim();
    }

    await settings.save();

    res.status(200).json({
      success: true,
      message: 'Settings updated successfully',
      data: settings,
    });
  } catch (err) {
    next(err);
  }
};
