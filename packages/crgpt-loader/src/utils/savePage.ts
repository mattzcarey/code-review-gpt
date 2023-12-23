import { existsSync, mkdirSync, writeFileSync } from "fs";
import { join } from "path";

export const savePage = (
  dataDir: string,
  pageIndex: number,
  ids: number[],
  vectors: Number[][],
  attributes: Record<string, any>
) => {
  if (!existsSync(dataDir)) {
    mkdirSync(dataDir);
  }

  writeFileSync(
    join(dataDir, `ids_${pageIndex}.json`),
    JSON.stringify(ids, null, 2)
  );
  writeFileSync(
    join(dataDir, `vectors_${pageIndex}.json`),
    JSON.stringify(vectors, null, 2)
  );
  writeFileSync(
    join(dataDir, `attributes_${pageIndex}.json`),
    JSON.stringify(attributes, null, 2)
  );
};
