import Head from 'next/head';
import { useApp } from '../context/AppContext';
import Header from '../components/Header';
import Home from '../components/Home';
import CountryView from '../components/CountryView';
import HotelView from '../components/HotelView';
import Favorites from '../components/Favorites';
import Bookings from '../components/Bookings';
import Settings from '../components/Settings';

export default function Index() {
  const { view, cid, hid } = useApp();

  let page;
  if (view === 'favorites') page = <Favorites />;
  else if (view === 'bookings') page = <Bookings />;
  else if (view === 'settings') page = <Settings />;
  else if (hid) page = <HotelView key={hid} />;
  else if (cid) page = <CountryView />;
  else page = <Home />;

  return (
    <>
      <Head>
        <title>Astana Travel — туры из Астаны</title>
        <meta name="description" content="Туры с вылетом из Астаны (NQZ) в 7 стран мира" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Header />
      <main className="wrap">
        {page}
        <p className="note">Демо-сайт: отели, цены и фото носят иллюстративный характер. Реальное бронирование и оплата не выполняются.</p>
      </main>
    </>
  );
}
