import { NextResponse } from "next/server";
import {
  setInitialStudentPassword,
  StudentServiceError
} from "@/lib/student-service";

type RouteContext = {
  params: Promise<{
    publicId: string;
  }>;
};

export async function POST(request: Request, context: RouteContext) {
  const { publicId } = await context.params;

  try {
    const body = await request.json();
    const profile = await setInitialStudentPassword(publicId, body.password ?? "");

    return NextResponse.json({ profile });
  } catch (error) {
    if (error instanceof StudentServiceError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.error(error);
    return NextResponse.json({ error: "服务端处理失败。" }, { status: 500 });
  }
}
