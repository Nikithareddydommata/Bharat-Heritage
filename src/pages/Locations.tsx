import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { HeritageSite } from '../types';
import { SEED_HERITAGE_SITES } from '../seed';
import { motion } from 'motion/react';
import { MapPin, Navigation, Compass, Search, Sparkles, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { searchSitesWithAI } from '../services/geminiService';

export default function Locations() {
  const [sites, setSites] = useState<HeritageSite[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [aiFilteredIds, setAiFilteredIds] = useState<string[] | null>(null);

  useEffect(() => {
    async function fetchSites() {
      try {
        const querySnapshot = await getDocs(collection(db, 'heritage_sites'));
        const sitesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as HeritageSite));
        setSites(sitesData);
      } catch (error: any) {
        console.error("Error fetching sites, falling back to local data:", error);
        const fallbackData = SEED_HERITAGE_SITES.map((s, i) => ({ ...s, id: `seed-${i}` } as HeritageSite));
        setSites(fallbackData);
      } finally {
        setLoading(false);
      }
    }
    fetchSites();
  }, []);

  const handleSearch = async (queryOverride?: string) => {
    const query = queryOverride || searchTerm;
    if (!query.trim()) {
      setAiFilteredIds(null);
      return;
    }

    setIsAiSearching(true);
    try {
      const resultIds = await searchSitesWithAI(query, sites);
      setAiFilteredIds(resultIds);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setIsAiSearching(false);
    }
  };

  const filteredSites = sites.filter(site => {
    if (aiFilteredIds !== null) {
      return aiFilteredIds.includes(site.id);
    }

    const search = searchTerm.toLowerCase();
    const name = (site.name || '').toLowerCase();
    const address = (site.location?.address || '').toLowerCase();
    const category = (site.category || '').toLowerCase();
    
    return name.includes(search) || address.includes(search) || category.includes(search);
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Compass size={48} className="text-heritage-olive opacity-20" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <header className="mb-16 text-center max-w-3xl mx-auto">
        <h1 className="text-6xl md:text-7xl serif font-light tracking-tighter mb-6">
          Heritage <span className="italic">Locations</span>
        </h1>
        <p className="text-lg text-heritage-ink/60 serif italic leading-relaxed">
          Explore the geographical spread of India's historical treasures. From the peaks of the North to the shores of the South.
        </p>
      </header>

      <div className="mb-12 relative max-w-2xl mx-auto flex gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-heritage-olive opacity-40" size={20} />
          <input
            type="text"
            placeholder="Search by name, city, or category..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              // Clear AI results when user starts typing something new
              setAiFilteredIds(null);
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="w-full pl-14 pr-6 py-4 bg-white rounded-2xl shadow-xl shadow-heritage-ink/5 border border-heritage-olive/10 focus:ring-2 focus:ring-heritage-olive outline-none transition-all serif text-lg"
          />
        </div>
        <button
          onClick={() => handleSearch()}
          disabled={isAiSearching}
          className="px-8 py-4 bg-heritage-olive text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-heritage-olive/90 transition-all shadow-xl shadow-heritage-olive/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isAiSearching ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <Sparkles size={20} />
          )}
          <span className="hidden sm:inline">Search</span>
        </button>
      </div>

      {aiFilteredIds && (
        <div className="text-center mb-8">
          <button
            onClick={() => {
              setSearchTerm('');
              setAiFilteredIds(null);
            }}
            className="text-xs uppercase tracking-widest font-bold text-heritage-olive/60 hover:text-heritage-olive transition-colors"
          >
            Clear AI Results
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {filteredSites.map((site, index) => (
          <motion.div
            key={site.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white rounded-3xl p-8 shadow-xl shadow-heritage-ink/5 border border-heritage-olive/5 hover:border-heritage-olive/20 transition-all group"
          >
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="w-32 h-32 rounded-2xl overflow-hidden flex-shrink-0 shadow-lg">
                <img src={site.images[0]} alt={site.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <div className="flex-grow space-y-4 text-center md:text-left">
                <div>
                  <h3 className="text-2xl serif italic mb-1">{site.name}</h3>
                  <div className="flex items-center justify-center md:justify-start gap-1 text-xs text-heritage-ink/40 uppercase tracking-widest font-medium">
                    <MapPin size={12} className="text-heritage-olive" />
                    <span>{site.location?.address || 'Location unavailable'}</span>
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                  <Link 
                    to={`/place/${site.id}`}
                    className="text-xs uppercase tracking-[0.2em] font-bold text-heritage-olive hover:underline underline-offset-4"
                  >
                    About Place
                  </Link>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(site.location?.address || site.name)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-heritage-cream text-heritage-olive rounded-full text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-heritage-olive hover:text-white transition-all"
                  >
                    <Navigation size={12} />
                    <span>Directions</span>
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredSites.length === 0 && (
        <div className="text-center py-24">
          <p className="serif italic text-2xl text-heritage-ink/40">No locations found matching your search.</p>
        </div>
      )}
    </div>
  );
}
