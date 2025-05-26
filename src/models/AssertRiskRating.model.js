import {Schema,model} from "mongoose";


const AssetRiskRatingSchema = new Schema({
  data_asset:String,
  users_affected:String,
  PII:String,
  business_sensitive:String,
  regulation:String,
  security_confidentiality:String,
  security_integrity:String,
  security_availability:String,
  overall_risk_rating:String,
});

export const AssetRiskRatingModel = model("AssetRiskRating",AssetRiskRatingSchema);