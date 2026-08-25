import Settings from '../models/Settings.js';
import Owner from '../models/Owner.js';
import bcrypt from 'bcryptjs';

const getOrCreateSettings = async () => {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create({
      pricePerCan: 20.0,
      businessName: 'Racee Water',
      phoneNumber: '9345038836',
      address: 'Laligam bus stop, laligam, Dharmapuri 636804',
      totalCansCount: 50,
    });
  }
  if (!settings.totalCansCount) {
    settings.totalCansCount = 50;
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
    const owner = await Owner.findOne();
    
    const responseData = {
      ...settings.toJSON(),
      ownerId: owner ? owner.ownerId : 'owner001',
    };

    res.status(200).json({
      success: true,
      message: 'Success',
      data: responseData,
    });
  } catch (err) {
    next(err);
  }
};

export const updateSettings = async (req, res, next) => {
  try {
    const { pricePerCan, businessName, phoneNumber, address, totalCansCount, newOwnerId, newPassword, currentPassword } = req.body;
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
    if (totalCansCount !== undefined && Number(totalCansCount) > 0) {
      settings.totalCansCount = Number(totalCansCount);
    }

    await settings.save();

    let ownerMsg = '';

    // Handle Owner ID and Password changes if supplied
    if (newOwnerId || newPassword) {
      const owner = await Owner.findOne();
      if (!owner) {
        return res.status(404).json({
          success: false,
          message: 'Owner account not found in database',
        });
      }

      if (newPassword) {
        if (!currentPassword) {
          return res.status(400).json({
            success: false,
            message: 'Current password is required to change password',
          });
        }
        const isMatch = await owner.comparePassword(currentPassword);
        if (!isMatch) {
          return res.status(400).json({
            success: false,
            message: 'Current password is incorrect',
          });
        }
        const salt = await bcrypt.genSalt(10);
        owner.passwordHash = await bcrypt.hash(newPassword, salt);
        ownerMsg += ' Password updated.';
      }

      if (newOwnerId && newOwnerId.trim() !== '' && newOwnerId.trim() !== owner.ownerId) {
        const existing = await Owner.findOne({ ownerId: newOwnerId.trim() });
        if (existing && String(existing._id) !== String(owner._id)) {
          return res.status(400).json({
            success: false,
            message: 'Owner ID already exists',
          });
        }
        owner.ownerId = newOwnerId.trim();
        ownerMsg += ' Owner ID updated.';
      }

      await owner.save();
    }

    const currentOwner = await Owner.findOne();

    res.status(200).json({
      success: true,
      message: `Settings updated successfully.${ownerMsg}`,
      data: {
        ...settings.toJSON(),
        ownerId: currentOwner ? currentOwner.ownerId : 'owner001',
      },
    });
  } catch (err) {
    next(err);
  }
};

