import { Webhook } from "svix";
export const verifyClerkWebhook = (
    payload: string,
    headers: {
        "svix-id": string;
        "svix-timestamp": string;
        "svix-signature": string;
    }
) => {
    const clerkWebhookSecret = process.env.CLERK_WEBHOOK_SECRET;

    if (!clerkWebhookSecret) {
        throw new Error("CLERK_WEBHOOK_SECRET is not defined");
    }

    const wh = new Webhook(clerkWebhookSecret);

    console.log("Verified");
    return wh.verify(
        payload,
        headers
    );



}