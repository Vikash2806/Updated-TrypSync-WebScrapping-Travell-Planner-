import { NextResponse } from "next/server";
import { jobsQueue } from "@/lib";
// import { scrapingQueue } from "../../../temp/queue";

// import { importQueue } from "../../../../lib/queue";

export async function POST(request: Request) {
  try {
    const { url, jobType } = await request.json();
    const response = await prisma.jobs.create({ data: { url, jobType } });

    await jobsQueue.add("new location", { url, jobType, id: response.id });
    return NextResponse.json(
      {
        jobCreated: true,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
    { message: "An unexpected error occurred." },
    { status: 500 }
  );
}
}
