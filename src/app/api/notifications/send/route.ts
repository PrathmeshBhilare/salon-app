import { NextResponse } from "next/server";
import { adminMessaging, adminDb } from "@/lib/firebase-admin";

export async function POST(req: Request) {
  try {
    const { title, message, recipientUid, audience } = await req.json();

    let tokens: string[] = [];

    // If targeting a specific user
    if (recipientUid) {
      const userDoc = await adminDb.collection("users").doc(recipientUid).get();
      const token = userDoc.data()?.fcmToken;
      if (token) tokens.push(token);
    } 
    // If broadcasting to an audience (e.g. all customers for offers)
    else if (audience) {
      const snapshot = await adminDb.collection("users").where("role", "==", audience).get();
      snapshot.forEach((doc: any) => {
        const token = doc.data()?.fcmToken;
        if (token) tokens.push(token);
      });
    }

    if (tokens.length === 0) {
      return NextResponse.json({ success: true, message: "No FCM tokens found for recipients" });
    }

    const payload = {
      notification: {
        title,
        body: message,
      },
      tokens,
    };

    const response = await adminMessaging.sendEachForMulticast(payload);
    return NextResponse.json({ success: true, response });
  } catch (error: any) {
    console.error("FCM Send Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
