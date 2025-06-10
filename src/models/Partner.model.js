import {Schema,model} from 'mongoose';


const PartnerSchema = new Schema({
  company_name: { type: String, required: true },
  website_url: { type: String, required: true },
  country: { type: String, required: true },
  state: { type: String, required: true },
  city: { type: String, required: true },
});


export const PartnersModel = model("Partner",PartnerSchema);



