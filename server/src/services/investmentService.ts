import { Investment } from '../models/Investment';
import { CreateInvestmentData, UpdateInvestmentData } from '../types';

export class InvestmentService {
  static async getAllInvestments() {
    return Investment.find()
      .populate('owners', 'name email')
      .sort({ createdAt: -1 });
  }

  static async getInvestmentById(id: string) {
    return Investment.findById(id)
      .populate('owners', 'name email');
  }

  static async createInvestment(data: CreateInvestmentData) {
    const { investmentDate, ...rest } = data;
    const investment = new Investment({
      ...rest,
      investmentDate: new Date(investmentDate),
    });
    
    await investment.save();
    await investment.populate('owners', 'name email');
    return investment;
  }

  static async updateInvestment(id: string, data: UpdateInvestmentData) {
    const updateData: any = { ...data };
    if (updateData.investmentDate) {
      updateData.investmentDate = new Date(updateData.investmentDate);
    }

    return Investment.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('owners', 'name email');
  }

  static async deleteInvestment(id: string) {
    return Investment.findByIdAndDelete(id);
  }
}