export { default as HeroBanner } from './HeroBanner';
export { default as PromoCarousel } from './PromoCarousel';
export { default as FeaturedProducts } from './FeaturedProducts';
export { default as Categories } from './Categories';
export { default as WhyUs } from './WhyUs';
export { default as Newsletter } from './Newsletter';
import dynamic from 'next/dynamic';

// Expose StoreMap as a client-only dynamic component to avoid importing
// Leaflet during server-side rendering. This prevents "window is not defined"
// errors when a server component imports the home index barrel file.
export const StoreMap = dynamic(
	() => import('./StoreMap').then((mod) => mod.StoreMap),
	{ ssr: false }
);
