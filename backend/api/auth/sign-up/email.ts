import { handleEmailSignUp } from "../../_lib/authRoutes";
export default async function handler(req: any, res: any) { return handleEmailSignUp(req, res); }
