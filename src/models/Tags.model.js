import {Schema, model} from 'mongoose';

const tagSchema = new Schema({
  tag_name:{type:String, required:true, unique:true},
  tag_description:{type:String},
  tag_score:{type:Number, default:0,required:true},
  tag_color:{type:String, default:'#000000'},
});

export const TagModel = model('Tag', tagSchema);