export interface MegaMenuLink {
  label: string;
  href: string;
  description?: string;
  featured?: boolean;
}

export interface MegaMenuSection {
  title: string;
  links: MegaMenuLink[];
}

export interface NavItem {
  label: string;
  href: string;
  megaMenu?: MegaMenuSection[];
}

export const NAV_ITEMS: NavItem[] = [
  {
    label: 'Shop',
    href: '/shop',
    megaMenu: [
      {
        title: 'Shop',
        links: [
          { label: 'Shop All', href: '/shop' },
          { label: 'New Arrivals', href: '/shop/new-arrivals' },
          { label: 'Best Sellers', href: '/shop/best-sellers' },
          { label: 'Trending Now', href: '/shop/trending' },
          { label: 'Deals & Offers', href: '/shop/deals', featured: true },
        ],
      },
      {
        title: 'Categories',
        links: [
          { label: 'Skincare', href: '/shop/skincare' },
          { label: 'Body Care', href: '/shop/body-care' },
          { label: 'Sun Care', href: '/shop/sun-care' },
          { label: "Men's Care", href: '/shop/mens-care' },
          { label: 'Beauty Tools', href: '/shop/beauty-tools' },
          { label: 'Gift Sets', href: '/shop/gift-sets' },
        ],
      },
      {
        title: 'Shop by',
        links: [
          { label: 'Shop by Price', href: '/shop/price' },
          { label: 'Under ₦5,000', href: '/shop/price/under-5000' },
          { label: 'Under ₦10,000', href: '/shop/price/under-10000' },
          { label: 'Premium Beauty', href: '/shop/premium' },
        ],
      },
    ],
  },

  {
    label: 'Brands',
    href: '/brands',
    megaMenu: [
      {
        title: 'Discover',
        links: [
          { label: 'All Brands', href: '/brands' },
          { label: 'Featured Brands', href: '/brands/featured' },
          { label: 'New Brands', href: '/brands/new' },
        ],
      },
      {
        title: 'Featured Showrooms',
        links: [
          {
            label: 'Nivea Showroom',
            href: '/brands/nivea',
            featured: true,
          },
          {
            label: 'E45 Showroom',
            href: '/brands/e45',
            featured: true,
          },
          {
            label: 'CeraVe Showroom',
            href: '/brands/cerave',
            featured: true,
          },
          {
            label: 'Cetaphil Showroom',
            href: '/brands/cetaphil',
            featured: true,
          },
        ],
      },
      {
        title: 'More Brands',
        links: [
          {
            label: 'La Roche-Posay Showroom',
            href: '/brands/la-roche-posay',
          },
          {
            label: 'The Ordinary Showroom',
            href: '/brands/the-ordinary',
          },
          {
            label: 'Beauty of Joseon Showroom',
            href: '/brands/beauty-of-joseon',
          },
        ],
      },
    ],
  },

  {
    label: 'Skin Concerns',
    href: '/concerns',
    megaMenu: [
      {
        title: 'Common Concerns',
        links: [
          {
            label: 'Acne & Breakouts',
            href: '/concerns/acne',
            description: 'Clear, calm and balanced skin.',
          },
          {
            label: 'Dark Spots & Hyperpigmentation',
            href: '/concerns/dark-spots',
          },
          {
            label: 'Dry Skin',
            href: '/concerns/dry-skin',
          },
          {
            label: 'Oily Skin',
            href: '/concerns/oily-skin',
          },
          {
            label: 'Sensitive Skin',
            href: '/concerns/sensitive-skin',
          },
        ],
      },
      {
        title: 'Skin Goals',
        links: [
          {
            label: 'Uneven Skin Tone',
            href: '/concerns/uneven-tone',
          },
          {
            label: 'Dull Skin',
            href: '/concerns/dull-skin',
          },
          {
            label: 'Fine Lines & Ageing',
            href: '/concerns/ageing',
          },
          {
            label: 'Large Pores',
            href: '/concerns/large-pores',
          },
          {
            label: 'Dehydrated Skin',
            href: '/concerns/dehydrated',
          },
        ],
      },
      {
        title: 'Protection',
        links: [
          {
            label: 'Sun Protection',
            href: '/concerns/sun-protection',
            featured: true,
          },
          {
            label: 'Build Your Skin Profile',
            href: '/skin-profile',
            featured: true,
          },
          {
            label: 'Find My Products',
            href: '/concerns/recommendations',
          },
        ],
      },
    ],
  },

  {
    label: 'Routines',
    href: '/routines',
    megaMenu: [
      {
        title: 'Build',
        links: [
          {
            label: 'Build My Routine',
            href: '/routines/build',
            featured: true,
          },
          {
            label: 'AI Routine Builder',
            href: '/routines/ai-builder',
            featured: true,
          },
          {
            label: 'Shop Complete Routines',
            href: '/routines/complete',
          },
        ],
      },
      {
        title: 'Popular Routines',
        links: [
          {
            label: 'Morning Routine',
            href: '/routines/morning',
          },
          {
            label: 'Night Routine',
            href: '/routines/night',
          },
          {
            label: 'Acne Routine',
            href: '/routines/acne',
          },
          {
            label: 'Dry Skin Routine',
            href: '/routines/dry-skin',
          },
          {
            label: 'Hyperpigmentation Routine',
            href: '/routines/hyperpigmentation',
          },
        ],
      },
      {
        title: 'Skin Journey',
        links: [
          {
            label: 'Sensitive Skin Routine',
            href: '/routines/sensitive',
          },
          {
            label: 'Beginner Routines',
            href: '/routines/beginner',
          },
          {
            label: 'Skincare Calendar',
            href: '/routines/calendar',
          },
          {
            label: 'Routine Tracking',
            href: '/routines/tracking',
          },
          {
            label: 'Smart Refill Reminders',
            href: '/routines/reminders',
          },
        ],
      },
    ],
  },

  {
    label: 'Consult',
    href: '/consult',
    megaMenu: [
      {
        title: 'Get Advice',
        links: [
          {
            label: 'Book a Consultation',
            href: '/consult/book',
            featured: true,
          },
          {
            label: 'Find a Skincare Expert',
            href: '/consult/experts',
          },
          {
            label: 'Live Video Consultation',
            href: '/consult/video',
          },
          {
            label: 'Chat with an Expert',
            href: '/consult/chat',
          },
        ],
      },
      {
        title: 'My Consultations',
        links: [
          {
            label: 'My Appointments',
            href: '/account/appointments',
          },
          {
            label: 'Consultation History',
            href: '/account/consultations',
          },
        ],
      },
      {
        title: 'For Professionals',
        links: [
          {
            label: 'Become a Prolific Consultant',
            href: '/consult/become-an-expert',
            featured: true,
          },
          {
            label: 'Consultant Benefits',
            href: '/consult/benefits',
          },
        ],
      },
    ],
  },

  {
    label: 'Learn',
    href: '/learn',
    megaMenu: [
      {
        title: 'Beauty Academy',
        links: [
          {
            label: 'Skincare Guide',
            href: '/learn/skincare-guide',
            featured: true,
          },
          {
            label: 'Ingredient Dictionary',
            href: '/learn/ingredients',
            featured: true,
          },
          {
            label: 'Skin Education',
            href: '/learn/skin-education',
          },
          {
            label: 'Product Comparisons',
            href: '/learn/comparisons',
          },
        ],
      },
      {
        title: 'Guides',
        links: [
          {
            label: 'How-To Guides',
            href: '/learn/how-to',
          },
          {
            label: 'Skincare Routines',
            href: '/learn/routines',
          },
          {
            label: 'Expert Advice',
            href: '/learn/expert-advice',
          },
          {
            label: 'Beauty Journal',
            href: '/journal',
          },
        ],
      },
      {
        title: 'Watch',
        links: [
          {
            label: 'Videos',
            href: '/learn/videos',
          },
          {
            label: 'Tutorials',
            href: '/learn/tutorials',
          },
          {
            label: 'Expert Sessions',
            href: '/learn/expert-sessions',
          },
        ],
      },
    ],
  },

  {
    label: 'More',
    href: '/more',
    megaMenu: [
      {
        title: 'Prolific Experience',
        links: [
          {
            label: 'AI Beauty Assistant',
            href: '/assistant',
            featured: true,
          },
          {
            label: 'Skin Profile',
            href: '/skin-profile',
          },
          {
            label: 'Skin Journal',
            href: '/skin-journal',
          },
          {
            label: 'Smart Reminders',
            href: '/reminders',
          },
        ],
      },
      {
        title: 'Community',
        links: [
          {
            label: 'Community',
            href: '/community',
          },
          {
            label: 'Reviews',
            href: '/reviews',
          },
          {
            label: 'Customer Stories',
            href: '/stories',
          },
          {
            label: 'Beauty Community',
            href: '/community/beauty',
          },
        ],
      },
      {
        title: 'Rewards',
        links: [
          {
            label: 'Prolific Rewards',
            href: '/rewards',
            featured: true,
          },
          {
            label: 'Referral Programme',
            href: '/rewards/referrals',
          },
          {
            label: 'Prolific Plus',
            href: '/plus',
          },
        ],
      },
      {
        title: 'Support',
        links: [
          {
            label: 'Track My Order',
            href: '/orders/track',
          },
          {
            label: 'Delivery Information',
            href: '/delivery',
          },
          {
            label: 'Returns & Refunds',
            href: '/returns',
          },
          {
            label: 'Help Centre',
            href: '/help',
          },
          {
            label: 'Contact Us',
            href: '/contact',
          },
        ],
      },
    ],
  },
];
