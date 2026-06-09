// src/ui/modal.ts

interface ModalButton {
  label: string;
  className: string;
  onClick: () => void;
}

export function showModal(title: string, body: string, buttons: ModalButton[]): () => void {
  const backdrop = document.createElement('div');
  backdrop.className = 'le-modal-backdrop';

  const modal = document.createElement('div');
  modal.className = 'le-modal';

  const h2 = document.createElement('h2');
  h2.textContent = title;

  const p = document.createElement('p');
  p.innerHTML = body;

  const actions = document.createElement('div');
  actions.className = 'le-modal-actions';

  for (const btn of buttons) {
    const b = document.createElement('button');
    b.className = `le-btn ${btn.className}`;
    b.textContent = btn.label;
    b.addEventListener('click', () => {
      btn.onClick();
      backdrop.remove();
    });
    actions.appendChild(b);
  }

  modal.appendChild(h2);
  modal.appendChild(p);
  modal.appendChild(actions);
  backdrop.appendChild(modal);
  document.body.appendChild(backdrop);

  const close = () => backdrop.remove();
  backdrop.addEventListener('click', (e) => { if (e.target === backdrop) close(); });

  return close;
}
