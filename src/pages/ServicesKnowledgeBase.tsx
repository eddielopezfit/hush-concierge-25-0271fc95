import { useEffect, useMemo, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { MessageSquare, Phone, Search, ArrowLeft } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { FooterSection } from "@/components/FooterSection";
import {
  servicesMenuData,
  getCategoryWithCrossRefs,
  ServiceCategory,
  ServiceItem,
} from "@/data/servicesMenuData";
import { useLuna } from "@/contexts/LunaContext";
import { ServiceCategoryId } from "@/types/concierge";

const PAGE_TITLE = "Services Knowledge Base — Hush Salon & Day Spa";
const PAGE_DESCRIPTION =
  "Browse every Hush Salon service: hair, nails, lashes, skincare, and massage. Descriptions, starting prices, and what's included.";

const ServicesKnowledgeBase = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { openChatWidget, mergeConcierge } = useLuna();

  const initialCategory = searchParams.get("category") || servicesMenuData[0].id;
  const [activeCategoryId, setActiveCategoryId] = useState<string>(initialCategory);
  const [query, setQuery] = useState<string>(searchParams.get("q") || "");

  // SEO: title + meta description
  useEffect(() => {
    const prevTitle = document.title;
    document.title = PAGE_TITLE;

    const setMeta = (name: string, content: string) => {
      let el = document.querySelector(`meta[name="${name}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute("name", name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };
    setMeta("description", PAGE_DESCRIPTION);

    // Canonical
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", `${window.location.origin}/services-knowledge-base`);

    return () => {
      document.title = prevTitle;
    };
  }, []);

  // Sync category & query into URL
  useEffect(() => {
    const next = new URLSearchParams(searchParams);
    next.set("category", activeCategoryId);
    if (query.trim()) next.set("q", query.trim());
    else next.delete("q");
    setSearchParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategoryId, query]);

  const activeCategory: ServiceCategory | null = useMemo(
    () => getCategoryWithCrossRefs(activeCategoryId) ?? null,
    [activeCategoryId]
  );

  const filteredCategory: ServiceCategory | null = useMemo(() => {
    if (!activeCategory) return null;
    const q = query.trim().toLowerCase();
    if (!q) return activeCategory;
    return {
      ...activeCategory,
      groups: activeCategory.groups
        .map((g) => ({
          ...g,
          items: g.items.filter(
            (it) =>
              it.name.toLowerCase().includes(q) ||
              (it.description ?? "").toLowerCase().includes(q) ||
              g.name.toLowerCase().includes(q)
          ),
        }))
        .filter((g) => g.items.length > 0),
    };
  }, [activeCategory, query]);

  const handleAskLuna = (service: ServiceCategory, group: string, item: ServiceItem) => {
    mergeConcierge({
      source: "Knowledge Base",
      categories: [service.id as ServiceCategoryId],
      category: service.id as ServiceCategoryId,
      group,
      item: item.name,
      price: item.price,
    });
    const descriptionLine = item.description
      ? `Here's the official description so you can read it back to me verbatim:\n"${item.description}"`
      : `(No stored description — share what you know about this service.)`;
    const prompt = [
      `I'm reading the Services Knowledge Base and have a question about **${item.name}** (${service.title} › ${group}) — listed at ${item.price}.`,
      "",
      descriptionLine,
      "",
      "Please:",
      "1. Confirm the description back to me in 1–2 sentences.",
      "2. Ask 2–3 quick follow-ups to tailor your guidance.",
      "3. Then suggest the best next step to book.",
    ].join("\n");
    try {
      sessionStorage.setItem("hush_chat_pending_prompt", prompt);
    } catch {
      /* ignore */
    }
    openChatWidget();
  };

  const totalServiceCount = useMemo(
    () => servicesMenuData.reduce((acc, c) => acc + c.groups.reduce((a, g) => a + g.items.length, 0), 0),
    []
  );

  return (
    <main className="bg-background min-h-screen flex flex-col">
      <Navigation />

      <section className="pt-28 md:pt-32 pb-12 px-6 border-b border-secondary/40">
        <div className="max-w-6xl mx-auto">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-body text-muted-foreground hover:text-gold transition-colors mb-6"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to home
          </Link>
          <p className="font-body text-xs uppercase tracking-[0.25em] text-gold/80 mb-3">
            Services Knowledge Base
          </p>
          <h1 className="font-display text-4xl md:text-5xl text-cream mb-4">
            Every service, fully <span className="text-gold-gradient">explained.</span>
          </h1>
          <p className="font-body text-base md:text-lg text-muted-foreground max-w-2xl mb-8">
            Browse all {totalServiceCount}+ services across hair, nails, lashes, skincare, and massage —
            with descriptions, starting prices, and what's included. Tap any service to ask Luna a follow-up.
          </p>

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search services, e.g. balayage, gel, microneedling…"
              aria-label="Search services"
              className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-card border border-secondary text-sm font-body text-cream placeholder:text-muted-foreground/60 focus:outline-none focus:border-gold/50 transition-colors"
            />
          </div>
        </div>
      </section>

      {/* Category nav */}
      <section className="sticky top-16 md:top-20 z-30 bg-background/95 backdrop-blur border-b border-secondary/40">
        <div className="max-w-6xl mx-auto px-6 py-3 overflow-x-auto">
          <div className="flex gap-2 min-w-max" role="tablist" aria-label="Service categories">
            {servicesMenuData.map((cat) => {
              const Icon = cat.icon;
              const isActive = cat.id === activeCategoryId;
              return (
                <button
                  key={cat.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveCategoryId(cat.id)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-body transition-all ${
                    isActive
                      ? "bg-gold/20 border-gold/60 text-gold"
                      : "bg-secondary/40 border-secondary text-cream/70 hover:text-cream hover:border-gold/30"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{cat.title}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="flex-1 px-6 py-10">
        <div className="max-w-6xl mx-auto">
          {!filteredCategory ? null : (
            <>
              <header className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                  {(() => {
                    const Icon = filteredCategory.icon;
                    return (
                      <div className="w-10 h-10 rounded-full bg-gold/15 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-gold" />
                      </div>
                    );
                  })()}
                  <h2 className="font-display text-3xl text-cream">{filteredCategory.title}</h2>
                </div>
                <p className="font-body text-sm text-muted-foreground">{filteredCategory.pricePreview}</p>
              </header>

              {filteredCategory.groups.length === 0 && (
                <div className="py-16 text-center border border-dashed border-secondary rounded-lg">
                  <p className="font-body text-sm text-muted-foreground mb-3">
                    No services in {filteredCategory.title} match "{query}".
                  </p>
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className="font-body text-sm text-gold hover:text-gold/80 underline underline-offset-4"
                  >
                    Clear search
                  </button>
                </div>
              )}

              <div className="space-y-10">
                {filteredCategory.groups.map((group) => (
                  <div key={group.name}>
                    <h3 className="font-display text-xl text-cream mb-4 pb-2 border-b border-secondary/60">
                      {group.name}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {group.items.map((item, idx) => {
                        const isConsult = item.price.toLowerCase().includes("consultation");
                        return (
                          <article
                            key={`${item.name}-${idx}`}
                            className="rounded-lg border border-secondary bg-card p-4 hover:border-gold/40 transition-colors"
                          >
                            <div className="flex justify-between items-start gap-3 mb-2">
                              <h4 className="font-display text-base text-cream leading-snug">
                                {item.name}
                              </h4>
                              <span
                                className={`font-body text-sm whitespace-nowrap shrink-0 ${
                                  isConsult ? "text-muted-foreground italic" : "text-gold font-medium"
                                }`}
                              >
                                {item.price}
                              </span>
                            </div>
                            {item.description && (
                              <p className="font-body text-[13px] text-muted-foreground/85 leading-relaxed mb-3">
                                {item.description}
                              </p>
                            )}
                            <button
                              type="button"
                              onClick={() => handleAskLuna(filteredCategory, group.name, item)}
                              className="inline-flex items-center gap-1.5 text-xs font-body text-gold hover:text-gold/80 transition-colors"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              Ask Luna about this
                            </button>
                          </article>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Notes & direct contacts */}
              {filteredCategory.notes && filteredCategory.notes.length > 0 && (
                <div className="mt-10 p-5 rounded-lg border border-secondary bg-secondary/20">
                  {filteredCategory.notes.map((note, i) => (
                    <p key={i} className="font-body text-sm text-cream/70 italic">
                      {note}
                    </p>
                  ))}
                </div>
              )}

              {filteredCategory.directContacts && filteredCategory.directContacts.length > 0 && (
                <div className="mt-8 p-5 rounded-lg border border-gold/25 bg-gold/5">
                  <h4 className="font-body text-xs uppercase tracking-wide text-gold mb-3">
                    Direct Booking Contacts
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {filteredCategory.directContacts.map((c) => (
                      <a
                        key={c.name}
                        href={`tel:${c.phone.replace(/[^0-9]/g, "")}`}
                        className="flex justify-between items-center py-2 px-3 rounded-md hover:bg-gold/10 transition-colors"
                      >
                        <span className="font-body text-sm text-cream/80">{c.name}</span>
                        <span className="font-body text-sm text-gold">{c.phone}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer CTAs */}
              <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-3 pt-8 border-t border-secondary/40">
                <button
                  type="button"
                  onClick={() => openChatWidget()}
                  className="btn-gold py-3 px-6 inline-flex items-center gap-2 text-sm"
                >
                  <MessageSquare className="w-4 h-4" />
                  Chat with Luna
                </button>
                <a
                  href="tel:+15203276753"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-lg border border-gold/30 text-gold hover:bg-gold/10 font-body text-sm transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  Call front desk (520) 327-6753
                </a>
              </div>
            </>
          )}
        </div>
      </section>

      <FooterSection />
    </main>
  );
};

export default ServicesKnowledgeBase;