import { useApp } from '../context/AppContext';
import { RATE } from '../data/countries';

const field = 'w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm';

export default function SettingsView() {
  const { settings, updateSettings, clearData, t } = useApp();
  return (
    <div className="max-w-2xl bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">{t('Настройки приложения')}</h1>
      <div className="space-y-6">
        <div>
          <label htmlFor="cur" className="text-xs font-bold text-slate-600 block mb-2">{t('Валюта отображения')}</label>
          <select id="cur" value={settings.currency} onChange={(e) => updateSettings({ currency: e.target.value })} className={field}>
            <option value="KZT">Казахстанский тенге (₸)</option>
            <option value="USD">Доллар США ($), курс {RATE} ₸</option>
          </select>
        </div>
        <div>
          <label htmlFor="lang" className="text-xs font-bold text-slate-600 block mb-2">{t('Язык интерфейса')}</label>
          <select id="lang" value={settings.language} onChange={(e) => updateSettings({ language: e.target.value })} className={field}>
            <option value="ru">Русский</option>
            <option value="kz">Қазақша (основные разделы)</option>
          </select>
        </div>
        <div>
          <label htmlFor="theme" className="text-xs font-bold text-slate-600 block mb-2">{t('Тема оформления')}</label>
          <select id="theme" value={settings.theme} onChange={(e) => updateSettings({ theme: e.target.value })} className={field}>
            <option value="light">Светлая</option>
            <option value="dark">Тёмная</option>
          </select>
        </div>
        <label className="flex items-center space-x-3 cursor-pointer">
          <input type="checkbox" checked={settings.notifications} onChange={(e) => updateSettings({ notifications: e.target.checked })} className="w-4 h-4 accent-blue-600" />
          <span className="text-sm text-slate-700">{t('Уведомления')} (подсказки при добавлении в избранное и бронировании)</span>
        </label>
        <button
          onClick={() => confirm('Удалить избранное и все брони?') && clearData()}
          className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2.5 rounded-xl text-sm font-semibold transition"
        >
          Очистить избранное и брони
        </button>
      </div>
    </div>
  );
}
