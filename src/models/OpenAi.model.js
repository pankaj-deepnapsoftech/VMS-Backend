import {Schema,model} from "mongoose";


const OpenAiHistory = new Schema({
  text:{type:String,required:true},
  sender_id:{type:Schema.Types.ObjectId,ref:"User",required:true},
  gpt_res:{type:String,Required:true},
  task:{type:Schema.Types.ObjectId,ref:"Data",required:true}
},{timestamps:true});

export const OpenAiHistoryModel = model("Openaihistory",OpenAiHistory);




