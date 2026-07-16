"use client";

import { useState } from "react";
import { Megaphone, Send } from "lucide-react";
import { useData } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function BroadcastDialog() {
  const { notify } = useData();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  async function handleSend() {
    if (!title.trim() || !message.trim()) return;
    setSending(true);
    try {
      await notify({
        audience: "customer",
        title: title.trim(),
        message: message.trim(),
        kind: "announcement",
      });
      setOpen(false);
      setTitle("");
      setMessage("");
    } catch (error) {
      console.error("Failed to send broadcast:", error);
    } finally {
      setSending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 border-primary/20 text-primary hover:bg-primary/5">
          <Megaphone className="h-4 w-4" />
          <span className="hidden sm:inline">Broadcast</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Broadcast Message</DialogTitle>
          <DialogDescription>
            Send an announcement to all customers signed into the app. They will receive it in their notifications.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium leading-none">
              Message Title
            </label>
            <Input
              id="title"
              placeholder="e.g. Holiday Special!"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="message" className="text-sm font-medium leading-none">
              Content
            </label>
            <textarea
              id="message"
              className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Type your announcement here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={sending}>
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={!title.trim() || !message.trim() || sending} className="gap-2">
            <Send className="h-4 w-4" />
            {sending ? "Sending..." : "Send Broadcast"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
