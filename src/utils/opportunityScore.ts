/**
 * Opportunity scoring and Colombian contact utilities
 */

import { BusinessLead, ScoreBreakdown, WebsiteType } from '../types';

/**
 * Detects if a URL is actually a social network or generic directory rather than a proprietary website.
 */
export function classifyWebsite(url?: string): { hasOwnWebsite: boolean; websiteType: WebsiteType } {
  if (!url || !url.trim()) {
    return { hasOwnWebsite: false, websiteType: 'none' };
  }

  const cleanUrl = url.toLowerCase().trim();

  const socialOrDirectories = [
    'facebook.com',
    'fb.com',
    'fb.me',
    'instagram.com',
    'instagr.am',
    'linktr.ee',
    'tiktok.com',
    'twitter.com',
    'x.com',
    'wa.me',
    'whatsapp.com',
    'paginasamarillas.com',
    'cylex.com',
    'guiaslocales.com',
    'linkedin.com',
    'youtube.com',
    'google.com/maps',
    'maps.google.com',
    'foursquare.com',
    'tripadvisor.com',
  ];

  const isSocialOrDir = socialOrDirectories.some((domain) => cleanUrl.includes(domain));

  if (isSocialOrDir) {
    return { hasOwnWebsite: false, websiteType: 'social_or_directory' };
  }

  return { hasOwnWebsite: true, websiteType: 'own_website' };
}

/**
 * Formats a phone number for Colombia (+57) and produces a clean WhatsApp link.
 */
export function formatColombiaWhatsApp(rawPhone?: string, businessName = ''): {
  formattedNumber: string;
  cleanDigits: string;
  whatsappLink: string;
} {
  if (!rawPhone || !rawPhone.trim()) {
    return { formattedNumber: '', cleanDigits: '', whatsappLink: '' };
  }

  // Remove non-digits
  let digits = rawPhone.replace(/\D/g, '');

  // Colombia mobile numbers typically have 10 digits starting with 3 (e.g. 300 123 4567, 310, 315, 320, etc.)
  // Or may already start with 573...
  if (digits.startsWith('57') && digits.length === 12) {
    digits = digits.slice(2);
  } else if (digits.startsWith('057') && digits.length === 13) {
    digits = digits.slice(3);
  }

  // If standard 10 digit Colombian mobile
  let formatted = digits;
  if (digits.length === 10) {
    formatted = `+57 ${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
  } else if (digits.length > 7) {
    formatted = `+57 ${digits}`;
  }

  const cleanForWa = `57${digits}`;
  const defaultText = encodeURIComponent(
    `Hola${businessName ? ' ' + businessName : ''}, un gusto saludarte. Vi tu negocio y me gustaría consultarte algo sobre su captación de clientes digitales.`
  );
  const whatsappLink = digits.length >= 7 ? `https://wa.me/${cleanForWa}?text=${defaultText}` : '';

  return {
    formattedNumber: formatted,
    cleanDigits: cleanForWa,
    whatsappLink,
  };
}

/**
 * Calculates Opportunity Score (0 to 100) based on website status, conversion indicators, and business activity.
 */
export function calculateOpportunityScore(lead: Partial<BusinessLead>): {
  score: number;
  breakdown: ScoreBreakdown;
} {
  const breakdown: ScoreBreakdown = {
    noWebsiteBonus: 0,
    lacksWhatsAppBonus: 0,
    lacksBookingBonus: 0,
    lowSpeedBonus: 0,
    highActivityBonus: 0,
  };

  const { hasOwnWebsite, websiteType } = classifyWebsite(lead.websiteUri);

  // 1. Web presence bonus (up to 40 pts)
  if (websiteType === 'none') {
    breakdown.noWebsiteBonus = 40; // No website at all = highest need
  } else if (websiteType === 'social_or_directory') {
    breakdown.noWebsiteBonus = 35; // Dependent on social/directory = urgent need for real website
  } else {
    breakdown.noWebsiteBonus = 5; // Has website, but could be deficient
  }

  // 2. Conversion and analysis indicators (up to 30 pts)
  if (lead.analysis) {
    // Missing WhatsApp button
    if (!lead.analysis.checklist.hasWhatsAppButton) {
      breakdown.lacksWhatsAppBonus = 15;
    }

    // Missing online booking / appointments
    if (!lead.analysis.checklist.hasOnlineBooking) {
      breakdown.lacksBookingBonus = 15;
    }

    // Low speed or outdated copyright
    let speedBonus = 0;
    if (lead.analysis.pageSpeedScores && lead.analysis.pageSpeedScores.performance < 50) {
      speedBonus += 7;
    }
    if (lead.analysis.checklist.outdatedCopyright || !lead.analysis.checklist.hasHttps) {
      speedBonus += 3;
    }
    breakdown.lowSpeedBonus = Math.min(10, speedBonus);
  } else {
    // Preliminary estimate when not yet deeply analyzed
    if (!hasOwnWebsite) {
      breakdown.lacksWhatsAppBonus = 10;
      breakdown.lacksBookingBonus = 10;
    }
  }

  // 3. Business Activity / Solvency bonus (up to 20 pts)
  // An active business with reviews has budget to pay for digital services
  const rating = lead.rating || 0;
  const reviewCount = lead.userRatingCount || 0;

  if (lead.businessStatus === 'CLOSED_PERMANENTLY' || lead.businessStatus === 'CLOSED_TEMPORARILY') {
    breakdown.highActivityBonus = 0;
  } else if (reviewCount >= 25 && rating >= 4.0) {
    breakdown.highActivityBonus = 20; // High reputation, high customer flow
  } else if (reviewCount >= 10 && rating >= 3.8) {
    breakdown.highActivityBonus = 15;
  } else if (reviewCount >= 3) {
    breakdown.highActivityBonus = 8;
  } else {
    breakdown.highActivityBonus = 3;
  }

  // Sum components and clamp 0-100
  const rawScore =
    breakdown.noWebsiteBonus +
    breakdown.lacksWhatsAppBonus +
    breakdown.lacksBookingBonus +
    breakdown.lowSpeedBonus +
    breakdown.highActivityBonus;

  const score = Math.max(0, Math.min(100, Math.round(rawScore)));

  return { score, breakdown };
}
