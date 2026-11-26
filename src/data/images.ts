import heroPedestalImg from '../assets/images/hero_perfume_pedestal_1794472841165.jpg';
import santalImperialImg from '../assets/images/perfume_santal_imperial_1794472843058.jpg';
import oudNocturneImg from '../assets/images/perfume_oud_nocturne_1794472842498.jpg';
import velvetRoseImg from '../assets/images/perfume_velvet_rose_1794472844184.jpg';
import discoverySetImg from '../assets/images/perfume_discovery_set_1794472844487.jpg';

export const STUDIO_IMAGES = {
  heroPedestal: heroPedestalImg,
  santalImperial: santalImperialImg,
  oudNocturne: oudNocturneImg,
  velvetRose: velvetRoseImg,
  discoverySet: discoverySetImg,
} as const;

const LEGACY_IMAGE_MAP: Record<string, string> = {
  '/src/assets/images/hero_perfume_pedestal_1794472841165.jpg': heroPedestalImg,
  '/src/assets/images/perfume_santal_imperial_1794472843058.jpg': santalImperialImg,
  '/src/assets/images/perfume_oud_nocturne_1794472842498.jpg': oudNocturneImg,
  '/src/assets/images/perfume_velvet_rose_1794472844184.jpg': velvetRoseImg,
  '/src/assets/images/perfume_discovery_set_1794472844487.jpg': discoverySetImg,
};

export function resolveProductImage(image: string): string {
  return LEGACY_IMAGE_MAP[image] || image;
}
