// Curated viewpoints shown on the landing page. Photos are Wikimedia Commons
// files saved under public/images/destinations (CC licenses require the
// credit below, which Destinations.tsx and the Footer both render).

export const DESTINATION_REGIONS = [
  'All',
  'Hill Country',
  'Cultural Triangle',
  'Coast',
  'Wildlife & Nature',
] as const;
export type DestinationRegion = (typeof DESTINATION_REGIONS)[number];

export type PhotoCredit = { title: string; author: string; license: string; source: string };

export type Destination = {
  id: string;
  name: string;
  region: Exclude<DestinationRegion, 'All'>;
  tag: string;
  image: string;
  /** Pre-filled into the Home chat when the visitor clicks "Plan a trip here". */
  prompt: string;
  credit: PhotoCredit;
};

export const DESTINATIONS: Destination[] = [
  {
    id: 'sigiriya',
    name: 'Sigiriya',
    region: 'Cultural Triangle',
    tag: 'Lion Rock at sunrise',
    image: '/images/destinations/sigiriya.jpg',
    prompt: 'Plan a 3-day trip in the Cultural Triangle including Sigiriya and Dambulla',
    credit: {
      title: 'Sigiriya Rock Fortress View from Pidurangala Rock.jpg',
      author: 'Gayomiw',
      license: 'CC BY-SA 4.0',
      source: 'https://commons.wikimedia.org/wiki/File:Sigiriya_Rock_Fortress_View_from_Pidurangala_Rock.jpg',
    },
  },
  {
    id: 'nine-arch-bridge',
    name: 'Nine Arch Bridge',
    region: 'Hill Country',
    tag: 'Train-spotting in Ella',
    image: '/images/destinations/nine-arch-bridge.jpg',
    prompt: 'Plan a 3-day trip to Ella including the Nine Arch Bridge',
    credit: {
      title: 'Nine Arches Bridge in Ella.jpg',
      author: 'Knthabrew',
      license: 'CC BY-SA 4.0',
      source: 'https://commons.wikimedia.org/wiki/File:Nine_Arches_Bridge_in_Ella.jpg',
    },
  },
  {
    id: 'adams-peak',
    name: "Adam's Peak",
    region: 'Hill Country',
    tag: "Pilgrim's sunrise climb",
    image: '/images/destinations/adams-peak.jpg',
    prompt: "Plan a 2-day trip to Adam's Peak (Sri Pada) for the sunrise climb",
    credit: {
      title: "Sunrise from the top of Sri Pada (Adam's Peak) Sri Lanka.jpg",
      author: 'Eli Solidum',
      license: 'CC BY-SA 4.0',
      source: 'https://commons.wikimedia.org/wiki/File:Sunrise_from_the_top_of_Sri_Pada_(Adam%27s_Peak)_Sri_Lanka.jpg',
    },
  },
  {
    id: 'galle-fort',
    name: 'Galle Fort',
    region: 'Coast',
    tag: 'Ramparts & lighthouse',
    image: '/images/destinations/galle-fort.jpg',
    prompt: 'Plan a 3-day trip in Galle including Galle Fort',
    credit: {
      title: 'Lighthouse Galle, Sri Lanka.jpg',
      author: 'Samal Nadeeshan',
      license: 'CC BY-SA 4.0',
      source: 'https://commons.wikimedia.org/wiki/File:Lighthouse_Galle,_Sri_Lanka.jpg',
    },
  },
  {
    id: 'nuwara-eliya',
    name: 'Nuwara Eliya',
    region: 'Hill Country',
    tag: 'Tea country',
    image: '/images/destinations/nuwara-eliya.jpg',
    prompt: 'Plan a 3-day trip to Nuwara Eliya tea country',
    credit: {
      title: 'Tea-plantation Nuwara Eliya-2567.jpg',
      author: 'Bergentroll',
      license: 'CC0',
      source: 'https://commons.wikimedia.org/wiki/File:Tea-plantation_Nuwara_Eliya-2567.jpg',
    },
  },
  {
    id: 'mirissa',
    name: 'Mirissa',
    region: 'Coast',
    tag: 'Palm-lined beach',
    image: '/images/destinations/mirissa.jpg',
    prompt: 'Plan a 3-day beach trip in Mirissa',
    credit: {
      title: 'Mirissa-Plage (3).jpg',
      author: 'Ji-Elle',
      license: 'CC BY-SA 3.0',
      source: 'https://commons.wikimedia.org/wiki/File:Mirissa-Plage_(3).jpg',
    },
  },
  {
    id: 'yala',
    name: 'Yala National Park',
    region: 'Wildlife & Nature',
    tag: 'Leopard safari',
    image: '/images/destinations/yala.jpg',
    prompt: 'Plan a 2-day safari trip to Yala National Park',
    credit: {
      title: 'Srilankan leopard in Yala National Park 1.jpg',
      author: 'AdrianRanasinghe',
      license: 'CC BY-SA 4.0',
      source: 'https://commons.wikimedia.org/wiki/File:Srilankan_leopard_in_Yala_National_Park_1.jpg',
    },
  },
  {
    id: 'little-adams-peak',
    name: "Little Adam's Peak",
    region: 'Hill Country',
    tag: 'Easy summit walk',
    image: '/images/destinations/little-adams-peak.jpg',
    prompt: "Plan a 2-day trip to Ella including Little Adam's Peak",
    credit: {
      title: "Little Adam's Peak, Ella, Sri Lanka.jpg",
      author: 'Bcd4e6',
      license: 'CC BY-SA 4.0',
      source: 'https://commons.wikimedia.org/wiki/File:Little_Adam%27s_Peak,_Ella,_Sri_Lanka.jpg',
    },
  },
  {
    id: 'kandy',
    name: 'Temple of the Tooth',
    region: 'Cultural Triangle',
    tag: 'Sacred relic, Kandy',
    image: '/images/destinations/kandy.jpg',
    prompt: 'Plan a 3-day trip in Kandy including the Temple of the Tooth',
    credit: {
      title: 'Sacred Tooth Relic Temple 3.jpg',
      author: 'Philip Nalangan',
      license: 'CC BY 4.0',
      source: 'https://commons.wikimedia.org/wiki/File:Sacred_Tooth_Relic_Temple_3.jpg',
    },
  },
  {
    id: 'pigeon-island',
    name: 'Pigeon Island',
    region: 'Coast',
    tag: 'Snorkelling reef',
    image: '/images/destinations/pigeon-island.jpg',
    prompt: 'Plan a 3-day trip to Trincomalee including Pigeon Island',
    credit: {
      title: 'Pigeon Island National Park, Trincomalee.jpg',
      author: 'AntanO',
      license: 'CC BY-SA 4.0',
      source: 'https://commons.wikimedia.org/wiki/File:Pigeon_Island_National_Park,_Trincomalee.jpg',
    },
  },
  {
    id: 'worlds-end',
    name: "World's End",
    region: 'Wildlife & Nature',
    tag: 'Cliff edge in the clouds',
    image: '/images/destinations/worlds-end.jpg',
    prompt: "Plan a 2-day trip to Horton Plains including World's End",
    credit: {
      title: 'Worlds end in horton plains in sri lanka.jpg',
      author: 'Pamuditha2000',
      license: 'CC BY-SA 4.0',
      source: 'https://commons.wikimedia.org/wiki/File:Worlds_end_in_horton_plains_in_sri_lanka.jpg',
    },
  },
  {
    id: 'dambulla',
    name: 'Dambulla Cave Temple',
    region: 'Cultural Triangle',
    tag: 'Ancient painted caves',
    image: '/images/destinations/dambulla.jpg',
    prompt: 'Plan a 2-day trip to Dambulla Cave Temple',
    credit: {
      title: 'Dambulla Cave 1.jpg',
      author: 'Philip Nalangan',
      license: 'CC BY 4.0',
      source: 'https://commons.wikimedia.org/wiki/File:Dambulla_Cave_1.jpg',
    },
  },
];

export type TripIdea = {
  id: string;
  title: string;
  duration: string;
  image: string;
  stops: string[];
  prompt: string;
};

export const TRIP_IDEAS: TripIdea[] = [
  {
    id: 'cultural-triangle',
    title: 'Cultural Triangle Classic',
    duration: '4 days',
    image: '/images/destinations/sigiriya.jpg',
    stops: ['Sigiriya', 'Dambulla', 'Kandy'],
    prompt: 'Plan a 4-day trip covering Sigiriya, Dambulla and Kandy',
  },
  {
    id: 'hill-country',
    title: 'Hill Country Escape',
    duration: '3 days',
    image: '/images/destinations/nine-arch-bridge.jpg',
    stops: ['Ella', 'Nine Arch Bridge', "Little Adam's Peak"],
    prompt: "Plan a 3-day trip in Ella including the Nine Arch Bridge and Little Adam's Peak",
  },
  {
    id: 'southern-coast',
    title: 'Southern Coast Break',
    duration: '3 days',
    image: '/images/destinations/mirissa.jpg',
    stops: ['Galle Fort', 'Mirissa'],
    prompt: 'Plan a 3-day trip on the south coast including Galle Fort and Mirissa',
  },
  {
    id: 'wild-side',
    title: 'Wild Side Safari',
    duration: '2 days',
    image: '/images/destinations/yala.jpg',
    stops: ['Yala National Park'],
    prompt: 'Plan a 2-day safari trip to Yala National Park',
  },
];
