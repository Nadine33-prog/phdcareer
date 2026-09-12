import { prisma } from "./prisma.js";
import {
  DEFAULT_CATEGORY_MEDIA,
  MEDIA_LIBRARY,
  isCategoryTone,
  pickCategoryMedia,
  type CategoryMedia,
} from "../../../src/data/category-media.js";

export async function syncMediaLibrary() {
  for (const a of MEDIA_LIBRARY) {
    await prisma.mediaAsset.upsert({
      where: { src_kind: { src: a.src, kind: a.kind } },
      update: { alt: a.alt },
      create: { src: a.src, alt: a.alt, kind: a.kind },
    });
  }
}

function fromBody(body: Record<string, unknown>): Partial<CategoryMedia> {
  const gallery = Array.isArray(body.gallery) ? (body.gallery as unknown[]).map((x) => String(x)).filter(Boolean) : undefined;
  return {
    coverImage: typeof body.coverImage === "string" ? body.coverImage : undefined,
    heroImage: typeof body.heroImage === "string" ? body.heroImage : undefined,
    imageAlt: typeof body.imageAlt === "string" ? body.imageAlt : undefined,
    tone: isCategoryTone(body.tone) ? body.tone : undefined,
    gallery,
  };
}

export async function mediaForCreate(body: Record<string, unknown>): Promise<CategoryMedia> {
  const incoming = fromBody(body);
  if (incoming.coverImage) {
    const fallback = pickCategoryMedia();
    return {
      coverImage: incoming.coverImage,
      heroImage: incoming.heroImage || fallback.heroImage,
      imageAlt: incoming.imageAlt || fallback.imageAlt,
      tone: incoming.tone || fallback.tone,
      gallery: incoming.gallery?.length ? incoming.gallery : fallback.gallery,
    };
  }
  const used = (await prisma.category.findMany({ select: { coverImage: true } }))
    .map((c) => c.coverImage)
    .filter(Boolean);
  return pickCategoryMedia({ excludeCovers: used });
}

export function mediaForUpdate(body: Record<string, unknown>): Partial<CategoryMedia> {
  return fromBody(body);
}

export async function backfillCategoryMedia() {
  await syncMediaLibrary();
  const cats = await prisma.category.findMany();
  const used = cats.map((c) => c.coverImage).filter(Boolean);
  for (const cat of cats) {
    if (cat.coverImage) continue;
    const media = DEFAULT_CATEGORY_MEDIA[cat.id] ?? pickCategoryMedia({ excludeCovers: used });
    used.push(media.coverImage);
    await prisma.category.update({
      where: { id: cat.id },
      data: {
        coverImage: media.coverImage,
        heroImage: media.heroImage,
        imageAlt: media.imageAlt,
        tone: media.tone,
        gallery: media.gallery as never,
      },
    });
  }
}
