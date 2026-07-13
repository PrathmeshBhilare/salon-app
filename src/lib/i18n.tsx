"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Language = "en" | "hi" | "mr";

// Simple dictionary
const translations: Record<string, Record<Language, string>> = {
  // Navigation
  "Home": { en: "Home", hi: "होम", mr: "मुख्यपृष्ठ" },
  "Book": { en: "Book", hi: "बुक", mr: "बुक करा" },
  "Offers": { en: "Offers", hi: "ऑफर", mr: "ऑफर" },
  "My Bookings": { en: "My Bookings", hi: "मेरी बुकिंग", mr: "माझे बुकिंग" },
  "Notifications": { en: "Notifications", hi: "सूचनाएँ", mr: "सूचना" },
  "Settings": { en: "Settings", hi: "सेटिंग्स", mr: "सेटिंग्स" },
  "Profile": { en: "Profile", hi: "प्रोफ़ाइल", mr: "प्रोफाइल" },
  "app.reception_mode": { en: "Reception Mode", hi: "रिसेप्शन मोड", mr: "रिसेप्शन मोड" },

  // Settings
  "settings.title": { en: "Settings", hi: "सेटिंग्स", mr: "सेटिंग्स" },
  "settings.subtitle": { en: "Personalise your experience.", hi: "अपना अनुभव अनुकूलित करें।", mr: "तुमचा अनुभव सानुकूल करा." },
  "settings.appearance": { en: "Appearance", hi: "दिखावट", mr: "देखावा" },
  "settings.theme": { en: "Light or dark theme", hi: "हल्का या गहरा थीम", mr: "हलका किंवा गडद थीम" },
  "settings.language": { en: "Language", hi: "भाषा", mr: "भाषा" },
  "settings.notifications": { en: "Notifications", hi: "सूचनाएँ", mr: "सूचना" },
  "settings.booking_updates": { en: "Booking updates", hi: "बुकिंग अपडेट", mr: "बुकिंग अद्यतने" },
  "settings.booking_updates_desc": { en: "Confirmations, check-ins & status", hi: "पुष्टिकरण, चेक-इन और स्थिति", mr: "पुष्टीकरण, चेक-इन आणि स्थिती" },
  "settings.offers": { en: "Offers & deals", hi: "ऑफर और सौदे", mr: "ऑफर आणि सौदे" },
  "settings.offers_desc": { en: "New promotions at your branch", hi: "आपकी शाखा में नए प्रचार", mr: "तुमच्या शाखेत नवीन जाहिराती" },
  "settings.reminders": { en: "Appointment reminders", hi: "अपॉइंटमेंट रिमाइंडर", mr: "अपॉइंटमेंट स्मरणपत्रे" },
  "settings.reminders_desc": { en: "Gentle nudges before your visit", hi: "आपकी यात्रा से पहले अनुस्मारक", mr: "तुमच्या भेटीपूर्वी स्मरणपत्रे" },
  "settings.account": { en: "Account", hi: "खाता", mr: "खाते" },
  "settings.change_password": { en: "Change Password", hi: "पासवर्ड बदलें", mr: "पासवर्ड बदला" },
  "settings.logout": { en: "Log out", hi: "लॉग आउट करें", mr: "लॉग आउट करा" },

  // Profile
  "profile.title": { en: "Profile", hi: "प्रोफ़ाइल", mr: "प्रोफाइल" },
  "profile.subtitle": { en: "Your Glow & Glamour identity.", hi: "आपकी ग्लो एंड ग्लैमर पहचान।", mr: "तुमची ग्लो आणि ग्लॅमर ओळख." },
  "profile.id_copied": { en: "User ID copied", hi: "यूज़र आईडी कॉपी हो गई", mr: "युझर आयडी कॉपी केला" },
  "profile.required_fields": { en: "Name and phone are required", hi: "नाम और फोन आवश्यक हैं", mr: "नाव आणि फोन आवश्यक आहेत" },
  "profile.updated": { en: "Profile updated", hi: "प्रोफ़ाइल अपडेट हो गई", mr: "प्रोफाइल अपडेट केले" },
  "profile.error": { en: "Failed to update profile", hi: "प्रोफ़ाइल अपडेट करने में विफल", mr: "प्रोफाइल अपडेट करण्यात अयशस्वी" },
  "profile.permanent_id": { en: "Your permanent User ID", hi: "आपकी स्थायी यूज़र आईडी", mr: "तुमचा कायमस्वरूपी युझर आयडी" },
  "profile.full_name": { en: "Full Name", hi: "पूरा नाम", mr: "पूर्ण नाव" },
  "profile.phone": { en: "Phone", hi: "फ़ोन", mr: "फोन" },
  "profile.email_readonly": { en: "Email (Cannot be changed)", hi: "ईमेल (बदला नहीं जा सकता)", mr: "ईमेल (बदलता येत नाही)" },
  "profile.address": { en: "Address (Optional)", hi: "पता (वैकल्पिक)", mr: "पत्ता (ऐच्छिक)" },

  // Common
  "common.edit": { en: "Edit", hi: "संपादित करें", mr: "संपादित करा" },
  "common.cancel": { en: "Cancel", hi: "रद्द करें", mr: "रद्द करा" },
  "common.save": { en: "Save", hi: "सहेजें", mr: "जतन करा" },
  "common.saving": { en: "Saving...", hi: "सहेजा जा रहा है...", mr: "जतन करत आहे..." },

  // Dashboard
  "dashboard.book_now": { en: "Book Now", hi: "अभी बुक करें", mr: "आता बुक करा" },
  "dashboard.upcoming": { en: "Upcoming", hi: "आगामी", mr: "आगामी" },
  "dashboard.no_upcoming": { en: "No upcoming bookings", hi: "कोई आगामी बुकिंग नहीं", mr: "कोणतेही आगामी बुकिंग नाही" },
  "dashboard.book_visit": { en: "Book a visit from the Home screen.", hi: "होम स्क्रीन से बुकिंग करें।", mr: "होम स्क्रीनवरून बुकिंग करा." },

  // Book
  "book.title": { en: "Book Appointment", hi: "अपॉइंटमेंट बुक करें", mr: "अपॉइंटमेंट बुक करा" },
  "book.subtitle": { en: "Schedule a visit at your convenience.", hi: "अपनी सुविधानुसार विज़िट शेड्यूल करें।", mr: "तुमच्या सोयीनुसार भेट ठरवा." },
  "book.choose_branch": { en: "Choose a branch", hi: "एक शाखा चुनें", mr: "एक शाखा निवडा" },
  "book.choose_services": { en: "Choose services", hi: "सेवाएं चुनें", mr: "सेवा निवडा" },
  "book.selected": { en: "selected", hi: "चयनित", mr: "निवडलेले" },
  "book.no_services": { en: "No services available for this branch.", hi: "इस शाखा के लिए कोई सेवा उपलब्ध नहीं है।", mr: "या शाखेसाठी कोणतीही सेवा उपलब्ध नाही." },
  "book.choose_date": { en: "Choose a date", hi: "तारीख चुनें", mr: "तारीख निवडा" },
  "book.choose_time": { en: "Choose a time", hi: "समय चुनें", mr: "वेळ निवडा" },
  "book.closed": { en: "Salon is closed on this day. Please pick another date.", hi: "इस दिन सैलून बंद है। कृपया कोई अन्य तारीख चुनें।", mr: "या दिवशी सलून बंद आहे. कृपया दुसरी तारीख निवडा." },
  "book.no_slots": { en: "No slots available", hi: "कोई स्लॉट उपलब्ध नहीं", mr: "कोणतेही स्लॉट उपलब्ध नाहीत" },
  "book.review": { en: "Review & confirm", hi: "समीक्षा और पुष्टि करें", mr: "पुनरावलोकन आणि पुष्टी करा" },
  "book.notes": { en: "Notes (optional)", hi: "नोट्स (वैकल्पिक)", mr: "टिपा (पर्यायी)" },
  "book.special_requests": { en: "Any special requests?", hi: "कोई विशेष अनुरोध?", mr: "काही विशेष विनंत्या?" },
  "book.button": { en: "Book Appointment", hi: "अपॉइंटमेंट बुक करें", mr: "अपॉइंटमेंट बुक करा" },
  "book.back": { en: "Back", hi: "पीछे", mr: "मागे" },
  "book.next": { en: "Next", hi: "आगे", mr: "पुढे" },

  // Shared Strings
  "branch": { en: "Branch", hi: "शाखा", mr: "शाखा" },
  "date": { en: "Date", hi: "तारीख", mr: "तारीख" },
  "time": { en: "Time", hi: "समय", mr: "वेळ" },
  "services": { en: "Services", hi: "सेवाएं", mr: "सेवा" },
  "duration": { en: "Duration", hi: "अवधि", mr: "कालावधी" },
  "total": { en: "Total", hi: "कुल", mr: "एकूण" },
  "min": { en: "min", hi: "मिनट", mr: "मिनिटे" },

  // My Bookings
  "bookings.history": { en: "History", hi: "इतिहास", mr: "इतिहास" },
  "bookings.cancel_title": { en: "Cancel appointment?", hi: "अपॉइंटमेंट रद्द करें?", mr: "अपॉइंटमेंट रद्द करू?" },
  "bookings.cancel_desc": { en: "will be cancelled.", hi: "रद्द कर दिया जाएगा।", mr: "रद्द केले जाईल." },
  "bookings.keep_it": { en: "Keep it", hi: "रखें", mr: "ठेवा" },
  "bookings.cancel_button": { en: "Cancel Booking", hi: "बुकिंग रद्द करें", mr: "बुकिंग रद्द करा" },
  "bookings.cancel": { en: "Cancel", hi: "रद्द करें", mr: "रद्द करा" },

  // Offers
  "offers.title": { en: "Offers & Packages", hi: "ऑफर और पैकेज", mr: "ऑफर आणि पॅकेजेस" },
  "offers.subtitle": { en: "Exclusive deals at {{branch}}", hi: "{{branch}} पर विशेष सौदे", mr: "{{branch}} वर खास सौदे" },
  "offers.no_offers": { en: "No offers available right now", hi: "अभी कोई ऑफर उपलब्ध नहीं है", mr: "सध्या कोणत्याही ऑफर उपलब्ध नाहीत" },
  "offers.no_offers_desc": { en: "Check back soon for new deals.", hi: "नए सौदों के लिए जल्द ही वापस आएं।", mr: "नवीन सौद्यांसाठी लवकरच परत तपासा." },
  "offers.valid_until": { en: "Valid until", hi: "तक वैध", mr: "पर्यंत वैध" },

  // Notifications
  "notifications.title": { en: "Notifications", hi: "सूचनाएँ", mr: "सूचना" },
  "notifications.subtitle": { en: "Stay updated with your bookings.", hi: "अपनी बुकिंग से अपडेट रहें।", mr: "तुमच्या बुकिंगसह अपडेट रहा." },
  "notifications.mark_all": { en: "Mark all as read", hi: "सभी को पढ़ा हुआ मानें", mr: "सर्व वाचलेले म्हणून चिन्हांकित करा" },
  "notifications.empty": { en: "You're all caught up", hi: "कोई नई सूचना नहीं", mr: "कोणतीही नवीन सूचना नाही" },
  "notifications.empty_desc": { en: "No new notifications right now.", hi: "अभी कोई नई सूचना नहीं है।", mr: "सध्या कोणतीही नवीन सूचना नाही." },
};

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, vars?: Record<string, string>) => string;
}

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("app_lang") as Language;
    if (saved && ["en", "hi", "mr"].includes(saved)) {
      setLanguageState(saved);
    }
    setMounted(true);
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("app_lang", lang);
  };

  const t = (key: string, vars?: Record<string, string>): string => {
    if (!translations[key]) return key;
    let str = translations[key][language] || translations[key]["en"];
    if (vars) {
      Object.entries(vars).forEach(([k, v]) => {
        str = str.replace(new RegExp(`{{${k}}}`, "g"), v);
      });
    }
    return str;
  };

  if (!mounted) {
    return <div style={{ visibility: "hidden" }}>{children}</div>;
  }

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useTranslation must be used within an I18nProvider");
  }
  return context;
}
