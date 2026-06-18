import { Router, type Request, type Response } from "express";
import { prisma } from "../config/db";
import { verifyClerkWebhook } from "../services/clerkWebhookVerificationSerivce";
import { handleClerkWebhookEvent } from "../services/handleClerkWebhookEvent";
const router = Router()

router.post("/clerk", async (req: Request, res: Response) => {

    try {
        const payload = (req as any).rawBody 
            ? (req as any).rawBody.toString("utf8") 
            : JSON.stringify(req.body);
        const headers = {
            "svix-id": req.headers["svix-id"] as string,
            "svix-timestamp":
                req.headers["svix-timestamp"] as string,
            "svix-signature":
                req.headers["svix-signature"] as string,
        };

        const event = verifyClerkWebhook(payload, headers);

        console.log("Verified");
        const { type, data } = event as any;

        console.log(type);

        
        await handleClerkWebhookEvent(type, data);
        
        res.status(200).json({
            success: true,
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: "Invalid webhook",
        });
    }
});

export default router;