import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, addDoc, query, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { HeritageSite } from '../types';
import { SEED_HERITAGE_SITES } from '../seed';
import { motion } from 'motion/react';
import { MapPin, ArrowRight, Compass, Search, Sparkles, Loader2 } from 'lucide-react';
import { searchSitesWithAI } from '../services/geminiService';

export default function Home() {
  const [sites, setSites] = useState<HeritageSite[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [aiFilteredIds, setAiFilteredIds] = useState<string[] | null>(null);

  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function fetchSites() {
      try {
        const q = query(collection(db, 'heritage_sites'), limit(20));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          // Only attempt seeding if we are likely an admin or in dev
          // We'll try it, but catch the permission error specifically
          console.log("Seeding heritage sites...");
          try {
            for (const site of SEED_HERITAGE_SITES) {
              await addDoc(collection(db, 'heritage_sites'), site);
            }
            // Re-fetch after seeding
            const newSnapshot = await getDocs(q);
            const sitesData = newSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as HeritageSite));
            setSites(sitesData);
          } catch (seedError: any) {
            console.warn("Seeding failed, falling back to local data:", seedError);
            const fallbackData = SEED_HERITAGE_SITES.map((s, i) => ({ ...s, id: `seed-${i}` } as HeritageSite));
            setSites(fallbackData);
          }
        } else {
          const sitesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as HeritageSite));
          setSites(sitesData);
        }
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
    // If AI has filtered, only show those
    if (aiFilteredIds !== null) {
      return aiFilteredIds.includes(site.id);
    }

    // Otherwise fallback to basic keyword matching
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
        <motion.h1 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-6xl md:text-8xl serif font-light tracking-tighter mb-6"
        >
          Discover <span className="italic">Ancient</span> Bharat
        </motion.h1>
        <p className="text-lg text-heritage-ink/60 serif italic leading-relaxed mb-12">
          Journey through time and explore the architectural marvels, spiritual sanctuaries, and historical landmarks that define the soul of India.
        </p>

        <div className="relative max-w-2xl mx-auto flex gap-4">
          <div className="relative flex-grow">
            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-heritage-olive opacity-40">
              <Search size={20} />
            </div>
            <input
              type="text"
              placeholder="Ask AI: 'Temples in South India' or 'Mughal architecture'..."
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
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => {
              setSearchTerm('');
              setAiFilteredIds(null);
            }}
            className="mt-4 text-xs uppercase tracking-widest font-bold text-heritage-olive/60 hover:text-heritage-olive transition-colors"
          >
            Clear AI Results
          </motion.button>
        )}

        {!aiFilteredIds && !searchTerm && (
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <span className="text-xs uppercase tracking-widest font-bold text-heritage-ink/30 self-center mr-2">Try:</span>
            {['Temples in Karnataka', 'Ancient Caves', 'Mughal Architecture', 'Rajasthan Forts'].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => {
                  setSearchTerm(suggestion);
                  handleSearch(suggestion);
                }}
                className="px-4 py-1.5 bg-heritage-cream/50 border border-heritage-olive/10 rounded-full text-[10px] uppercase tracking-widest font-bold text-heritage-olive hover:bg-heritage-olive hover:text-white transition-all"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
        {filteredSites.map((site, index) => (
          <motion.div
            key={site.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group"
          >
            <Link to={`/place/${site.id}`} className="block">
              <div className="relative aspect-[3/4] overflow-hidden rounded-3xl mb-6 shadow-2xl shadow-heritage-ink/10">
                <img
                  src={site.images[0]}
                  alt={site.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-heritage-ink/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute top-6 left-6">
                  <span className="px-4 py-1.5 bg-heritage-cream/90 backdrop-blur-sm text-[10px] uppercase tracking-[0.2em] font-bold rounded-full text-heritage-olive shadow-sm">
                    {site.category}
                  </span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl serif italic group-hover:text-heritage-olive transition-colors">{site.name}</h3>
                  <ArrowRight size={20} className="text-heritage-olive opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </div>
                <div className="flex items-center gap-1 text-xs text-heritage-ink/40 uppercase tracking-widest font-medium">
                  <MapPin size={12} />
                  <span>{(site.location?.address || '').split(',').slice(-2).join(',')}</span>
                </div>
                <p className="text-sm text-heritage-ink/60 line-clamp-2 serif leading-relaxed">
                  {site.description}
                </p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
      
      {filteredSites.length === 0 && (
        <div className="text-center py-24">
          <p className="serif italic text-2xl text-heritage-ink/40">No sites found matching your search.</p>
        </div>
      )}
    </div>
  );
}
