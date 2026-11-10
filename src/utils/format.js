export const formatPrice = (num) => num.toLocaleString('ru-RU');

export const formatMoney = (n) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
