import {Schema,model} from "mongoose";


const AssetRiskRatingSchema = new Schema({
  data_asset:String,
  users_affected:String,
  PII:String,
  business_sensitive:String,
  regulation:String,
  security_category:String,
  overall_risk_rating:String,
});

export const AssetRiskRatingModel = model("AssetRiskRating",AssetRiskRatingSchema);