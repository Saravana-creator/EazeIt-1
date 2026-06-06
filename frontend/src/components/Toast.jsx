export function showToast(message, isError = false) {
  const bgClass = isError ? 'bg-rose-500 text-white' : 'bg-teal-400 text-slate-900';
  const toast = document.createElement('div');
  toast.className = `fixed bottom-5 right-5 ${bgClass} font-bold px-6 py-4 rounded-lg shadow-2xl z-[9999] transition-all duration-300 transform translate-y-0 opacity-100 flex items-center gap-2`;
  toast.style.animation = 'slideIn 0.3s ease-out forwards';
  toast.innerHTML = `<span>${message}</span>`;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
