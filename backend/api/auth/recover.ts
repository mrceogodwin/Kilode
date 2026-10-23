import { handlePasswordRecovery } from "../_lib/authRoutes";
export default async function handler(req: any, res: any) { return handlePasswordRecovery(req, res); }
