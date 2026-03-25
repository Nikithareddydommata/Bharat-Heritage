import React from 'react';
import { motion } from 'motion/react';
import { Info, Heart, Compass, History, Shield } from 'lucide-react';

export default function About() {
  const values = [
    {
      icon: Compass,
      title: "Exploration",
      desc: "We believe in the power of discovery, bringing hidden historical gems to the forefront of modern consciousness."
    },
    {
      icon: History,
      title: "Preservation",
      desc: "Our mission is to document and celebrate the rich cultural tapestry of India through digital storytelling."
    },
    {
      icon: Shield,
      title: "Authenticity",
      desc: "We strive for historical accuracy and linguistic integrity in every description and translation."
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <header className="mb-24 text-center max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 bg-heritage-olive/10 text-heritage-olive text-[10px] uppercase tracking-[0.2em] font-bold rounded-full mb-6"
        >
          <Info size={14} />
          <span>Our Mission</span>
        </motion.div>
        <h1 className="text-6xl md:text-8xl serif font-light tracking-tighter mb-8 italic">
          Bharat Heritage
        </h1>
        <p className="text-2xl text-heritage-ink/80 serif leading-relaxed">
          A digital sanctuary dedicated to the exploration, translation, and preservation of India's ancient legacy.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-16 mb-32">
        {values.map((value, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.2 }}
            className="text-center space-y-6"
          >
            <div className="w-16 h-16 bg-heritage-olive/10 rounded-full flex items-center justify-center mx-auto text-heritage-olive">
              <value.icon size={32} />
            </div>
            <h3 className="text-2xl serif italic">{value.title}</h3>
            <p className="text-heritage-ink/60 serif leading-relaxed">
              {value.desc}
            </p>
          </motion.div>
        ))}
      </div>

      <section className="relative overflow-hidden rounded-[3rem] bg-heritage-ink text-heritage-cream p-12 md:p-24">
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-4xl md:text-6xl serif italic mb-8">Bridging the gap between eras.</h2>
          <p className="text-lg opacity-70 serif leading-relaxed mb-12">
            Bharat Heritage Explorer was born from a passion for Indian history and the potential of modern technology. By combining AI-powered linguistics with curated historical data, we aim to make India's rich past accessible to everyone, everywhere.
          </p>
          <div className="flex items-center gap-2 text-sm uppercase tracking-[0.2em] font-bold opacity-50">
            <Heart size={16} className="text-red-400" />
            <span>Made with love for Bharat</span>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
          <Compass size={400} className="translate-x-1/2 -translate-y-1/4 rotate-12" />
        </div>
      </section>
    </div>
  );
}
