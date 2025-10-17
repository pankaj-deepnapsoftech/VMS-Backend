import cron from "node-cron";
import { DataModel } from "../models/Data.model.js";

// Schedule: Every day at 6:00 PM

export function DataJob() {
  cron.schedule('0 18 * * *', async () => {
    const data = await DataModel.find({ SLA: null }).populate("Severity");
    if (data.length > 0) {
      let SLA = null;
      Promise.all(data.map(async (item) => {
        if (item.status !== "Closed") {
          const createdDate = new Date(item.createdAt);
          const newDate = new Date(createdDate);
          newDate.setDate(createdDate.getDate() + item?.Severity?.days);
          const today = new Date();
          SLA = newDate >= today ? "MET" : "NOT MET";
          await DataModel.findByIdAndUpdate(item._id, { SLA }).exec();
        }
      }));
    }
    console.log(data);
  });
}

