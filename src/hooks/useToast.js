import { useState } from 'react';

export default function useToast() {
  const [toastMsg, setToastMsg] = useState(null);
  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };
  return { toastMsg, showToast };
}
