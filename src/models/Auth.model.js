import { Schema, model } from 'mongoose';
import { hash } from 'bcrypt';

const AuthSchema = new Schema({
  full_name: { type: String, trim: true, required: true },
  email: { type: String, trim: true, required: true },
  phone: { type: String, trim: true, required: true },
  password: { type: String, required: true },
  role: {
    type: String,
    required: true,
    enum: ['ClientCISO', 'Assessor', 'Admin', 'ClientSME'],
  },
  otp: { type: Number },
  employee_approve: { type: Boolean, required: true, default: false },
  otp_expire: { type: Number },
  department: { type: String },
  owner: { type: Schema.Types.ObjectId, ref:"User" },
});

AuthSchema.pre('save', async function (next) {
  if (!this.isModified('password')) next();
  const hashPass = await hash(this.password, 12);
  this.password = hashPass;
});

AuthSchema.pre('findOneAndUpdate', async function (next) {
  if (!this._update.password) {
    return next();
  }
  try {
    const hashedPass = await hash(this._update.password, 12);
    this._update.password = hashedPass;
    next();
  } catch (error) {
    next(error);
  }
});

export const AuthModel = model('User', AuthSchema);
