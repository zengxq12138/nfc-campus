import { NextResponse } from "next/server";
import {
  StudentServiceError,
  uploadStudentPhoto
} from "@/lib/student-service";

type RouteContext = {
  params: Promise<{
    publicId: string;
  }>;
};

export async function POST(request: Request, context: RouteContext) {
  const { publicId } = await context.params;

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const password = formData.get("password");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "请选择要上传的照片。" }, { status: 400 });
    }

    const profile = await uploadStudentPhoto(
      publicId,
      file,
      typeof password === "string" ? password : ""
    );

    return NextResponse.json({ profile });
  } catch (error) {
    if (error instanceof StudentServiceError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.code === "password_incorrect" ? 401 : 400 }
      );
    }

    console.error(error);
    return NextResponse.json({ error: "服务端处理失败。" }, { status: 500 });
  }
}
