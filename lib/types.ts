export type CampusSpot = {
  slug: string;
  name: string;
  shortName: string;
  description: string;
  imageUrl: string;
  sourceUrl: string;
  imageAlt: string;
};

export type GraduatePhoto = {
  url: string;
  alt: string;
  path?: string;
  sort?: number;
};

export type GraduateProfile = {
  publicId: string;
  name: string;
  majorClass: string;
  signature: string;
  photos: GraduatePhoto[];
  passwordSet: boolean;
};

export type EditableProfile = Pick<
  GraduateProfile,
  "name" | "majorClass" | "signature" | "photos"
>;
