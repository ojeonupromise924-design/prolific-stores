'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  Search,
  User,
  ShoppingBag,
  Menu,
  X,
  ChevronDown,
  Heart,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

import { CartBadge } from './cart-badge';
import { CartDrawer } from './cart-drawer';
import { AccountMenu } from './account-menu';
import { AnnouncementBar } from './announcement-bar';
import { useAuthStore } from '../store/auth-store';
import { NAV_ITEMS, type NavItem } from '../lib/nav-data';
import { useWishlistStore } from '../store/wishlist-store';
import { useRouter } from 'next/navigation';
import { getProducts } from '../lib/products';
import { useDebounce } from '../hooks/use-debounce';
import type { StorefrontProduct } from '../lib/types';

export function Header() {
  const user = useAuthStore((s) => s.user);
  const wishlistCount = useWishlistStore((s) => s.wishlist?.items.length ?? 0);

  const [isScrolled, setIsScrolled] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);

  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 8);
    };

    window.addEventListener('scroll', onScroll);

    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  useEffect(() => {
    if (mobileOpen || searchOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen, searchOpen]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpenDropdown(null);
        setSearchOpen(false);
        setMobileOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const closeMenus = () => {
    setOpenDropdown(null);
    setMobileOpen(false);
    setMobileExpanded(null);
  };

  const handleNavEnter = (item: NavItem) => {
    if (item.megaMenu) {
      setOpenDropdown(item.label);
    } else {
      setOpenDropdown(null);
    }
  };

  return (
    <>
      <AnnouncementBar />

      <header
        ref={headerRef}
        className={`sticky top-0 z-50 border-b transition-all duration-300 ${
          isScrolled
            ? 'border-line bg-canvas/95 shadow-sm backdrop-blur-xl'
            : 'border-transparent bg-canvas'
        }`}
        onMouseLeave={() => setOpenDropdown(null)}
      >
        {/* Desktop Header */}
        <div className="mx-auto hidden h-19.5 max-w-360 items-center px-6 lg:flex xl:px-10">
          {/* Logo */}
          <Link
            href="/"
            className="group flex shrink-0 items-center"
            aria-label="Prolific Store home"
          >
            <span className="text-[23px] font-semibold tracking-[-0.04em] text-ink">
              Prolific
            </span>
            <span className="ml-1 text-[23px] font-light tracking-[-0.04em] text-forest-dark">
              Store
            </span>
          </Link>

          {/* Main Navigation */}
          <nav className="ml-auto flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => handleNavEnter(item)}
              >
                <Link
                  href={item.href}
                  className={`flex items-center gap-1.5 rounded-full px-3.5 py-2.5 text-[13px] font-medium transition-colors ${
                    openDropdown === item.label
                      ? 'bg-forest/10 text-ink'
                      : 'text-ink/70 hover:bg-black/[0.035] hover:text-ink'
                  }`}
                  aria-haspopup={item.megaMenu ? 'true' : undefined}
                  aria-expanded={
                    item.megaMenu
                      ? openDropdown === item.label
                      : undefined
                  }
                >
                  {item.label}

                  {item.megaMenu && (
                    <ChevronDown
                      size={13}
                      strokeWidth={1.8}
                      className={`transition-transform duration-200 ${
                        openDropdown === item.label ? 'rotate-180' : ''
                      }`}
                    />
                  )}
                </Link>
              </div>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="ml-5 flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-full text-ink/70 transition hover:bg-black/4 hover:text-ink"
              aria-label="Search"
            >
              <Search size={19} strokeWidth={1.7} />
            </button>

            <Link
href="/wishlist"
  className="relative flex h-10 w-10 items-center justify-center rounded-full text-ink/70 transition hover:bg-black/4 hover:text-ink"
  aria-label="Wishlist"
>
  <Heart size={19} strokeWidth={1.7} />
  {wishlistCount > 0 && (
    <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-clay text-[9px] font-bold text-white">
      {wishlistCount}
    </span>
  )}
</Link>


            <div className="flex h-10 w-10 items-center justify-center rounded-full text-ink/70 transition hover:bg-black/4 hover:text-ink">
              <CartBadge
                icon={<ShoppingBag size={19} strokeWidth={1.7} />}
              />
            </div>

                        <AccountMenu />
          </div>
        </div>

        {/* Mobile Header */}
        <div className="flex h-17 items-center justify-between px-5 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-full text-ink"
            aria-label="Open menu"
          >
            <Menu size={22} strokeWidth={1.8} />
          </button>

          <Link
            href="/"
            className="absolute left-1/2 -translate-x-1/2"
            aria-label="Prolific Store home"
          >
            <span className="text-[21px] font-semibold tracking-[-0.04em] text-ink">
              Prolific
            </span>
            <span className="ml-1 text-[21px] font-light tracking-[-0.04em] text-forest-dark">
              Store
            </span>
          </Link>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-full text-ink/70"
              aria-label="Search"
            >
              <Search size={20} strokeWidth={1.7} />
            </button>

            <div className="flex h-10 w-10 items-center justify-center text-ink/70">
              <CartBadge
                icon={<ShoppingBag size={20} strokeWidth={1.7} />}
              />
            </div>
          </div>
        </div>

        {/* Desktop Mega Menu */}
        {openDropdown && (
          <MegaMenu
            item={NAV_ITEMS.find(
              (item) => item.label === openDropdown
            )}
            onClose={() => setOpenDropdown(null)}
          />
        )}
      </header>

      {/* Mobile Navigation */}
      {mobileOpen && (
        <div className="fixed inset-0 z-70 lg:hidden">
          {/* Backdrop */}
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
            onClick={closeMenus}
          />

          {/* Drawer */}
          <aside className="absolute right-0 top-0 flex h-full w-[min(88vw,420px)] flex-col bg-canvas shadow-2xl">
            <div className="flex h-17 shrink-0 items-center justify-between border-b border-line px-5">
              <Link
                href="/"
                onClick={closeMenus}
                className="text-[21px] font-semibold tracking-[-0.04em] text-ink"
              >
                Prolific
                <span className="ml-1 font-light text-forest-dark">
                  Store
                </span>
              </Link>

              <button
                type="button"
                onClick={closeMenus}
                className="flex h-10 w-10 items-center justify-center rounded-full text-ink"
                aria-label="Close menu"
              >
                <X size={22} strokeWidth={1.8} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-5">
              <div className="mb-5 rounded-2xl bg-forest/10 p-5">
                <div className="mb-2 flex items-center gap-2 text-forest-dark">
                  <Sparkles size={17} />
                  <span className="text-xs font-semibold uppercase tracking-[0.12em]">
                    Prolific Beauty
                  </span>
                </div>

                <p className="text-sm leading-6 text-ink/65">
                  Discover products and routines made for your skin.
                </p>

                <Link
                  href="/assistant"
                  onClick={closeMenus}
                  className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-ink"
                >
                  Try AI Beauty Assistant
                  <ArrowRight size={15} />
                </Link>
              </div>

              <nav className="divide-y divide-line">
                {NAV_ITEMS.map((item) => {
                  const expanded = mobileExpanded === item.label;

                  return (
                    <div key={item.label}>
                      <div className="flex items-center justify-between py-4">
                        <Link
                          href={item.href}
                          onClick={closeMenus}
                          className="text-[15px] font-medium text-ink"
                        >
                          {item.label}
                        </Link>

                        {item.megaMenu && (
                          <button
                            type="button"
                            onClick={() =>
                              setMobileExpanded(
                                expanded ? null : item.label
                              )
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-full text-ink/60"
                            aria-label={`Expand ${item.label}`}
                            aria-expanded={expanded}
                          >
                            <ChevronDown
                              size={18}
                              className={`transition-transform ${
                                expanded ? 'rotate-180' : ''
                              }`}
                            />
                          </button>
                        )}
                      </div>

                      {item.megaMenu && expanded && (
                        <div className="pb-4">
                          {item.megaMenu.map((section) => (
                            <div key={section.title} className="mb-5 last:mb-0">
                              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-ink/40">
                                {section.title}
                              </p>

                              <div className="space-y-1">
                                {section.links.map((link) => (
                                  <Link
                                    key={link.label}
                                    href={link.href}
                                    onClick={closeMenus}
                                    className={`block rounded-lg px-2 py-2.5 text-sm ${
                                      link.featured
                                        ? 'font-medium text-forest-dark'
                                        : 'text-ink/65'
                                    }`}
                                  >
                                    {link.label}
                                  </Link>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </nav>

              <div className="mt-7 grid grid-cols-2 gap-3">
                <Link
  href="/wishlist"
  onClick={closeMenus}
  className="relative rounded-xl border border-line bg-white px-4 py-4 text-center text-sm font-medium"
>
  <div className="relative mx-auto mb-2 w-fit">
    <Heart size={17} className="text-ink/60" />
    {wishlistCount > 0 && (
      <span className="absolute -right-3 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-clay text-[9px] font-bold text-white">
        {wishlistCount}
      </span>
    )}
  </div>
  Wishlist
</Link>



                <Link
                  href={user ? '/account' : '/login'}
                  onClick={closeMenus}
                  className="rounded-xl border border-line bg-white px-4 py-4 text-center text-sm font-medium"
                >
                  <User
                    size={17}
                    className="mx-auto mb-2 text-ink/60"
                  />
                  Account
                </Link>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* Search Overlay */}
      {searchOpen && (
        <SearchOverlay onClose={() => setSearchOpen(false)} />
      )}

      <CartDrawer />
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Mega Menu                                                                   */
/* -------------------------------------------------------------------------- */

function MegaMenu({
  item,
  onClose,
}: {
  item?: NavItem;
  onClose: () => void;
}) {
  if (!item?.megaMenu) {
    return null;
  }

  return (
    <div
      className="absolute left-0 right-0 top-full hidden border-b border-line bg-white shadow-[0_18px_45px_rgba(0,0,0,0.08)] lg:block"
      onMouseEnter={() => {}}
    >
      <div className="mx-auto max-w-360 px-10 py-8">
        <div className="mb-7 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-forest-dark">
              Prolific Store
            </p>

            <h2 className="mt-1 text-xl font-medium tracking-tight text-ink">
              {item.label}
            </h2>
          </div>

          <Link
            href={item.href}
            onClick={onClose}
            className="group flex items-center gap-2 text-xs font-medium text-ink/60 transition hover:text-ink"
          >
            Explore {item.label}
            <ArrowRight
              size={14}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </Link>
        </div>

        <div
          className={`grid gap-x-10 gap-y-8 ${
            item.megaMenu.length >= 4
              ? 'grid-cols-4'
              : 'grid-cols-3'
          }`}
        >
          {item.megaMenu.map((section) => (
            <div key={section.title}>
              <h3 className="mb-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-ink/40">
                {section.title}
              </h3>

              <div className="space-y-1">
                {section.links.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={onClose}
                    className={`group block rounded-xl px-3 py-2.5 transition ${
                      link.featured
                        ? 'bg-forest/[0.07] hover:bg-forest/10'
                        : 'hover:bg-black/[0.035]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span
                        className={`text-[13px] ${
                          link.featured
                            ? 'font-medium text-forest-dark'
                            : 'font-medium text-ink/75 group-hover:text-ink'
                        }`}
                      >
                        {link.label}
                      </span>

                      {link.featured && (
                        <ArrowRight
                          size={13}
                          className="shrink-0 text-forest-dark opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100"
                        />
                      )}
                    </div>

                    {link.description && (
                      <p className="mt-1 text-[11px] leading-4 text-ink/40">
                        {link.description}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom promotional strip */}
        <div className="mt-8 flex items-center justify-between rounded-2xl bg-[#f2f5f1] px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-forest-dark">
              <Sparkles size={17} />
            </div>

            <div>
              <p className="text-xs font-semibold text-ink">
                Not sure what is right for your skin?
              </p>
              <p className="mt-0.5 text-[11px] text-ink/50">
                Let our AI Beauty Assistant help you find your match.
              </p>
            </div>
          </div>

          <Link
            href="/assistant"
            onClick={onClose}
            className="hidden items-center gap-2 rounded-full bg-ink px-4 py-2.5 text-xs font-medium text-white transition hover:bg-forest-dark sm:flex"
          >
            Find My Products
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Search                                                                      */
/* -------------------------------------------------------------------------- */

function SearchOverlay({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 350);
  const [results, setResults] = useState<StorefrontProduct[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();

    useEffect(() => {
    let cancelled = false;

    void (async () => {
      if (!debouncedQuery.trim()) {
        if (!cancelled) setResults([]);
        return;
      }

      if (!cancelled) setIsSearching(true);
      try {
        const res = await getProducts({ search: debouncedQuery, limit: 6 });
        if (!cancelled) setResults(res.data);
      } catch {
        if (!cancelled) setResults([]);
      } finally {
        if (!cancelled) setIsSearching(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  function handleViewAll() {
    if (!query.trim()) return;
    router.push(`/search?q=${encodeURIComponent(query)}`);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-100 bg-canvas/95 backdrop-blur-xl">
      <button
        type="button"
        onClick={onClose}
        className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full border border-line bg-white text-ink sm:right-8 sm:top-8"
        aria-label="Close search"
      >
        <X size={21} strokeWidth={1.8} />
      </button>

      <div className="mx-auto flex h-full w-full max-w-4xl flex-col px-6 pt-28 sm:px-10 sm:pt-40">
        <div className="mb-4 flex items-center gap-2 text-forest-dark">
          <Search size={17} />
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em]">
            Search Prolific Store
          </span>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleViewAll();
          }}
          className="border-b-2 border-ink/15 focus-within:border-ink"
        >
          <input
            autoFocus
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Try “cream for dark spots under ₦10,000”"
            className="w-full bg-transparent py-5 text-xl font-medium tracking-tight text-ink outline-none placeholder:text-ink/25 sm:text-3xl"
          />
        </form>

        {!query.trim() && (
          <div className="mt-8">
            <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-ink/40">
              Popular searches
            </p>
            <div className="flex flex-wrap gap-2">
              {['Best sunscreen', 'Dark spots', 'Acne care', 'Dry skin', 'CeraVe', 'Nivea'].map((search) => (
                <button
                  key={search}
                  type="button"
                  onClick={() => setQuery(search)}
                  className="rounded-full border border-line bg-white px-4 py-2.5 text-xs font-medium text-ink/65 transition hover:border-forest hover:text-ink"
                >
                  {search}
                </button>
              ))}
            </div>
          </div>
        )}

        {query.trim() && (
          <div className="mt-8 flex-1 overflow-y-auto">
            {isSearching ? (
              <p className="text-sm text-ink/40">Searching...</p>
            ) : results.length === 0 ? (
              <p className="text-sm text-ink/40">No products found for &quot;{query}&quot;.</p>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {results.map((product) => (
                    <Link
                      key={product.id}
                      href={`/shop/${product.slug}`}
                      onClick={onClose}
                      className="flex items-center gap-3 rounded-xl border border-line bg-white p-3 hover:border-forest/40"
                    >
                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-[#f2f5f1]">
                        {product.primaryImage && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={product.primaryImage.thumbnailUrl}
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-xs font-medium text-ink">{product.name}</p>
                        <p className="text-xs text-ink/50">₦{product.price.toLocaleString()}</p>
                      </div>
                    </Link>
                  ))}
                </div>

                <button
                  onClick={handleViewAll}
                  className="mt-6 flex items-center gap-2 text-sm font-medium text-forest-dark hover:underline"
                >
                  View all results for &quot;{query}&quot; →
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}