export interface Location {
  lat: number;
  lng: number;
  address: string;
}

export interface HeritageSite {
  id: string;
  name: string;
  description: string;
  history: string;
  location: Location;
  images: string[];
  category: "Temple" | "Fort" | "Palace" | "Monument" | "Cave";
}

export interface ManuscriptTranslation {
  id: string;
  userId: string;
  originalText: string;
  translatedText: string;
  timestamp: string;
}
