export interface FooterLink {
  label: string;
  href: string;
}

export interface FooterColumn {
  title: string;
  links: FooterLink[];
}

export const FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: 'Shop',
    links: [
      { label: 'Shop All', href: '/shop' },
      { label: 'New Arrivals', href: '/shop/new-arrivals' },
      { label: 'Best Sellers', href: '/shop/best-sellers' },
      { label: 'Deals & Offers', href: '/shop/deals' },
      { label: 'Shop by Brand', href: '/brands' },
      { label: 'Shop by Skin Concern', href: '/concerns' },
      { label: 'Shop by Routine', href: '/routines' },
      { label: 'Gift Sets', href: '/shop/gift-sets' },
    ],
  },
  {
    title: 'Prolific Experience',
    links: [
      { label: 'Digital Brand Showrooms', href: '/brands' },
      { label: 'AI Beauty Assistant', href: '/assistant' },
      { label: 'Build My Routine', href: '/routines/build' },
      { label: 'Skin Profile', href: '/skin-profile' },
      { label: 'Smart Refill Reminders', href: '/reminders' },
      { label: 'Skincare Calendar', href: '/routines/calendar' },
      { label: 'Live Consultations', href: '/consult/video' },
      { label: 'Prolific Rewards', href: '/rewards' },
    ],
  },
  {
    title: 'Help & Support',
    links: [
      { label: 'Help Centre', href: '/help' },
      { label: 'Track My Order', href: '/orders/track' },
      { label: 'Shipping & Delivery', href: '/delivery' },
      { label: 'Returns & Refunds', href: '/returns' },
      { label: 'Payment Information', href: '/help/payment' },
      { label: 'Product Authenticity', href: '/help/authenticity' },
      { label: 'Contact Us', href: '/contact' },
      { label: 'FAQs', href: '/help/faqs' },
    ],
  },
  {
    title: 'Learn',
    links: [
      { label: 'Skincare Guide', href: '/learn/skincare-guide' },
      { label: 'Beauty Academy', href: '/learn' },
      { label: 'Ingredient Dictionary', href: '/learn/ingredients' },
      { label: 'Skin Concerns Guide', href: '/learn/skin-education' },
      { label: 'Product Comparisons', href: '/learn/comparisons' },
      { label: 'Expert Advice', href: '/learn/expert-advice' },
      { label: 'Beauty Journal', href: '/journal' },
    ],
  },
  {
    title: 'Partner With Us',
    links: [
      { label: 'Sell on Prolific', href: '/partners/sell' },
      { label: 'Brand Partnerships', href: '/partners/brands' },
      { label: 'Create Your Brand Showroom', href: '/partners/showroom' },
      { label: 'Become a Consultant', href: '/consult/become-an-expert' },
      { label: 'Become a Delivery Partner', href: '/partners/delivery' },
      { label: 'Affiliate Programme', href: '/partners/affiliate' },
      { label: 'Influencer Partnerships', href: '/partners/influencers' },
      { label: 'Advertise with Prolific', href: '/partners/advertise' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Prolific', href: '/about' },
      { label: 'Our Mission', href: '/about/mission' },
      { label: 'Careers', href: '/careers' },
      { label: 'News & Updates', href: '/news' },
      { label: 'Contact', href: '/contact' },
    ],
  },
];

export const LEGAL_LINKS: FooterLink[] = [
  { label: 'Terms of Service', href: '/legal/terms' },
  { label: 'Privacy Policy', href: '/legal/privacy' },
  { label: 'Cookie Policy', href: '/legal/cookies' },
  { label: 'Refund Policy', href: '/legal/refunds' },
  { label: 'Shipping Policy', href: '/legal/shipping' },
  { label: 'Seller Terms', href: '/legal/seller-terms' },
  { label: 'Consultant Terms', href: '/legal/consultant-terms' },
  { label: 'Acceptable Use Policy', href: '/legal/acceptable-use' },
];

export const SOCIAL_LINKS = [
  { label: 'Instagram', href: 'https://instagram.com' },
  { label: 'TikTok', href: 'https://tiktok.com' },
  { label: 'YouTube', href: 'https://youtube.com' },
  { label: 'Facebook', href: 'https://facebook.com' },
  { label: 'X', href: 'https://x.com' },
];