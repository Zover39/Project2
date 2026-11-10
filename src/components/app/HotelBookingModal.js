import { useEffect, useRef, useState } from 'react';
import { Calendar, CheckCircle2, Share2, ShieldCheck, Star, ThumbsUp, X } from 'lucide-react';
import GuestSelector from './GuestSelector';

const getGuestLabel = count => {
  if (count === 1) return 'гость';
  if (count < 5) return 'гостя';
  return 'гостей';
};

const addNightsToDate = (date, nights) => {
  if (!date) return '';
  const result = new Date(`${date}T00:00:00`);
  result.setDate(result.getDate() + nights);
  return `${result.getFullYear()}-${String(result.getMonth() + 1).padStart(2, '0')}-${String(result.getDate()).padStart(2, '0')}`;
};

export default function HotelBookingModal({ app }) {
  const {
    activeHotel, closeHotel, modalTab, setModalTab, checkoutStep,
    setCheckoutStep, tourConfig, setTourConfig, formatMoney, confirmBooking,
    likeReview, setActiveTab, pushToast, adults, children, updateGuestCounts
  } = app;
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [reviewSearch, setReviewSearch] = useState('');
  const [reviewRating, setReviewRating] = useState('ALL');
  const [reviewSort, setReviewSort] = useState('newest');
  const dialogRef = useRef(null);
  const gallery = activeHotel
    ? (activeHotel.photos?.length
      ? activeHotel.photos
      : [activeHotel.image, ...(activeHotel.gallery || [])]
        .filter(Boolean)
        .map(photo => typeof photo === 'string' ? { url: photo } : photo))
    : [];
  const currentPhoto = gallery[galleryIndex] || { url: activeHotel?.image || '', alt: activeHotel?.name || '' };
  const basePrice = activeHotel ? (activeHotel.price || 0) * (tourConfig.nights / 7) : 0;
  const hotelCost = basePrice * tourConfig.pax;
  const classSurcharge = hotelCost * (tourConfig.class - 1);
  const totalPrice = hotelCost + classSurcharge;
  const nightOptions = [...new Set([3, 5, 7, 10, 14, tourConfig.nights])].sort((a, b) => a - b);
  const today = new Date();
  const minDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const visibleReviews = activeHotel ? activeHotel.reviews
    .filter(review => reviewRating === 'ALL' || review.rating === Number(reviewRating))
    .filter(review => `${review.author} ${review.text}`.toLowerCase().includes(reviewSearch.toLowerCase()))
    .sort((a, b) => reviewSort === 'rating' ? b.rating - a.rating : new Date(b.date.split('.').reverse().join('-')) - new Date(a.date.split('.').reverse().join('-'))) : [];

  useEffect(() => {
    setGalleryIndex(0);
    setReviewSearch('');
    setReviewRating('ALL');
    setReviewSort('newest');
  }, [activeHotel?.id]);

  useEffect(() => {
    if (!activeHotel) return undefined;
    dialogRef.current?.querySelector('[data-dialog-close]')?.focus();
    const handleKeyDown = event => {
      if (event.key === 'Escape') closeHotel();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeHotel?.id]);

  const shareHotel = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: activeHotel.name, text: 'Посмотри этот отель', url });
      } catch (error) {
        if (error.name !== 'AbortError') pushToast('Не удалось поделиться ссылкой');
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(url);
      pushToast('Ссылка скопирована');
    } catch {
      pushToast('Скопируйте ссылку из адресной строки браузера');
    }
  };

  return (
    <>
      {activeHotel && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex justify-center items-end sm:items-center sm:p-6 overflow-y-auto">
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label={`Информация об отеле ${activeHotel.name}`}
            onKeyDown={event => {
              if (event.key !== 'Tab') return;
              const focusable = [...event.currentTarget.querySelectorAll('button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])')]
                .filter(element => element.offsetParent !== null);
              const first = focusable[0];
              const last = focusable[focusable.length - 1];
              if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last?.focus();
              } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first?.focus();
              }
            }}
            className="bg-white dark:bg-slate-900 w-full max-w-5xl rounded-t-3xl sm:rounded-3xl shadow-2xl relative flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-10 sm:zoom-in-95"
          >
            <div className="px-6 pt-6 pb-2 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
              <div className="flex gap-6">
                <button onClick={()=>setModalTab('info')} className={`pb-3 font-bold text-sm transition-colors ${modalTab==='info' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-slate-500'}`}>Обзор и бронирование</button>
                <button onClick={()=>setModalTab('reviews')} className={`pb-3 font-bold text-sm transition-colors flex items-center gap-1 ${modalTab==='reviews' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-slate-500'}`}>Отзывы <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full text-[10px]">{activeHotel.reviews.length}</span></button>
              </div>
              <div className="flex gap-2">
                <button onClick={shareHotel} aria-label="Поделиться ссылкой на отель" className="bg-slate-100 dark:bg-slate-800 p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition">
                  <Share2 className="w-5 h-5"/>
                </button>
                <button data-dialog-close onClick={closeHotel} aria-label="Закрыть окно отеля" className="bg-slate-100 dark:bg-slate-800 p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition">
                  <X className="w-5 h-5"/>
                </button>
              </div>
            </div>

            <div className="overflow-y-auto p-6 flex-grow">

              {/* TAB: INFO */}
              {modalTab === 'info' && checkoutStep === 0 && (
                <div className="space-y-8">
                  <div className="flex flex-col lg:flex-row gap-8">
                  {/* Левая часть: Инфо */}
                  <div className="w-full lg:w-1/2 space-y-6">
                    <div className="relative">
                      <img src={currentPhoto.url} className="w-full h-64 object-cover rounded-2xl shadow-md" alt={currentPhoto.alt || `${activeHotel.name}, фото ${galleryIndex + 1}`} />
                      {gallery.length > 1 && (
                        <div className="absolute inset-x-3 bottom-3 flex items-center justify-between">
                          <button onClick={() => setGalleryIndex(index => (index - 1 + gallery.length) % gallery.length)} aria-label="Предыдущее фото" className="rounded-full bg-black/60 px-3 py-2 text-sm font-bold text-white">Назад</button>
                          <span className="rounded-full bg-black/60 px-3 py-2 text-xs font-bold text-white">{galleryIndex + 1} / {gallery.length}</span>
                          <button onClick={() => setGalleryIndex(index => (index + 1) % gallery.length)} aria-label="Следующее фото" className="rounded-full bg-black/60 px-3 py-2 text-sm font-bold text-white">Вперёд</button>
                        </div>
                      )}
                    </div>
                    {gallery.length > 1 && (
                      <div className="flex gap-2 overflow-x-auto">
                        {gallery.map((image, index) => (
                          <button key={`${image}-${index}`} onClick={() => setGalleryIndex(index)} aria-label={`Показать фото ${index + 1}`} aria-pressed={galleryIndex === index} className={`shrink-0 rounded-lg border-2 ${galleryIndex === index ? 'border-indigo-600' : 'border-transparent'}`}>
                            <img src={typeof image === 'string' ? image : image.url} alt="" className="h-14 w-20 rounded-md object-cover" />
                          </button>
                        ))}
                      </div>
                    )}
                    {currentPhoto.credit && (
                      <p className="text-xs text-slate-500">
                        Фото: {currentPhoto.credit}
                        {currentPhoto.license && (
                          <> · {currentPhoto.licenseUrl
                            ? <a href={currentPhoto.licenseUrl} target="_blank" rel="noreferrer" className="text-indigo-600 underline">{currentPhoto.license}</a>
                            : currentPhoto.license}</>
                        )}
                        {currentPhoto.sourceUrl && <> · <a href={currentPhoto.sourceUrl} target="_blank" rel="noreferrer" className="text-indigo-600 underline">Источник</a></>}
                      </p>
                    )}
                    <div>
                      <span className="bg-indigo-600 text-white text-[10px] uppercase font-bold px-2 py-1 rounded">{activeHotel.country}</span>
                      <h2 id="hotel-dialog-title" className="text-3xl font-black mt-2 leading-tight">{activeHotel.name}</h2>
                      <div className="flex gap-4 text-sm mt-2 text-slate-600 dark:text-slate-400">
                        {activeHotel.rating ? (
                          <span className="flex gap-1 items-center"><Star className="w-4 h-4 fill-amber-400 text-amber-400"/> {activeHotel.rating}</span>
                        ) : <span className="text-xs text-slate-500">Оценки гостей не подключены</span>}
                        <span>{'★'.repeat(activeHotel.stars)}</span>
                        <span>{activeHotel.meal}</span>
                      </div>
                    </div>

                    {/* ОПИСАНИЕ ОТЕЛЯ */}
                    {activeHotel.description && (
                      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                        <h4 className="font-bold text-slate-900 dark:text-white mb-2">Об отеле</h4>
                        <p>{activeHotel.description}</p>
                      </div>
                    )}

                    {(activeHotel.amenities?.length || activeHotel.roomTypes?.length || activeHotel.officialUrl) && (
                      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
                        <div>
                          <h3 className="font-bold">Об отеле и территории</h3>
                          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{activeHotel.locationDescription}</p>
                        </div>
                        {activeHotel.amenities?.length > 0 && (
                          <div>
                            <h4 className="text-sm font-bold">Что есть в отеле</h4>
                            <ul className="mt-2 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                              {activeHotel.amenities.map(item => <li key={item} className="flex gap-2"><CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />{item}</li>)}
                            </ul>
                          </div>
                        )}
                        {activeHotel.roomTypes?.length > 0 && (
                          <div>
                            <h4 className="text-sm font-bold">Варианты размещения</h4>
                            <ul className="mt-2 space-y-1 text-sm text-slate-600 dark:text-slate-300">
                              {activeHotel.roomTypes.map(item => <li key={item}>{item}</li>)}
                            </ul>
                          </div>
                        )}
                        {activeHotel.dining && (
                          <div>
                            <h4 className="text-sm font-bold">Питание и рестораны</h4>
                            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{activeHotel.dining}</p>
                          </div>
                        )}
                        {activeHotel.officialUrl && (
                          <a href={activeHotel.officialUrl} target="_blank" rel="noreferrer" className="inline-flex text-sm font-bold text-indigo-600 underline">
                            Официальный сайт отеля
                          </a>
                        )}
                        <p className="text-xs text-slate-500">Описание объекта сверено с официальным сайтом. Состав услуг и доступность зависят от дат и тарифа.</p>
                      </section>
                    )}

                  </div>

                  {/* Правая часть: Конфигуратор */}
                  <div className="w-full lg:w-1/2 bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
                    <div className="space-y-5">
                      <h3 className="text-xl font-bold border-b border-slate-200 dark:border-slate-700 pb-4">Конструктор тура</h3>
                      <div>
                        <label className="text-xs font-bold text-slate-500 block mb-2">Класс перелета (из Астаны NQZ)</label>
                        <div className="flex gap-2">
                          <button onClick={()=>setTourConfig({...tourConfig, class: 1})} className={`flex-1 py-2 rounded-xl text-xs font-bold border transition ${tourConfig.class===1 ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700'}`}>Эконом</button>
                          <button onClick={()=>setTourConfig({...tourConfig, class: 1.5})} className={`flex-1 py-2 rounded-xl text-xs font-bold border transition ${tourConfig.class===1.5 ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700'}`}>Бизнес (+50%)</button>
                        </div>
                        <p className="mt-1 text-[11px] text-slate-500">Класс — только параметр демонстрационного расчёта; расписание и цена авиабилетов не проверяются.</p>
                      </div>
                      <div>
                        <h4 className="mb-2 text-xs font-bold text-slate-500">Количество гостей</h4>
                        <GuestSelector adults={adults} children={children} onChange={updateGuestCounts} />
                        <p className="mt-2 text-[11px] text-slate-500">Возраст детей и реальные тарифы не учитываются; в демо каждый гость считается по одной ставке.</p>
                      </div>
                      <div>
                        <label htmlFor="trip-checkin" className="text-xs font-bold text-slate-500 block mb-2">
                          <Calendar className="mr-1 inline h-4 w-4" />Дата заезда
                        </label>
                        <input
                          id="trip-checkin"
                          type="date"
                          min={minDate}
                          value={tourConfig.departureDate || ''}
                          onChange={event => setTourConfig(config => ({
                            ...config,
                            departureDate: event.target.value,
                            checkOutDate: addNightsToDate(event.target.value, config.nights)
                          }))}
                          className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm dark:border-slate-700 dark:bg-slate-900"
                        />
                      </div>
                      <div>
                        <label htmlFor="trip-checkout" className="text-xs font-bold text-slate-500 block mb-2">Дата выезда из отеля</label>
                        <input
                          id="trip-checkout"
                          type="date"
                          min={addNightsToDate(tourConfig.departureDate, 1) || minDate}
                          value={tourConfig.checkOutDate || ''}
                          disabled={!tourConfig.departureDate}
                          onChange={event => {
                            const nights = Math.round((new Date(`${event.target.value}T00:00:00`) - new Date(`${tourConfig.departureDate}T00:00:00`)) / 86400000);
                            setTourConfig(config => ({ ...config, checkOutDate: event.target.value, nights }));
                          }}
                          className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm dark:border-slate-700 dark:bg-slate-900"
                        />
                      </div>
                      <div>
                        <label htmlFor="trip-nights" className="text-xs font-bold text-slate-500 block mb-2">Длительность поездки</label>
                        <select id="trip-nights" value={tourConfig.nights} onChange={event => {
                          const nights = Number(event.target.value);
                          setTourConfig(config => ({
                            ...config,
                            nights,
                            checkOutDate: addNightsToDate(config.departureDate, nights)
                          }));
                        }} className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-bold">
                          {nightOptions.map(nights => <option key={nights} value={nights}>{nights} ночей</option>)}
                        </select>
                      </div>
                      {activeHotel.mealPlans?.length > 0 && (
                        <div>
                          <label htmlFor="trip-meal-plan" className="text-xs font-bold text-slate-500 block mb-2">План питания</label>
                          <select
                            id="trip-meal-plan"
                            value={tourConfig.mealPlan || activeHotel.mealPlans[0]}
                            onChange={event => setTourConfig({...tourConfig, mealPlan: event.target.value})}
                            className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm dark:border-slate-700 dark:bg-slate-900"
                          >
                            {activeHotel.mealPlans.map(plan => <option key={plan} value={plan}>{plan}</option>)}
                          </select>
                        </div>
                      )}
                      <div className="bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-200 p-3 rounded-xl text-xs font-medium border border-amber-200 dark:border-amber-800">
                        Стоимость, наличие мест, авиабилеты, питание, трансфер и страховка не подтверждаются сайтом. Условия зависят от тарифа и требуют уточнения у отеля или туроператора.
                      </div>
                    </div>

                    <div className="mt-8 border-t border-slate-200 dark:border-slate-700 pt-6">
                      <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">Демо-расчёт · {tourConfig.pax} {getGuestLabel(tourConfig.pax)} · {tourConfig.nights} ночей</h4>
                      <dl className="space-y-2 text-sm">
                        <div className="flex justify-between gap-3"><dt>Демо-база: {tourConfig.nights} ночей</dt><dd>{formatMoney(hotelCost)} ₸</dd></div>
                        {classSurcharge > 0 && <div className="flex justify-between gap-3"><dt>Демо-параметр бизнес-класса</dt><dd>{formatMoney(classSurcharge)} ₸</dd></div>}
                      </dl>
                      <p className="text-3xl font-black text-slate-900 dark:text-white mt-3 mb-4">{formatMoney(totalPrice)} ₸</p>
                      <p className="text-[11px] text-slate-500 mb-3">Расчётная демо-цена, не предложение от отеля или туроператора. Актуальную стоимость и состав тура нужно уточнить отдельно.</p>
                      <button onClick={() => setCheckoutStep(1)} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-4 rounded-2xl shadow-lg shadow-emerald-500/30 flex justify-center items-center gap-2 transition">
                        <ShieldCheck className="w-5 h-5"/> Оформить заказ
                      </button>
                    </div>
                  </div>
                  </div>

                  <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
                    <div className="border-b border-slate-200 p-5 dark:border-slate-700">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                          <h3 className="text-xl font-black">Варианты размещения</h3>
                          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                            Для {tourConfig.adults ?? adults} взрослых и {tourConfig.children ?? children} детей · {tourConfig.nights} ночей
                          </p>
                        </div>
                        <span className="w-fit rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900 dark:bg-amber-950 dark:text-amber-200">
                          Демо-варианты
                        </span>
                      </div>
                      <p className="mt-3 rounded-xl bg-amber-50 p-3 text-xs leading-relaxed text-amber-900 dark:bg-amber-950/60 dark:text-amber-100">
                        Категории, цены и условия ниже не являются предложением отеля. Наличие номеров, итоговую стоимость, питание, отмену и предоплату необходимо уточнить у отеля.
                      </p>
                    </div>

                    <p className="border-b border-slate-200 px-5 py-2 text-xs text-slate-500 dark:border-slate-700 md:hidden">
                      Прокрутите таблицу в сторону, чтобы увидеть все условия и варианты.
                    </p>
                    <div className="overflow-x-auto" tabIndex={0} aria-label="Таблица вариантов размещения, прокручивается по горизонтали">
                      <table className="w-full min-w-[760px] text-left text-sm">
                        <thead className="bg-slate-100 text-xs uppercase text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                          <tr>
                            <th scope="col" className="px-5 py-3">Вариант номера</th>
                            <th scope="col" className="px-5 py-3">Гости</th>
                            <th scope="col" className="px-5 py-3">Питание</th>
                            <th scope="col" className="px-5 py-3">Условия</th>
                            <th scope="col" className="px-5 py-3">Демо-цена за поездку</th>
                            <th scope="col" className="px-5 py-3"><span className="sr-only">Действие</span></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                          {(activeHotel.roomTypes?.length ? activeHotel.roomTypes : ['Вариант размещения']).map(roomType => {
                            const selected = (tourConfig.roomType || activeHotel.roomTypes?.[0] || 'Вариант размещения') === roomType;
                            return (
                              <tr key={roomType} className={selected ? 'bg-indigo-50/70 dark:bg-indigo-950/30' : ''}>
                                <th scope="row" className="max-w-xs px-5 py-4 font-bold">{roomType}</th>
                                <td className="whitespace-nowrap px-5 py-4">{tourConfig.pax} {getGuestLabel(tourConfig.pax)}</td>
                                <td className="max-w-[200px] px-5 py-4">{tourConfig.mealPlan || activeHotel.meal || 'Уточнить у отеля'}</td>
                                <td className="min-w-[170px] px-5 py-4 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                                  Отмена и предоплата не подтверждены
                                </td>
                                <td className="whitespace-nowrap px-5 py-4">
                                  <span className="block font-black">{formatMoney(totalPrice)} ₸</span>
                                  <span className="text-[11px] text-slate-500">расчёт для выбранных гостей</span>
                                </td>
                                <td className="px-5 py-4">
                                  <button
                                    type="button"
                                    aria-pressed={selected}
                                    onClick={() => {
                                      setTourConfig(config => ({ ...config, roomType }));
                                      pushToast('Демо-вариант размещения выбран');
                                    }}
                                    className={`whitespace-nowrap rounded-lg px-4 py-2 text-xs font-black transition ${selected ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                                  >
                                    {selected ? 'Выбрано' : 'Выбрать'}
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </section>
                </div>
              )}

              {/* TAB: REVIEWS */}
              {modalTab === 'reviews' && (
                <div className="space-y-6 animate-in fade-in">
                  <div className="bg-indigo-50 dark:bg-indigo-950 p-6 rounded-2xl flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-black text-indigo-900 dark:text-indigo-100">
                        {activeHotel.rating ? `Рейтинг: ${activeHotel.rating} / 5` : 'Пока нет оценок гостей'}
                      </h3>
                      <p className="text-sm text-indigo-600 dark:text-indigo-300">Отзывы на этом сайте: {activeHotel.reviews.length}</p>
                    </div>
                    <Star className="w-12 h-12 text-amber-500 fill-amber-500 opacity-20" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <label className="sm:col-span-1">
                      <span className="sr-only">Поиск отзывов</span>
                      <input value={reviewSearch} onChange={event => setReviewSearch(event.target.value)} placeholder="Поиск по тексту или автору" className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm dark:border-slate-700 dark:bg-slate-900" />
                    </label>
                    <label>
                      <span className="sr-only">Фильтр по оценке</span>
                      <select value={reviewRating} onChange={event => setReviewRating(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm dark:border-slate-700 dark:bg-slate-900">
                        <option value="ALL">Любая оценка</option>
                        {[5, 4, 3, 2, 1].map(rating => <option key={rating} value={rating}>{rating} звёзд</option>)}
                      </select>
                    </label>
                    <label>
                      <span className="sr-only">Сортировка отзывов</span>
                      <select value={reviewSort} onChange={event => setReviewSort(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm dark:border-slate-700 dark:bg-slate-900">
                        <option value="newest">Сначала новые</option>
                        <option value="rating">Сначала с высокой оценкой</option>
                      </select>
                    </label>
                  </div>
                  <div className="space-y-4">
                    {activeHotel.reviews.length === 0 ? <p className="text-center text-slate-500 py-10">Отзывов пока нет.</p> : null}
                    {visibleReviews.length === 0 && activeHotel.reviews.length > 0 && <p className="text-center text-slate-500 py-6">Отзывы по выбранным условиям не найдены.</p>}
                    {visibleReviews.map(r => (
                      <div key={r.id} className="p-5 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-bold">{r.author} <span className="text-xs text-slate-400 font-normal ml-2">{r.date}</span></p>
                            <div className="flex mt-1">
                              {[...Array(5)].map((_, i) => <Star key={i} className={`w-3 h-3 ${i < r.rating ? 'fill-amber-500 text-amber-500' : 'text-slate-300 dark:text-slate-700'}`}/>)}
                            </div>
                          </div>
                          <button onClick={() => likeReview(activeHotel.id, r.id)} className="flex items-center gap-1 text-xs text-slate-500 hover:text-indigo-600 transition"><ThumbsUp className="w-4 h-4"/> {r.likes}</button>
                        </div>
                        <p className="text-sm text-slate-700 dark:text-slate-300">{r.text}</p>

                        {r.adminReply && (
                          <div className="ml-6 mt-4 bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border-l-4 border-indigo-500">
                            <span className="font-bold text-xs text-indigo-600 dark:text-indigo-400 flex items-center gap-1 mb-1"><ShieldCheck className="w-3 h-3"/> Ответ администрации</span>
                            <p className="text-xs text-slate-600 dark:text-slate-300">{r.adminReply}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ШАГ 2: KASPI ОПЛАТА */}
              {checkoutStep === 1 && modalTab === 'info' && (
                <div className="max-w-md mx-auto text-center space-y-6 py-10 animate-in zoom-in-95">
                  <div className="w-20 h-20 bg-red-600 rounded-[2rem] text-white flex items-center justify-center font-black text-4xl mx-auto shadow-2xl shadow-red-500/40">K</div>
                  <h3 className="text-2xl font-bold">Демо-оформление</h3>
                  <p className="rounded-xl bg-amber-50 p-3 text-sm font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-200">Это только демонстрация: Kaspi и реальная оплата не подключены. Деньги списаны не будут.</p>
                  <p className="text-slate-500 text-sm">Расчётная сумма: <br/><span className="text-3xl font-black text-slate-900 dark:text-white mt-2 block">{formatMoney(totalPrice)} ₸</span></p>
                  <button onClick={confirmBooking} className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-2xl shadow-lg transition">Создать демо-бронирование</button>
                  <button onClick={() => setCheckoutStep(0)} className="text-sm font-bold text-slate-400 hover:text-slate-600 transition">Отмена</button>
                </div>
              )}

              {/* ШАГ 3: VOUCHER */}
              {checkoutStep === 2 && modalTab === 'info' && (
                <div className="max-w-md mx-auto bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center space-y-4 animate-in fade-in relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-2 bg-indigo-600"></div>
                  <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto" />
                  <h3 className="text-2xl font-black text-indigo-900 dark:text-indigo-400">Демо-ваучер</h3>
                  <p className="text-xs font-bold text-amber-700 dark:text-amber-300">Демо-заявка сохранена локально. Реальный билет и оплата не оформлялись.</p>
                  <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-left text-sm font-bold text-slate-700 dark:text-slate-300 space-y-2 shadow-sm">
                    <p className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2"><span className="text-slate-400">Отель</span> <span>{activeHotel.name}</span></p>
                    {tourConfig.roomType && <p className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2"><span className="text-slate-400">Вариант размещения</span> <span>{tourConfig.roomType}</span></p>}
                    <p className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2"><span className="text-slate-400">Взрослых</span> <span>{tourConfig.adults ?? adults}</span></p>
                    <p className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2"><span className="text-slate-400">Детей</span> <span>{tourConfig.children ?? children}</span></p>
                    <p className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2"><span className="text-slate-400">Всего гостей</span> <span>{tourConfig.pax} чел.</span></p>
                    <p className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2"><span className="text-slate-400">Длительность</span> <span>{tourConfig.nights} ночей</span></p>
                    {tourConfig.departureDate && <p className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2"><span className="text-slate-400">Заезд</span> <span>{new Date(`${tourConfig.departureDate}T00:00:00`).toLocaleDateString('ru-RU')}</span></p>}
                    {tourConfig.checkOutDate && <p className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2"><span className="text-slate-400">Выезд</span> <span>{new Date(`${tourConfig.checkOutDate}T00:00:00`).toLocaleDateString('ru-RU')}</span></p>}
                    <p className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2"><span className="text-slate-400">Рейс</span> <span>Из Астаны (NQZ)</span></p>
                    <div className="flex justify-center pt-4">
                      <div className="w-32 h-32 bg-slate-200 dark:bg-slate-800 rounded-xl flex items-center justify-center font-black text-slate-400 text-center text-xs">QR CODE<br/>(симуляция)</div>
                    </div>
                  </div>
                  <button onClick={() => setActiveTab('profile')} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl mt-4 transition">
                    В личный кабинет
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </>
  );
}
