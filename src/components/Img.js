import { U } from '../data/countries';

// Фото с Unsplash; если не загрузилось — остаётся цветной фон
export default function Img({ id, alt }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={U(id)} alt={alt} loading="lazy" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
  );
}
