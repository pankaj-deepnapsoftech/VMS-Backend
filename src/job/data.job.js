import cron from "node-cron";
import { DataModel } from "../models/Data.model.js";
import { EmaliingModal } from "../models/Emailing.model.js";
import mongoose from "mongoose";
import { GetAllVulnerabilityData } from "../services/data.service.js";
import { saveJsonToExcel } from "../utils/JsonToexcelConverter.js";
import { SendMail } from "../utils/SendMain.js";
import fs from "fs";

// ================== Date Helpers ==================
function getCurrentWeekRange() {
  const now = new Date();
  const startOfWeek = new Date(now);
  const day = now.getDay(); // Sunday = 0, Monday = 1 ...
  const diffToMonday = day === 0 ? -6 : 1 - day;
  startOfWeek.setDate(now.getDate() + diffToMonday);
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  return { startOfWeek, endOfWeek };
}

function getCurrentMonthRange() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  return { startOfMonth, endOfMonth };
}

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

// ================== SLA Job ==================
export async function DataJob() {
  cron.schedule('0 18 * * *', async () => {
    const data = await DataModel.find({ SLA: null }).populate("Severity");
    if (data.length > 0) {
      await Promise.all(data.map(async (item) => {
        if (item.status !== "Closed") {
          const createdDate = new Date(item.createdAt);
          const newDate = new Date(createdDate);
          newDate.setDate(createdDate.getDate() + item?.Severity?.days);
          const today = new Date();
          const SLA = newDate >= today ? "MET" : "NOT MET";
          await DataModel.findByIdAndUpdate(item._id, { SLA }).exec();
        }
      }));
    }
  });
}

// ================== Email Jobs ==================
export async function DailyJob() {
  cron.schedule("05 16 * * *", async () => {
    const data = await EmaliingModal.find({ scheduled: { $exists: true } })
      .populate({ path: "users", select: "email" });
    await handleScheduleJobs(data);
    console.log("DailyJob executed");
  });
}

async function handleScheduleJobs(data) {
  await Promise.all(data.map(async (item) => {
    const [hour, minute] = item.time.split(":").map(Number);

    // Weekly Vulnerability Report
    if (item.schedule_type === "weekly" && item.report_type.toLowerCase().includes("vulnerabilitie")) {
      const dayIndex = daysOfWeek.indexOf(item.day); // 0-based index
      cron.schedule(`${minute} ${hour} * * ${dayIndex + 1}`, async () => {
        const { startOfWeek, endOfWeek } = getCurrentWeekRange();
        const finalFilter = {
          creator: new mongoose.Types.ObjectId(item.tenant),
          createdAt: { $gte: startOfWeek, $lt: endOfWeek }
        };

        const data = await GetAllVulnerabilityData(finalFilter);
        if (data.length === 0) return; // skip if no data

        const filePath = await saveJsonToExcel(data, `${item.tenant}-${item.report_type}-${item.schedule_type}.xlsx`);

        const attachments = [{
          filename: `${item.tenant}-${item.report_type}-${item.schedule_type}.xlsx`,
          path: filePath,
          contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        }];

        await Promise.all(item.users.map(async (user) => {
          await SendMail("VulnerableReport.ejs", { name: "test" }, {
            email: user.email,
            subject: "Weekly Vulnerable Data",
            attachments
          });
        }));

        fs.unlinkSync(filePath); // delete after sending
      });
    }

    // Monthly Vulnerability Report
    else if (item.schedule_type === "monthly" && item.report_type.toLowerCase().includes("vulnerabilitie")) {
      cron.schedule(`${minute} ${hour} ${item.date} * *`, async () => {
        const { startOfMonth, endOfMonth } = getCurrentMonthRange();
        const finalFilter = {
          creator: new mongoose.Types.ObjectId(item.tenant),
          createdAt: { $gte: startOfMonth, $lt: endOfMonth }
        };

        const data = await GetAllVulnerabilityData(finalFilter);
        if (data.length === 0) return;

        const filePath = await saveJsonToExcel(data, `${item.tenant}-${item.report_type}-${item.schedule_type}.xlsx`);

        const attachments = [{
          filename: `${item.tenant}-${item.report_type}-${item.schedule_type}.xlsx`,
          path: filePath,
          contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        }];

        await Promise.all(item.users.map(async (user) => {
          await SendMail("VulnerableReport.ejs", { name: "test" }, {
            email: user.email,
            subject: "Monthly Vulnerable Data",
            attachments
          });
        }));

        fs.unlinkSync(filePath); // delete after sending
      });
    }
  }));
}
