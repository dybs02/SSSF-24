import { User } from "../../interfaces/User";
import userModel from "../models/userModel";


export default {
  Query: {
    users: async (): Promise<User[]> => {
      return await userModel.find();
    },
    userById: async (
      _parent: undefined,
      args: { id: string },
    ): Promise<User> => {
      const user = await userModel.findById(args.id);
      if (!user) {
        throw new Error('User not found');
      }
      return user;
    },
  },
  Mutation: {
    createUser: async (
      _parent: undefined,
      args: { user_name: String, email: String },
    ): Promise<User> => {
      const user = await userModel.create({
        user_name: args.user_name,
        email: args.email
      });
      if (!user) {
        throw new Error('User not found');
      }
      return user;
    },
    updateUser: async (
      _parent: undefined,
      args: { user_name: String, id: String },
    ): Promise<User> => {
      const user = await userModel.findByIdAndUpdate(
        args.id,
        args,
        { new: true },
      );
      if (!user) {
        throw new Error('User not found');
      }
      return user;
    },
    deleteUser: async (
      _parent: undefined,
      args: { id: string },
    ): Promise<User> => {
      const user = await userModel.findByIdAndDelete(args.id);
      if (!user) {
        throw new Error('User not found');
      }
      return user;
    },
  },
}; 