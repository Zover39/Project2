import { useApp } from '../context/AppContext';
import { RATE } from '../data/countries';

export default function Settings() {
  const { settings, updateSettings, clearData } = useApp();
  return (
    <div className="panel f" style={{ maxWidth: 520, marginTop: 22 }}>
      <h1 style={{ fontSize: 22, marginBottom: 14 }}>Настройки</h1>
      <label>Валюта
        <select value={settings.cur} onChange={(e) => updateSettings({ cur: e.target.value })}>
          <option value="KZT">Тенге (₸)</option>
          <option value="USD">Доллар ($), курс {RATE} ₸</option>
        </select>
      </label>
      <label style={{ marginTop: 14 }}>Тема
        <select value={settings.theme} onChange={(e) => updateSettings({ theme: e.target.value })}>
          <option value="light">Светлая</option>
          <option value="dark">Тёмная</option>
        </select>
      </label>
      <button className="btn ghost" style={{ marginTop: 18 }}
        onClick={() => confirm('Удалить избранное и все брони?') && clearData()}>
        Очистить данные
      </button>
    </div>
  );
}
