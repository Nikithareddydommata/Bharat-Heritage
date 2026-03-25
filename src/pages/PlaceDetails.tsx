import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { HeritageSite } from '../types';
import { SEED_HERITAGE_SITES } from '../seed';
import { motion } from 'motion/react';
import { MapPin, ArrowLeft, Calendar, History, Compass } from 'lucide-react';

export default function PlaceDetails() {
  const { id } = useParams();
  const [site, setSite] = useState<HeritageSite | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSite() {
      if (!id) return;
      try {
        // Handle seed data fallback
        if (id.startsWith('seed-')) {
          const index = parseInt(id.split('-')[1]);
          if (!isNaN(index) && SEED_HERITAGE_SITES[index]) {
            setSite({ id, ...SEED_HERITAGE_SITES[index] } as HeritageSite);
            setLoading(false);
            return;
          }
        }

        const docRef = doc(db, 'heritage_sites', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setSite({ id: docSnap.id, ...docSnap.data() } as HeritageSite);
        }
      } catch (error) {
        console.error("Error fetching site:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchSite();
  }, [id]);

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

  if (!site) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <h2 className="text-3xl serif italic mb-4">Site not found.</h2>
        <Link to="/" className="text-heritage-olive underline underline-offset-4">Return Home</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link to="/" className="inline-flex items-center gap-2 text-sm uppercase tracking-widest text-heritage-ink/40 hover:text-heritage-olive transition-colors mb-12">
        <ArrowLeft size={16} />
        <span>Back to Explorer</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        <div className="space-y-12">
          <header>
            <div className="flex items-center gap-3 mb-6">
              <span className="px-4 py-1.5 bg-heritage-olive text-white text-[10px] uppercase tracking-[0.2em] font-bold rounded-full">
                {site.category}
              </span>
              <div className="h-px flex-grow bg-heritage-olive/20" />
            </div>
            <h1 className="text-6xl md:text-8xl serif font-light tracking-tighter mb-6 italic leading-none">
              {site.name}
            </h1>
            <div className="flex items-center gap-2 text-heritage-ink/60 serif italic text-xl">
              <MapPin size={20} className="text-heritage-olive" />
              <span>{site.location.address}</span>
            </div>
          </header>

          <section className="prose prose-stone max-w-none">
            <div className="flex items-center gap-2 mb-4 text-heritage-olive uppercase tracking-widest text-xs font-bold">
              <History size={16} />
              <span>Historical Context</span>
            </div>
            <p className="text-xl serif leading-relaxed text-heritage-ink/80 first-letter:text-6xl first-letter:font-bold first-letter:mr-3 first-letter:float-left first-letter:serif first-letter:italic">
              {site.history}
            </p>
          </section>

          <div className="grid grid-cols-2 gap-8 py-8 border-y border-heritage-olive/10">
            <div>
              <span className="block text-[10px] uppercase tracking-[0.2em] font-bold text-heritage-ink/40 mb-2">Coordinates</span>
              <p className="font-mono text-sm">{site.location.lat.toFixed(4)}° N, {site.location.lng.toFixed(4)}° E</p>
            </div>
            <div>
              <span className="block text-[10px] uppercase tracking-[0.2em] font-bold text-heritage-ink/40 mb-2">Region</span>
              <p className="serif italic">{site.location.address.split(',').slice(-2)[0].trim()}</p>
            </div>
          </div>

          <div className="pt-4">
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(site.location.address)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 bg-heritage-olive text-white rounded-2xl font-bold uppercase tracking-[0.2em] shadow-lg shadow-heritage-olive/20 hover:bg-heritage-olive/90 transition-all"
            >
              <MapPin size={20} />
              <span>View on Google Maps</span>
            </a>
          </div>
        </div>

        <div className="space-y-8">
          {site.images.map((img, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.2 }}
              className={`relative overflow-hidden rounded-[2rem] shadow-2xl shadow-heritage-ink/20 ${idx === 0 ? 'aspect-[4/5]' : 'aspect-video'}`}
            >
              <img
                src={img}
                alt={`${site.name} ${idx + 1}`}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
