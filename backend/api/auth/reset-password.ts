import { handlePasswordUpdate } from "../_lib/authRoutes";
export default async function handler(req: any, res: any) { return handlePasswordUpdate(req, res); }
