const przyciskMenu = document.querySelector('.przelacznik-menu');
const nawigacja = document.querySelector('#nawigacja-glowna');
const formularzZapytania = document.querySelector('#formularz-zapytania');
const statusFormularza = document.querySelector('#status-formularza');
const biezacyRok = document.querySelector('#biezacy-rok');

biezacyRok.textContent = new Date().getFullYear();

function zamknijMenu() {
  przyciskMenu.setAttribute('aria-expanded', 'false');
  przyciskMenu.setAttribute('aria-label', 'Otwórz nawigację');
  nawigacja.classList.remove('otwarte');
}

przyciskMenu.addEventListener('click', () => {
  const czyOtwarte = przyciskMenu.getAttribute('aria-expanded') === 'true';

  przyciskMenu.setAttribute('aria-expanded', String(!czyOtwarte));
  przyciskMenu.setAttribute('aria-label', czyOtwarte ? 'Otwórz nawigację' : 'Zamknij nawigację');
  nawigacja.classList.toggle('otwarte', !czyOtwarte);
});

nawigacja.addEventListener('click', (zdarzenie) => {
  if (zdarzenie.target.closest('a')) {
    zamknijMenu();
  }
});

document.addEventListener('keydown', (zdarzenie) => {
  if (zdarzenie.key === 'Escape') {
    zamknijMenu();
  }
});

formularzZapytania.addEventListener('submit', (zdarzenie) => {
  zdarzenie.preventDefault();

  const daneFormularza = new FormData(formularzZapytania);
  const temat = `Zapytanie o projekt: ${daneFormularza.get('rodzaj-projektu')}`;
  const wiadomosc = [
    `Imię: ${daneFormularza.get('imie')}`,
    `E-mail: ${daneFormularza.get('adres-email')}`,
    `Rodzaj projektu: ${daneFormularza.get('rodzaj-projektu')}`,
    '',
    daneFormularza.get('wiadomosc')
  ].join('\n');
  const linkDoWiadomosci = `mailto:hello@fieldwork.studio?subject=${encodeURIComponent(temat)}&body=${encodeURIComponent(wiadomosc)}`;

  statusFormularza.textContent = 'Otwieramy program pocztowy z przygotowaną wiadomością...';
  window.location.href = linkDoWiadomosci;
});