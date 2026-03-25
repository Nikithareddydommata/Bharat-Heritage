import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Sparkles, Languages, History, Loader2, Upload, FileText } from 'lucide-react';
import { translateManuscript } from '../lib/gemini';
import Markdown from 'react-markdown';
import { auth, db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';

export default function Translator() {
  const [user] = useAuthState(auth);
  const [inputText, setInputText] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleTranslate = async () => {
    if (!inputText && !image) return;
    
    setLoading(true);
    setResult(null);
    try {
      let translation;
      if (image) {
        const base64Data = image.split(',')[1];
        const mimeType = image.split(';')[0].split(':')[1];
        translation = await translateManuscript({ data: base64Data, mimeType });
      } else {
        translation = await translateManuscript(inputText);
      }
      
      setResult(translation || "Translation failed.");

      // Save to history if logged in
      if (user && translation) {
        await addDoc(collection(db, 'translations'), {
          userId: user.uid,
          originalText: inputText || "Image Upload",
          translatedText: translation,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error("Translation error:", error);
      setResult("An error occurred during translation. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setInputText('');
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <header className="mb-16 text-center max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 bg-heritage-olive/10 text-heritage-olive text-[10px] uppercase tracking-[0.2em] font-bold rounded-full mb-6"
        >
          <Sparkles size={14} />
          <span>AI-Powered Linguistics</span>
        </motion.div>
        <h1 className="text-6xl md:text-7xl serif font-light tracking-tighter mb-6">
          Manuscript <span className="italic">Translator</span>
        </h1>
        <p className="text-lg text-heritage-ink/60 serif italic leading-relaxed">
          Unlock the secrets of ancient Indian scripts. Upload an image of a manuscript or type in text to receive an AI-powered translation and historical interpretation.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        <div className="bg-white rounded-[2rem] p-8 shadow-2xl shadow-heritage-ink/5 border border-heritage-olive/10">
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => setImage(null)}
              className={`flex-1 py-3 rounded-2xl text-sm font-bold uppercase tracking-widest transition-all ${!image ? 'bg-heritage-olive text-white' : 'bg-heritage-cream text-heritage-ink/40'}`}
            >
              <div className="flex items-center justify-center gap-2">
                <FileText size={18} />
                <span>Text Input</span>
              </div>
            </button>
            <div className="relative flex-1">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <div className={`w-full py-3 rounded-2xl text-sm font-bold uppercase tracking-widest transition-all text-center ${image ? 'bg-heritage-olive text-white' : 'bg-heritage-cream text-heritage-ink/40'}`}>
                <div className="flex items-center justify-center gap-2">
                  <Upload size={18} />
                  <span>{image ? 'Image Selected' : 'Upload Image'}</span>
                </div>
              </div>
            </div>
          </div>

          {image ? (
            <div className="mb-8">
              <div className="relative aspect-video rounded-2xl overflow-hidden border-2 border-dashed border-heritage-olive/20">
                <img src={image} alt="Manuscript" className="w-full h-full object-contain" />
                <button
                  onClick={() => setImage(null)}
                  className="absolute top-4 right-4 p-2 bg-heritage-ink/80 text-white rounded-full hover:bg-heritage-ink transition-colors"
                >
                  <Loader2 size={16} className="rotate-45" />
                </button>
              </div>
            </div>
          ) : (
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Enter ancient text or description of the script..."
              className="w-full h-64 bg-heritage-cream/50 rounded-2xl p-6 serif text-xl focus:ring-2 focus:ring-heritage-olive outline-none transition-all resize-none mb-8 placeholder:text-heritage-ink/20"
            />
          )}

          <button
            onClick={handleTranslate}
            disabled={loading || (!inputText && !image)}
            className="w-full py-4 bg-heritage-olive text-white rounded-2xl font-bold uppercase tracking-[0.2em] shadow-lg shadow-heritage-olive/20 hover:bg-heritage-olive/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                <span>Translating...</span>
              </>
            ) : (
              <>
                <Languages size={20} />
                <span>Begin Translation</span>
              </>
            )}
          </button>
        </div>

        <div className="lg:sticky lg:top-32">
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-heritage-olive text-white rounded-[2rem] p-10 shadow-2xl shadow-heritage-olive/20"
              >
                <div className="flex items-center gap-2 mb-8 opacity-60 uppercase tracking-[0.2em] text-[10px] font-bold">
                  <History size={14} />
                  <span>AI Interpretation</span>
                </div>
                <div className="prose prose-invert max-w-none serif text-lg leading-relaxed">
                  <Markdown>{result}</Markdown>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-[500px] border-2 border-dashed border-heritage-olive/20 rounded-[2rem] flex flex-col items-center justify-center text-center p-12"
              >
                <BookOpen size={48} className="text-heritage-olive opacity-10 mb-6" />
                <h3 className="serif italic text-2xl text-heritage-ink/40 mb-2">Awaiting Manuscript</h3>
                <p className="text-sm text-heritage-ink/30 uppercase tracking-widest font-medium">
                  The wisdom of the ancients is waiting to be revealed.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
