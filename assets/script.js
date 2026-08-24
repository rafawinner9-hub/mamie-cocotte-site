// ---- Horaires réels (0=dimanche ... 6=samedi), en heures décimales ----
const HOURS = {
  0: [[11.75,13.75],[18.5,21.5]],
  1: [[11.75,13.75],[18.5,21.5]],
  2: [[11.75,13.75],[18.5,21.5]],
  3: [[11.75,13.75],[18.5,21.5]],
  4: [[11.75,13.75],[18.5,21.5]],
  5: [[11.75,13.75],[18.5,22.5]],
  6: [[11.75,13.75],[18.5,22.5]],
};

function fmt(dec){
  let h = Math.floor(dec);
  let m = Math.round((dec - h) * 60);
  if(m === 60){ h += 1; m = 0; }
  return h + 'h' + (m < 10 ? '0' + m : m);
}

function computeStatus(){
  const now = new Date();
  const day = now.getDay();
  const t = now.getHours() + now.getMinutes()/60;
  const ranges = HOURS[day];

  for(const [start, end] of ranges){
    if(t >= start && t < end){
      return { open:true, text:'Ouvert', detail:'Ferme à ' + fmt(end) };
    }
  }
  for(const [start, end] of ranges){
    if(t < start){
      return { open:false, text:'Fermé', detail:'Ouvre à ' + fmt(start) };
    }
  }
  for(let i=1; i<=7; i++){
    const nd = (day + i) % 7;
    if(HOURS[nd] && HOURS[nd].length){
      const jours = ['dimanche','lundi','mardi','mercredi','jeudi','vendredi','samedi'];
      const label = i === 1 ? 'demain' : jours[nd];
      return { open:false, text:'Fermé', detail:'Réouvre ' + label + ' à ' + fmt(HOURS[nd][0][0]) };
    }
  }
  return { open:false, text:'Fermé', detail:'' };
}

function updateStatus(){
  const s = computeStatus();

  const chip = document.getElementById('statusChip');
  const chipText = document.getElementById('statusChipText');
  if(chip){
    chip.classList.remove('open','closed');
    chip.classList.add(s.open ? 'open' : 'closed');
    chipText.textContent = s.text + ' · ' + s.detail;
  }

  const eb = document.getElementById('eyebrowStatus');
  const ebText = document.getElementById('eyebrowStatusText');
  if(eb){
    eb.classList.remove('open','closed');
    eb.classList.add(s.open ? 'open' : 'closed');
    ebText.textContent = (s.open ? '● Ouvert maintenant · ' : '● Fermé · ') + s.detail;
  }

  const big = document.getElementById('bigStatus');
  const bigText = document.getElementById('bigStatusText');
  const bigSub = document.getElementById('bigStatusSub');
  if(big){
    big.querySelector('.pulse').style.background = s.open ? '#3DDC84' : '#F2857D';
    bigText.textContent = s.open ? 'Ouvert actuellement' : 'Fermé actuellement';
    bigSub.textContent = s.detail;
  }

  const today = new Date().getDay();
  document.querySelectorAll('.sign-row').forEach(row => {
    row.classList.remove('today');
    const badge = row.querySelector('.today-badge');
    if(badge) badge.remove();
    if(parseInt(row.dataset.day) === today){
      row.classList.add('today');
      const dayEl = row.querySelector('.day');
      const b = document.createElement('span');
      b.className = 'today-badge';
      b.textContent = "aujourd'hui";
      dayEl.appendChild(b);
    }
  });
}

// ---- Nav actif selon la page courante ----
function setActiveNav(){
  const current = document.body.dataset.page;
  if(!current) return;
  document.querySelectorAll('.nav-links a[data-page]').forEach(a => {
    a.classList.toggle('active', a.dataset.page === current);
  });
}

// ---- Reveal au scroll ----
function initReveal(){
  const els = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
  }, {threshold:0.15});
  els.forEach(el => io.observe(el));
}

updateStatus();
setInterval(updateStatus, 60000);
setActiveNav();
initReveal();
