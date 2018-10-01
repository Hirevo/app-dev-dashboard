import { resolve, join } from "path";
import { execSync } from "child_process";

export const base_path = resolve(execSync("pwd").toString().split("\n")[0]);

export default base_path;
