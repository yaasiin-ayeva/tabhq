import { Router } from "express";
import flutterwaveWebhook from "./flutterwave.webhook";

const router = Router();

router.use("/flutterwave", flutterwaveWebhook);

export default router;
