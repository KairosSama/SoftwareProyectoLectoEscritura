import { useEffect } from 'react';

export function useFocusTrap(containerRef: React.RefObject<HTMLElement>, active: boolean) {
  useEffect(()=>{
    if (!active || !containerRef.current) return;
    const container = containerRef.current;
    const focusable = () => Array.from(container.querySelectorAll<HTMLElement>(
      'a[href],button:not([disabled]),textarea,input[type="text"],input[type="checkbox"],input[type="radio"],select,[tabindex]:not([tabindex="-1"])'
    ));
    let prevFocus: Element | null = document.activeElement;
    const list = focusable();
    if (list.length) (list[0] as HTMLElement).focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // permitir que el caller cierre con onClose externo (no se maneja aquí)
        return;
      }
      if (e.key === 'Tab') {
        const items = focusable();
        if (!items.length) return;
        const first = items[0];
        const last = items[items.length -1];
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            (last as HTMLElement).focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            (first as HTMLElement).focus();
          }
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      if (prevFocus instanceof HTMLElement) prevFocus.focus();
    };
  }, [containerRef, active]);
}
