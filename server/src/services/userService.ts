import { User } from '../models/User';
import { UpdateUserRoleRequest } from '../types';

export class UserService {
  static async getUsers() {
    const users = await User.find({}, '-passwordHash').sort({ name: 1 });
    return users.map(user => ({
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
    }));
  }

  static async updateUserRole(userId: string, roleData: UpdateUserRoleRequest) {
    const user = await User.findByIdAndUpdate(
      userId,
      { role: roleData.role },
      { new: true, runValidators: true }
    ).select('-passwordHash');

    if (!user) {
      throw new Error('User not found');
    }

    return {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
    };
  }
}