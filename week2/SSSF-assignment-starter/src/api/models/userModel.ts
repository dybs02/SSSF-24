import mongoose from 'mongoose';
import { User } from '../../types/DBTypes';


const userSchema = new mongoose.Schema<User>({
  user_name: {
    type: String,
  },
  email: {
    type: String,
    unique: true,
  },
  role: {
    type: String,
    enum: ['admin', 'user']
  },
  password: {
    type: String,
  },
});


export default mongoose.model<User>('User', userSchema);