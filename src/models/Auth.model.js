import { Schema, model } from 'mongoose';
import { hash } from 'bcrypt';



const securityQuestion = new Schema({
  question:{type:String,required:true},
  answer:{type:String,required:true}
});

const AuthSchema = new Schema({
  fname: { type: String, trim: true, required: true },
  lname: { type: String, trim: true, required: true },
  phone: { type: String, trim: true, required: true },
  email: { type: String, trim: true, required: true },
  password: { type: String },
  tenant: { type: Schema.Types.ObjectId, ref: 'Tenant' },
  email_verification: { type: Boolean, required: true, default: false },
  deactivate:{type:Boolean,required:true,default:false},
  mustChangePassword:{type:Boolean,required:true,default:false},
  security_questions:{type:[securityQuestion]},
  profile:{type:String},
  isPasswordSet:{type:Boolean,required:true,default:false}

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




const PasswordHistory = new Schema({
  user_id:{type:Schema.Types.ObjectId,ref:"User",required:true},
  password:{type:String,required:true}
},{
  timestamps:true
});

export const PasswordHistoryModel = model("PasswordHistory",PasswordHistory);
