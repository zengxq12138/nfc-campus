import { NextResponse } from "next/server";
import {
  getStudentPublicProfile,
  StudentServiceError,
  updateStudentProfile
} from "@/lib/student-service";

type RouteContext = {
  params: Promise<{
    publicId: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { publicId } = await context.params;

  try {
    const profile = await getStudentPublicProfile(publicId);

    if (!profile) {
      return NextResponse.json({ error: "没有找到对应的留念页。" }, { status: 404 });
    }

    return NextResponse.json({ profile });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  const { publicId } = await context.params;

  try {
    const body = await request.json();
    const profile = await updateStudentProfile(publicId, body.profile, body.password ?? "");

    return NextResponse.json({ profile });
  } catch (error) {
    return handleRouteError(error);
  }
}

function handleRouteError(error: unknown) {
  if (error instanceof StudentServiceError) {
    return NextResponse.json(
      { error: error.message },
      { status: getStatusCode(error.code) }
    );
  }

  console.error(error);
  return NextResponse.json({ error: "服务端处理失败。" }, { status: 500 });
}

function getStatusCode(code: StudentServiceError["code"]) {
  if (code === "not_found") {
    return 404;
  }

  if (code === "password_incorrect") {
    return 401;
  }

  return 400;
}
