// Фото; если не загрузилось — остаётся градиентный фон контейнера
export default function Img({ src, alt, className = 'w-full h-full object-cover' }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className={className}
      onError={(e) => { e.currentTarget.style.display = 'none'; }}
    />
  );
}
