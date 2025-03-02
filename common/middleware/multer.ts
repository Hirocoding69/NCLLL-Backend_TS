import { default as mltr } from "multer";

const storage = mltr.memoryStorage();
export const multer = mltr({ storage });
const fuckMulter = multer.single("file") as any;

export default fuckMulter;
