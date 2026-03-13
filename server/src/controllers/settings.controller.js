import { Settings } from "../models/Settings.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ActivityLog } from "../models/ActivityLog.js";

export const getSetting = asyncHandler(async (req, res) => {
  const { key } = req.params;
  const setting = await Settings.findOne({ key });
  return res.json({ setting });
});

export const updateSetting = asyncHandler(async (req, res) => {
  const { key } = req.params;
  const { value, description } = req.body;

  const setting = await Settings.findOneAndUpdate(
    { key },
    { 
      value, 
      description,
      updatedBy: req.user.sub 
    },
    { upsert: true, new: true }
  );

  await ActivityLog.create({
    userId: req.user.sub,
    actionType: "SETTING_UPDATE",
    description: `Updated setting ${key} to ${JSON.stringify(value)}`
  });

  return res.json({ setting });
});

export const getAllSettings = asyncHandler(async (req, res) => {
  const settings = await Settings.find();
  return res.json({ settings });
});
