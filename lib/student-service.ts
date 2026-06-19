import { randomUUID } from "crypto";
import type { EditableProfile, GraduatePhoto, GraduateProfile } from "@/lib/types";
import { hashPassword, verifyPassword } from "@/lib/password";
import {
  createSupabaseServerClient,
  studentPhotosBucket
} from "@/lib/supabase-server";

const maxPhotos = 5;
const maxPhotoSize = 5 * 1024 * 1024;
const allowedPhotoTypes = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"]
]);

type StudentRow = {
  public_id: string;
  name: string;
  major_class: string;
  signature: string;
  photos: unknown;
  password_hash: string | null;
};

export class StudentServiceError extends Error {
  constructor(
    public code:
      | "not_found"
      | "invalid_input"
      | "password_required"
      | "password_incorrect"
      | "photo_limit"
      | "upload_failed",
    message: string
  ) {
    super(message);
  }
}

export async function getStudentPublicProfile(publicId: string) {
  const row = await getStudentRow(publicId);

  if (!row) {
    return undefined;
  }

  return mapStudent(row);
}

export async function updateStudentProfile(
  publicId: string,
  profile: EditableProfile,
  password: string
) {
  const row = await requireStudentRow(publicId);
  const passwordHash = getVerifiedOrNewPasswordHash(row, password);
  const nextProfile = normalizeEditableProfile(profile);
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from("students")
    .update({
      name: nextProfile.name,
      major_class: nextProfile.majorClass,
      signature: nextProfile.signature,
      photos: nextProfile.photos,
      password_hash: passwordHash,
      password_set_at: passwordHash && !row.password_hash ? new Date().toISOString() : undefined,
      updated_at: new Date().toISOString()
    })
    .eq("public_id", publicId)
    .select("public_id,name,major_class,signature,photos,password_hash")
    .single<StudentRow>();

  if (error) {
    throw error;
  }

  return mapStudent(data);
}

export async function setInitialStudentPassword(publicId: string, password: string) {
  const row = await requireStudentRow(publicId);

  if (row.password_hash) {
    throw new StudentServiceError("invalid_input", "已设置过密码。");
  }

  const passwordHash = getVerifiedOrNewPasswordHash(row, password);
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from("students")
    .update({
      password_hash: passwordHash,
      password_set_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq("public_id", publicId)
    .select("public_id,name,major_class,signature,photos,password_hash")
    .single<StudentRow>();

  if (error) {
    throw error;
  }

  return mapStudent(data);
}

export async function uploadStudentPhoto(
  publicId: string,
  file: File,
  password: string
) {
  const row = await requireStudentRow(publicId);
  const photos = normalizePhotos(row.photos);
  const passwordHash = getVerifiedOrNewPasswordHash(row, password);

  if (photos.length >= maxPhotos) {
    throw new StudentServiceError("photo_limit", "照片最多保留 5 张。");
  }

  const extension = allowedPhotoTypes.get(file.type);

  if (!extension) {
    throw new StudentServiceError("invalid_input", "只支持 JPG、PNG 或 WebP 图片。");
  }

  if (file.size > maxPhotoSize) {
    throw new StudentServiceError("invalid_input", "单张照片不能超过 5MB。");
  }

  const supabase = createSupabaseServerClient();
  const path = `students/${publicId}/${Date.now()}-${randomUUID()}.${extension}`;
  const bytes = Buffer.from(await file.arrayBuffer());
  const { error: uploadError } = await supabase.storage
    .from(studentPhotosBucket)
    .upload(path, bytes, {
      contentType: file.type,
      upsert: false
    });

  if (uploadError) {
    throw new StudentServiceError("upload_failed", uploadError.message);
  }

  const { data: publicUrlData } = supabase.storage
    .from(studentPhotosBucket)
    .getPublicUrl(path);

  const nextPhotos = [
    ...photos,
    {
      path,
      url: publicUrlData.publicUrl,
      alt: "毕业照片",
      sort: photos.length + 1
    }
  ];

  const { data, error } = await supabase
    .from("students")
    .update({
      photos: nextPhotos,
      password_hash: passwordHash,
      password_set_at: passwordHash && !row.password_hash ? new Date().toISOString() : undefined,
      updated_at: new Date().toISOString()
    })
    .eq("public_id", publicId)
    .select("public_id,name,major_class,signature,photos,password_hash")
    .single<StudentRow>();

  if (error) {
    throw error;
  }

  return mapStudent(data);
}

function mapStudent(row: StudentRow): GraduateProfile {
  return {
    publicId: row.public_id,
    name: row.name,
    majorClass: row.major_class,
    signature: row.signature,
    photos: normalizePhotos(row.photos),
    passwordSet: Boolean(row.password_hash)
  };
}

async function getStudentRow(publicId: string) {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("students")
    .select("public_id,name,major_class,signature,photos,password_hash")
    .eq("public_id", publicId)
    .maybeSingle<StudentRow>();

  if (error) {
    throw error;
  }

  return data ?? undefined;
}

async function requireStudentRow(publicId: string) {
  const row = await getStudentRow(publicId);

  if (!row) {
    throw new StudentServiceError("not_found", "没有找到对应的留念页。");
  }

  return row;
}

function getVerifiedOrNewPasswordHash(row: StudentRow, password: string) {
  const normalizedPassword = password.trim();

  if (!normalizedPassword) {
    throw new StudentServiceError("password_required", "请输入编辑密码。");
  }

  if (row.password_hash) {
    if (!verifyPassword(normalizedPassword, row.password_hash)) {
      throw new StudentServiceError("password_incorrect", "密码不正确，资料未保存。");
    }

    return row.password_hash;
  }

  if (normalizedPassword.length < 4) {
    throw new StudentServiceError("invalid_input", "首次密码至少 4 位。");
  }

  return hashPassword(normalizedPassword);
}

function normalizeEditableProfile(profile: EditableProfile): EditableProfile {
  const name = profile.name.trim();
  const majorClass = profile.majorClass.trim();

  if (!name || !majorClass) {
    throw new StudentServiceError("invalid_input", "姓名和专业班级不能为空。");
  }

  return {
    name,
    majorClass,
    signature: profile.signature.trim(),
    photos: normalizePhotos(profile.photos).slice(0, maxPhotos)
  };
}

function normalizePhotos(value: unknown): GraduatePhoto[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((photo, index) => normalizePhoto(photo, index))
    .filter((photo): photo is GraduatePhoto => Boolean(photo))
    .slice(0, maxPhotos);
}

function normalizePhoto(value: unknown, index: number): GraduatePhoto | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const photo = value as Partial<GraduatePhoto>;

  if (typeof photo.url !== "string" || !photo.url) {
    return undefined;
  }

  return {
    url: photo.url,
    alt: typeof photo.alt === "string" && photo.alt ? photo.alt : "毕业照片",
    path: typeof photo.path === "string" ? photo.path : undefined,
    sort: typeof photo.sort === "number" ? photo.sort : index + 1
  };
}
