import mongoose, { Schema } from 'mongoose';
import { IInvestment } from '../types';

const investmentSchema = new Schema<IInvestment>({
  assetName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  assetType: {
    type: String,
    enum: ['Startup', 'Crypto Fund', 'Farmland', 'Collectible', 'Other'],
    required: true,
  },
  investedAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  investmentDate: {
    type: Date,
    required: true,
  },
  currentValue: {
    type: Number,
    required: true,
    min: 0,
  },
  owners: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }],
}, {
  timestamps: true,
});

export const Investment = mongoose.model<IInvestment>('Investment', investmentSchema);