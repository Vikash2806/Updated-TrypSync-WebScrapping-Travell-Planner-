import { Browser } from "puppeteer";
import { startLocationScraping } from "./scraping";

const BROWSER_WS = 
"wss://brd-customer-hl_c5df06fc-zone-vikitrips:b4py5g6dkyib@brd.superproxy.io:9222";

export const register = async () => {
  console.log("Server Started!"); 
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { Worker } = await import("bullmq");
    const { connection,jobsQueue,prisma} = await import("@/lib");
    // const { importQueue } = await import("./lib/queue");
      const puppeteer = await import("puppeteer");

    new Worker(
      "jobsQueue",
      async (job) => {
        console.log({job});
        let browser:undefined | Browser = undefined;
        try{
          console.log("Connecting to Scraping Browser...", );
           browser = await puppeteer.connect({
            browserWSEndpoint: BROWSER_WS,
          });
          const page = await browser.newPage();
          if (job.data.jobType.type === "location") {
            console.log("Connected! Navigating to " + job.data.url);
            await page.goto(job.data.url,{timeout: 60000});
            console.log("Navigated! Scraping page content...");
            const packages = await startLocationScraping(page);
            console.log({packages});

          }
        }
        catch (error) {
          console.log({ error });
          await prisma.jobs.update({
            where: { id: job.data.id },
            data: { isComplete: true, status: "failed" },
          });
        } finally {
          await browser?.close();
          console.log("Browser closed successfully.");
        }
       
      },{
        connection,
        concurrency: 10,
        removeOnComplete: { count: 1000 },
        removeOnFail: { count: 5000 },
      }
    );
  }
  
};
