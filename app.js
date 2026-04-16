let moje_zadania = [];
let filtr_aktywny = 'all';
let filtr_prio = null;
let tekst_szukany = '';

const lista_div = document.getElementById('kontener_listy');
const pusto_div = document.getElementById('brak_zadan');
const form_zadania = document.getElementById('moj_form');
const okno_modal = document.getElementById('modal_zadania');

window.onload = function () {
    wczytaj_z_pamieci();
    ustaw_dzis();
    podepnij_eventy();
    odswiez_widok();
};

function podepnij_eventy() {
    document.getElementById('guzik_nowe').onclick = () => otworz_okno();
    document.getElementById('anuluj_guzik').onclick = () => zamknij_okno();
    
    const btn_zamknij = document.getElementById('zamknij_modal');
    if (btn_zamknij) btn_zamknij.onclick = () => zamknij_okno();

    form_zadania.onsubmit = function (e) {
        e.preventDefault();
        zapisz_zadanie();
    };

    document.getElementById('szukaj_input').oninput = (e) => {
        tekst_szukany = e.target.value.toLowerCase();
        odswiez_widok();
    };

    document.querySelectorAll('.guzik_menu[data-filter]').forEach(guzik => {
        guzik.onclick = () => {
            document.querySelectorAll('.guzik_menu[data-filter]').forEach(g => g.classList.remove('aktywny'));
            guzik.classList.add('aktywny');
            filtr_aktywny = guzik.dataset.filter;
            filtr_prio = null; 
            document.querySelectorAll('.guzik_menu[data-priority]').forEach(g => g.classList.remove('aktywny'));
            document.getElementById('napis_widoku').innerText = 'Widok: ' + guzik.innerText;
            odswiez_widok();
        };
    });

    document.querySelectorAll('.guzik_menu[data-priority]').forEach(guzik => {
        guzik.onclick = () => {
            let byl_juz = guzik.classList.contains('aktywny');
            document.querySelectorAll('.guzik_menu[data-priority]').forEach(g => g.classList.remove('aktywny'));
            if (byl_juz) {
                filtr_prio = null;
            } else {
                guzik.classList.add('aktywny');
                filtr_prio = guzik.dataset.priority;
            }
            odswiez_widok();
        };
    });

    window.onclick = (e) => {
        if (e.target == okno_modal) zamknij_okno();
    };
}

function zapisz_zadanie() {
    const id = document.getElementById('task_id').value;
    const t = document.getElementById('inp_tytul').value.trim();
    const o = document.getElementById('inp_opis').value.trim();
    const p = document.getElementById('inp_prio').value;
    const k = document.getElementById('inp_kat').value.trim() || 'Ogólne';

    if (!t) return alert('Wpisz tytuł!');

    if (id) {
        let zad = moje_zadania.find(x => x.id == id);
        if (zad) {
            zad.tytul = t;
            zad.opis = o;
            zad.priorytet = p;
            zad.kategoria = k;
        }
    } else {
        moje_zadania.push({
            id: Date.now(),
            tytul: t,
            opis: o,
            priorytet: p,
            kategoria: k,
            gotowe: false,
            data: new Date().getTime()
        });
    }

    zapisz_local();
    zamknij_okno();
    odswiez_widok();
}

function odswiez_widok() {
    let widoczne = moje_zadania.filter(z => {
        if (filtr_aktywny == 'active' && z.gotowe) return false;
        if (filtr_aktywny == 'completed' && !z.gotowe) return false;
        if (filtr_prio && z.priorytet != filtr_prio) return false;
        
        if (tekst_szukany) {
            let info = (z.tytul + z.opis + z.kategoria).toLowerCase();
            if (!info.includes(tekst_szukany)) return false;
        }
        return true;
    });

    widoczne.sort((a, b) => b.data - a.data);

    lista_div.innerHTML = '';
    if (widoczne.length == 0) {
        pusto_div.classList.remove('ukryj');
    } else {
        pusto_div.classList.add('ukryj');
        widoczne.forEach(z => {
            let karta = document.createElement('div');
            karta.className = 'zadanie_box' + (z.gotowe ? ' gotowe' : '');
            karta.innerHTML = `
                <div class="zadanie_info">
                    <span class="prio ${z.priorytet.toLowerCase()}">${z.priorytet}</span>
                    <strong style="font-size: 11px; margin-left: 5px;">[${z.kategoria}]</strong>
                    <h3>${z.tytul}</h3>
                    <p style="margin: 5px 0;">${z.opis || 'Brak opisu.'}</p>
                    <small>Dodano: ${new Date(z.data).toLocaleDateString('pl-PL')}</small>
                </div>
                <div class="zadanie_akcje">
                    <button onclick="event.stopPropagation(); zmien_stan(${z.id})">${z.gotowe ? '↩️' : 'Zrobione'}</button>
                    <button onclick="event.stopPropagation(); usun_zad(${z.id})" style="color: red;">Usuń</button>
                    <button onclick="event.stopPropagation(); otworz_okno(${JSON.stringify(z).replace(/"/g, '&quot;')})">Edytuj</button>
                </div>
            `;
            lista_div.appendChild(karta);
        });
    }
    pokaz_postep();
}

function zmien_stan(id) {
    let zad = moje_zadania.find(x => x.id == id);
    if (zad) zad.gotowe = !zad.gotowe;
    zapisz_local();
    odswiez_widok();
}

function usun_zad(id) {
    if (confirm('Czy chcesz usunąć to zadanie?')) {
        moje_zadania = moje_zadania.filter(x => x.id != id);
        zapisz_local();
        odswiez_widok();
    }
}

function otworz_okno(zad = null) {
    if (zad) {
        document.getElementById('modal_tytul').innerText = 'Edycja Zadania';
        document.getElementById('task_id').value = zad.id;
        document.getElementById('inp_tytul').value = zad.tytul;
        document.getElementById('inp_opis').value = zad.opis;
        document.getElementById('inp_prio').value = zad.priorytet;
        document.getElementById('inp_kat').value = zad.kategoria;
    } else {
        document.getElementById('modal_tytul').innerText = 'Nowe Zadanie';
        form_zadania.reset();
        document.getElementById('task_id').value = '';
    }
    okno_modal.classList.remove('ukryj');
}

function zamknij_okno() {
    okno_modal.classList.add('ukryj');
}

function pokaz_postep() {
    let total = moje_zadania.length;
    let done = moje_zadania.filter(x => x.gotowe).length;
    let proc = total > 0 ? (done / total) * 100 : 0;

    document.getElementById('moj_postep').style.width = proc + '%';
    document.getElementById('label_stat').innerText = done + ' / ' + total + ' zadań ukończonych';

    ['High', 'Medium', 'Low'].forEach(prio => {
        let ile = moje_zadania.filter(x => x.priorytet == prio && !x.gotowe).length;
        let el = document.querySelector(`.licznik_prio[data-priority="${prio}"]`);
        if (el) el.innerText = ile;
    });
}

function zapisz_local() {
    localStorage.setItem('moje_zadania_szkolne', JSON.stringify(moje_zadania));
}

function wczytaj_z_pamieci() {
    let d = localStorage.getItem('moje_zadania_szkolne');
    if (d) moje_zadania = JSON.parse(d);
}

function ustaw_dzis() {
    const d = new Date();
    const opcje = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    document.getElementById('data_dzis').innerText = d.toLocaleDateString('pl-PL', opcje);
}
