import { handleEmailSignIn } from "../../_lib/authRoutes";
export default async function handler(req: any, res: any) { return handleEmailSignIn(req, res); }
