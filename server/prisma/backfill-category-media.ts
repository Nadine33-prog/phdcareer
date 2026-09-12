import { prisma } from "../src/lib/prisma.js";
import { backfillCategoryMedia } from "../src/lib/categoryMedia.js";

backfillCategoryMedia()
  .then(() => {
    console.log("✅ 配图库已同步，空分类已补图");
  })
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
