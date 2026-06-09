// src/ui/notifications.ts

type NotifType = 'gold' | 'green' | 'purple' | 'cyan';

let container: HTMLDivElement | null = null;

function getContainer(): HTMLDivElement {
  if (!container) {
    container = document.createElement('div');
    container.id = 'le-notifications';
    document.body.appendChild(container);
  }
  return container;
}

export function showNotification(text: string, type: NotifType = 'gold', durationMs = 3000): void {
  const c = getContainer();
  const el = document.createElement('div');
  el.className = `le-notif le-notif-${type}`;
  el.textContent = text;
  c.appendChild(el);
  setTimeout(() => {
    el.remove();
  }, durationMs);
}
