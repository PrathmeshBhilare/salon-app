"use client";

import { Instagram, Linkedin, Globe, Mail, Phone, Code, Sparkles, Heart } from "lucide-react";
import { PageHeader, Section } from "@/components/ui-kit";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function DeveloperView() {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Crafted By" 
        subtitle="Meet the developer behind Glow & Glamour" 
      />

      <Card className="flex flex-col items-center gap-3 p-8 text-center shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent"></div>
        <div className="relative z-10 flex h-24 w-24 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg border-4 border-background">
          <Code className="h-10 w-10" />
        </div>
        <div className="relative z-10 space-y-1 mt-2">
          <h2 className="font-display text-2xl font-semibold">Prathmesh Bhilare</h2>
          <p className="text-sm font-medium text-primary flex items-center justify-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5" /> Software Developer & AI Engineer
          </p>
        </div>
        <p className="relative z-10 mt-4 text-sm text-muted-foreground max-w-lg leading-relaxed">
          Glow & Glamour Hair Studio was developed by Prathmesh Bhilare with a focus on creating a modern digital experience for salon management. The application combines appointment scheduling, live queue management, multi-branch support, and role-based dashboards into a responsive platform that is fast, reliable, and easy to use. Every feature has been designed to improve operational efficiency while providing a smooth experience for customers, staff, and owners.
        </p>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Section title="Contact & Socials">
          <Card className="divide-y divide-border overflow-hidden shadow-sm">
            <ContactLink 
              icon={Instagram} 
              label="Instagram" 
              value="@prathmesh.py" 
              href="https://www.instagram.com/prathmesh.py?igsh=MWJrM2psY3hqNXBwbQ==" 
            />
            <ContactLink 
              icon={Linkedin} 
              label="LinkedIn" 
              value="Prathmesh Bhilare" 
              href="https://www.linkedin.com/in/prathmesh-bhilare-a81159253/" 
            />
            <ContactLink 
              icon={Globe} 
              label="Portfolio" 
              value="View Portfolio" 
              href="https://prathmesh-portfolio.prathmeshbhilare52.workers.dev/" 
            />
            <ContactLink 
              icon={Phone} 
              label="Phone" 
              value="+91 9022536817" 
              href="tel:+919022536817" 
            />
            <ContactLink 
              icon={Mail} 
              label="Email" 
              value="prathmeshbhilare52@gmail.com" 
              href="mailto:prathmeshbhilare52@gmail.com" 
            />
          </Card>
        </Section>

        <div className="space-y-6">
          <Section title="Need Help?">
            <Card className="p-5 shadow-sm bg-primary/5 border-primary/10">
              <h3 className="font-medium mb-1">Having trouble with the application?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Contact the developer for technical support or feature requests.
              </p>
              <Button className="w-full gap-2" variant="outline" asChild>
                <a href="https://www.linkedin.com/in/prathmesh-bhilare-a81159253/" target="_blank" rel="noreferrer">
                  <Heart className="h-4 w-4" /> Get Support
                </a>
              </Button>
            </Card>
          </Section>

          <Section title="App Information">
            <Card className="divide-y divide-border overflow-hidden shadow-sm text-sm">
              <div className="flex items-center justify-between px-5 py-3">
                <span className="text-muted-foreground">Version</span>
                <span className="font-medium">1.0.0</span>
              </div>
              <div className="flex items-center justify-between px-5 py-3">
                <span className="text-muted-foreground">Last Updated</span>
                <span className="font-medium">July 2026</span>
              </div>
              <div className="flex items-center justify-between px-5 py-3">
                <span className="text-muted-foreground">Build</span>
                <span className="font-medium text-xs font-mono bg-muted px-2 py-0.5 rounded">STABLE</span>
              </div>
            </Card>
          </Section>
        </div>
      </div>

      <div className="text-center pt-8 pb-4 text-sm text-muted-foreground">
        <p className="flex items-center justify-center gap-1.5">
          Thank you for using <Heart className="h-3 w-3 text-rose-500 fill-rose-500" />
        </p>
        <p className="font-medium text-foreground mt-0.5">Glow & Glamour Hair Studio</p>
      </div>
    </div>
  );
}

function ContactLink({ 
  icon: Icon, 
  label, 
  value, 
  href 
}: { 
  icon: any; 
  label: string; 
  value: string; 
  href: string;
}) {
  return (
    <a 
      href={href} 
      target={href !== "#" ? "_blank" : undefined}
      rel={href !== "#" ? "noopener noreferrer" : undefined}
      className="flex items-center justify-between px-5 py-3.5 hover:bg-muted/50 transition-colors"
      onClick={(e) => {
        if (href === "#") e.preventDefault();
      }}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </div>
        <span className="text-sm font-medium">{label}</span>
      </div>
      <span className="text-sm text-muted-foreground truncate max-w-[50%]">{value}</span>
    </a>
  );
}
