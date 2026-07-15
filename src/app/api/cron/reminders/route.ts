import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function GET() {
  try {
    const now = new Date();
    // In India time usually, but server time is UTC. We need to handle timezones.
    // Since Next.js API runs in UTC, we'll convert to IST (UTC+5:30)
    const istOffset = 5.5 * 60 * 60 * 1000;
    const nowIST = new Date(now.getTime() + istOffset);
    
    const todayISO = nowIST.toISOString().split("T")[0]; // YYYY-MM-DD
    
    const snapshot = await adminDb.collection("appointments")
      .where("status", "in", ["pending", "confirmed"])
      .get();
      
    let remindersSent = 0;

    for (const doc of snapshot.docs) {
      const appt = doc.data();
      const pastReminders = appt.remindersSent || [];
      const apptDate = appt.date; // YYYY-MM-DD
      const apptTime = appt.time; // HH:mm
      
      // Construct exact Date object for the appointment in IST
      // Note: This assumes date/time in DB is local to the salon
      const [hours, mins] = apptTime.split(":").map(Number);
      const apptDateTimeIST = new Date(`${apptDate}T00:00:00.000Z`);
      apptDateTimeIST.setUTCHours(hours, mins, 0, 0);

      const diffMs = apptDateTimeIST.getTime() - nowIST.getTime();
      const diffMins = diffMs / 60000;
      
      // 1. Check for 15-minute reminder (if diff is between 0 and 20 mins)
      if (diffMins > 0 && diffMins <= 20 && !pastReminders.includes("15min")) {
        await sendReminder(appt.customerUid, `Appointment in 15 mins!`, `Your appointment for ${appt.serviceIds?.length} services is starting soon at ${apptTime}.`);
        await doc.ref.update({ remindersSent: [...pastReminders, "15min"] });
        remindersSent++;
      }
      
      // 2. Check for 9 AM reminder
      // "morning 18 july at 9 AM" -> If today is the appointment day and it is >= 9:00 AM
      if (apptDate === todayISO && nowIST.getUTCHours() >= 9 && !pastReminders.includes("9am")) {
        await sendReminder(appt.customerUid, "Appointment Today!", `You have an appointment today at ${apptTime}.`);
        await doc.ref.update({ remindersSent: [...pastReminders, "9am"] });
        remindersSent++;
      }
    }

    return NextResponse.json({ success: true, remindersSent });
  } catch (err: any) {
    console.error("Cron Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

async function sendReminder(uid: string, title: string, message: string) {
  // First, create In-App notification
  await adminDb.collection("notifications").add({
    recipientUid: uid,
    title,
    message,
    kind: "reminder",
    read: false,
    createdAt: new Date().toISOString()
  });

  // Then send Push notification
  const userDoc = await adminDb.collection("users").doc(uid).get();
  const token = userDoc.data()?.fcmToken;
  if (token) {
    const { adminMessaging } = await import("@/lib/firebase-admin");
    await adminMessaging.sendEachForMulticast({
      notification: { title, body: message },
      tokens: [token]
    }).catch(console.error);
  }
}
