import QS from "emfit-qs";
import dotenv from "dotenv";

dotenv.load();

const qs = new QS();
const apiVersion = 4;

interface NavigationDataItem {
  id: string;
  uid: number;
  date: string;
  weekday: string;
  dur: string;
}

interface PeriodData {
  id: string;
  sleep_duration: number;
  time_in_bed_duration: number;
  time_start: number; // time went to bed
  time_end: number; // time left bed
  navigation_data: NavigationDataItem[];
}

(async () => {
  const result = await qs.login(
    process.env.QS_USERNAME,
    process.env.QS_PASSWORD,
  );
  const data: PeriodData = await qs.latest(process.env.DEVICE_ID, apiVersion);

  const allDurations: PeriodData[] = await Promise.all(
    data.navigation_data.reverse().map(async (dataItem: NavigationDataItem) => {
      return await qs.presence(dataItem.id, process.env.DEVICE_ID, apiVersion);
    }),
  );

  const durationItems = allDurations.map(item => ({
    duration: item.sleep_duration,
    startDate: new Date(item.time_start * 1000).toLocaleDateString(),
    hours: Math.floor(item.sleep_duration / 3600),
    minutes: Math.floor((item.sleep_duration % 3600) / 60),
  }));

  console.log(durationItems);
})();
