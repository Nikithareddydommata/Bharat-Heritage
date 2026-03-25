import { HeritageSite } from './types';

export const SEED_HERITAGE_SITES: Omit<HeritageSite, 'id'>[] = [
  {
    name: "Hampi",
    description: "The capital of the Vijayanagara Empire, a UNESCO World Heritage site.",
    history: "Hampi was the capital of the Vijayanagara Empire in the 14th century. It was a prosperous, wealthy and grand city near the Tungabhadra River, with numerous temples, farms and trading markets. By 1500 CE, Hampi-Vijayanagara was the world's second-largest medieval-era city after Beijing.",
    location: {
      lat: 15.3350,
      lng: 76.4600,
      address: "Hampi, Karnataka, India"
    },
    images: [
      "https://picsum.photos/seed/hampi1/1200/800",
      "https://picsum.photos/seed/hampi2/1200/800"
    ],
    category: "Temple"
  },
  {
    name: "Ajanta Caves",
    description: "Ancient rock-cut Buddhist cave monuments dating from the 2nd century BCE.",
    history: "The Ajanta Caves are 30 rock-cut Buddhist cave monuments which date from the 2nd century BCE to about 480 CE in Aurangabad district of Maharashtra state of India. The caves include paintings and rock-cut sculptures described as among the finest surviving examples of ancient Indian art.",
    location: {
      lat: 20.5519,
      lng: 75.7033,
      address: "Aurangabad, Maharashtra, India"
    },
    images: [
      "https://picsum.photos/seed/ajanta1/1200/800",
      "https://picsum.photos/seed/ajanta2/1200/800"
    ],
    category: "Cave"
  },
  {
    name: "Amer Fort",
    description: "A majestic fort located in Amer, Rajasthan, known for its artistic style elements.",
    history: "Amer Fort is a fort located in Amer, Rajasthan, India. Amer is a town with an area of 4 square kilometres located 11 kilometres from Jaipur, the capital of Rajasthan. Located high on a hill, it is the principal tourist attraction in Jaipur.",
    location: {
      lat: 26.9855,
      lng: 75.8513,
      address: "Amer, Jaipur, Rajasthan, India"
    },
    images: [
      "https://picsum.photos/seed/amer1/1200/800",
      "https://picsum.photos/seed/amer2/1200/800"
    ],
    category: "Fort"
  }
];
