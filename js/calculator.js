  // ---------- TABS ----------
  const tabBtns = document.querySelectorAll('.tab-btn');
  const panels = document.querySelectorAll('.panel');
  tabBtns.forEach(btn=>{
    btn.addEventListener('click', ()=>{
      tabBtns.forEach(b=>b.classList.remove('active'));
      panels.forEach(p=>p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('panel-'+btn.dataset.tab).classList.add('active');
    });
  });

  // ---------- STAT CALCULATOR ----------
  const STATS = [
    {key:'INT', name:'Intelligence'},
    {key:'REF', name:'Reflexes'},
    {key:'TECH', name:'Technical Ability'},
    {key:'COOL', name:'Cool'},
    {key:'ATTR', name:'Attractiveness'},
    {key:'LUCK', name:'Luck'},
    {key:'MA', name:'Movement Allowance'},
    {key:'BODY', name:'Body Type'},
    {key:'EMP', name:'Empathy'},
  ];
  const POOL = 62;
  const MIN = 2, MAX = 10;

  const ROLE_PRESETS = {
    Solo:       {INT:6, REF:8, TECH:5, COOL:7, ATTR:6, LUCK:5, MA:7, BODY:8, EMP:6},
    Netrunner:  {INT:9, REF:5, TECH:7, COOL:6, ATTR:4, LUCK:6, MA:5, BODY:4, EMP:6},
    Techie:     {INT:7, REF:5, TECH:9, COOL:6, ATTR:5, LUCK:5, MA:6, BODY:6, EMP:6},
    Medtech:    {INT:7, REF:5, TECH:6, COOL:6, ATTR:5, LUCK:5, MA:5, BODY:5, EMP:7},
    Media:      {INT:8, REF:5, TECH:5, COOL:7, ATTR:6, LUCK:6, MA:6, BODY:4, EMP:7},
    Cop:        {INT:6, REF:7, TECH:5, COOL:7, ATTR:5, LUCK:5, MA:6, BODY:7, EMP:6},
    Corporate:  {INT:8, REF:5, TECH:5, COOL:7, ATTR:6, LUCK:6, MA:6, BODY:4, EMP:6},
    Fixer:      {INT:7, REF:6, TECH:5, COOL:8, ATTR:6, LUCK:6, MA:6, BODY:5, EMP:7},
    Nomad:      {INT:6, REF:7, TECH:6, COOL:6, ATTR:5, LUCK:6, MA:7, BODY:7, EMP:6},
    Rockerboy:  {INT:7, REF:6, TECH:5, COOL:8, ATTR:8, LUCK:6, MA:7, BODY:5, EMP:7}
  };

  const values = {};
  const crole = document.getElementById('crole');

  function applyRolePreset(role){
    const preset = ROLE_PRESETS[role] || ROLE_PRESETS.Solo;
    STATS.forEach(s => {
      values[s.key] = preset[s.key];
      const inp = document.getElementById('stat-'+s.key);
      if(inp) inp.value = preset[s.key];
    });
    updateBudget();
    updateDerived();
  }

  const statGrid = document.getElementById('statGrid');
  STATS.forEach(s=>{
    const box = document.createElement('div');
    box.className='stat-box';
    box.innerHTML = `
      <div class="name"><b>${s.key}</b><span>${s.name}</span></div>
      <div class="stat-controls">
        <button type="button" data-act="dec" data-key="${s.key}">−</button>
        <input type="number" min="${MIN}" max="${MAX}" value="7" id="stat-${s.key}" readonly>
        <button type="button" data-act="inc" data-key="${s.key}">+</button>
      </div>`;
    statGrid.appendChild(box);
  });

  crole.addEventListener('change', () => {
    applyRolePreset(crole.value);
    const dossier = document.querySelector('.dossier');
    if(dossier) dossier.classList.add('role-applied');
  });

  function currentTotal(){
    return Object.values(values).reduce((a,b)=>a+b,0);
  }

  function updateBudget(){
    const total = currentTotal();
    const remaining = POOL - total;
    const bar = document.getElementById('budgetBar');
    document.getElementById('remainingVal').textContent = remaining;
    document.getElementById('totalPool').textContent = POOL;
    bar.classList.toggle('over', remaining < 0);
    bar.classList.toggle('ok', remaining >= 0);
  }

  function bodyTypeInfo(body){
    if(body<=3) return {label:'Слабое (Weak)', dmgBonus:'−2 к рукопашному урону'};
    if(body<=7) return {label:'Среднее (Average)', dmgBonus:'без модификатора'};
    if(body<=9) return {label:'Сильное (Strong)', dmgBonus:'+1 к рукопашному урону'};
    return {label:'Очень сильное (Very Strong)', dmgBonus:'+2 к рукопашному урону'};
  }

  function updateDerived(){
    const humanity = values.EMP * 10;
    const run = values.MA * 3;
    const leap = Math.round((values.MA/4)*10)/10;
    const bt = bodyTypeInfo(values.BODY);
    const derivedGrid = document.getElementById('derivedGrid');
    derivedGrid.innerHTML = `
      <div class="d-box"><span class="val">${humanity}</span><span class="lbl">Humanity (старт., EMP×10)</span></div>
      <div class="d-box"><span class="val">${run} м</span><span class="lbl">Бег за раунд (MA×3, ориент.)</span></div>
      <div class="d-box"><span class="val">${leap} м</span><span class="lbl">Прыжок в длину (ориент.)</span></div>
      <div class="d-box"><span class="val">${bt.label}</span><span class="lbl">Body Type: ${bt.dmgBonus}</span></div>
    `;
  }

  statGrid.addEventListener('click', (e)=>{
    const btn = e.target.closest('button');
    if(!btn) return;
    const key = btn.dataset.key;
    const delta = btn.dataset.act === 'inc' ? 1 : -1;
    const next = values[key] + delta;
    if(next < MIN || next > MAX) return;
    values[key] = next;
    document.getElementById('stat-'+key).value = next;
    updateBudget();
    updateDerived();
  });

  applyRolePreset(crole.value);
  // if a role is preselected on load, mark fields as role-applied
  const dossierInit = document.querySelector('.dossier');
  if(dossierInit) dossierInit.classList.add('role-applied');

  // ---------- IMPLANT CATALOG ----------
  const IMPLANTS = [
    ['Базовый нейропроцессор','Neuralware','1000','1d6','Основа для нейроимплантов'],
    ['Chipware Socket','Neuralware','200','1d6/2','Разъём для чипов навыков'],
    ['Интерфейсные разъёмы (пара)','Neuralware','200','1d6','Подключение к технике и Сети'],
    ['Kerenzikov BoostWare','Neuralware','500','1d6 / 2d6','Ускоритель рефлексов'],
    ['Sandevistan SpeedWare','Neuralware','1600','1d6/2','Кратковременное ускорение реакции'],
    ['Pain Editor','Neuralware','200','2d6','Снижает влияние боли'],
    ['SmartGun Link','Neuralware','100','2','Интерфейс связи со смарт-оружием (+2)'],
    ['Подкожная броня SP 12','Bodyware','1200','2d6','Защита под кожей'],
    ['Кибероптический модуль','Cyberoptics','1000','2d6','Базовая кибероптика'],
    ['Ночное видение (Low-Light)','Cyberoptics','200','2','Ночное зрение'],
    ['Прицельный модуль (Targeting Scope)','Cyberoptics','200','2','Модуль прицеливания (+1 к попаданию)'],
    ['Кибераудио','Cyberaudio','500','1d6','Базовый аудиомодуль'],
    ['Усилитель слуха','Cyberaudio','100','2','Повышение чувствительности слуха'],
    ['Киберрука','Cyberlimbs','1000','2d6','Замена руки; допускает модификации'],
    ['Кибернога','Cyberlimbs','1200','2d6','Замена ноги; допускает модификации'],
    ['Rippers','Body Weapons','400','3d6','Выдвижные лезвия'],
    ['Wolvers','Body Weapons','600','3d6+1','Усиленные выдвижные когти'],
    ['Sigma Linear Frame','Linear Frames','6000','2d6','Силовой каркас, STR 12'],
    ['Biomonitor','Fashionware','100','1','Мониторинг состояния здоровья']
  ];

  const implantBody = document.querySelector('#implantTable tbody');
  const implantSearch = document.getElementById('implantSearch');
  const implantCategory = document.getElementById('implantCategory');

  function renderImplants(){
    const q = implantSearch.value.trim().toLowerCase();
    const cat = implantCategory.value;
    implantBody.innerHTML = IMPLANTS
      .filter(i => (cat === 'all' || i[1] === cat) &&
                   (!q || i.some(v => String(v).toLowerCase().includes(q))))
      .map(i => `<tr><td><b>${i[0]}</b></td><td>${i[1]}</td><td>${i[2]}</td><td>${i[3]}</td><td>${i[4]}</td></tr>`)
      .join('');
  }
  implantSearch.addEventListener('input', renderImplants);
  implantCategory.addEventListener('change', renderImplants);
  renderImplants();

  // ---------- CHARACTER SHEET PDF ----------
  function syncCharacterTitle(){
    const name = document.getElementById('cname').value.trim() || 'Безымянный персонаж';
    document.title = 'Cyberpunk 2020 — ' + name;
  }
  document.getElementById('cname').addEventListener('input', syncCharacterTitle);

  // Helper: toggle field label accent between white (default) and yellow ('warn')
  function setFieldLabelStyle(style){
    const dossier = document.querySelector('.dossier');
    if(!dossier) return;
    dossier.classList.remove('labels-warn');
    if(style === 'warn') dossier.classList.add('labels-warn');
  }

  // `ccampaign` is a single freeform input with a datalist of common corps/bands; no JS sync required.

  document.getElementById('downloadPdf').addEventListener('click', () => {
    const element = document.querySelector('.dossier');
    // temporarily switch page to print-like sheet
    document.body.classList.add('pdf-mode');

    // remember and override inline spacing so content starts at top
    const prevMarginTop = element.style.marginTop || '';
    const prevPaddingTop = element.style.paddingTop || '';
    element.style.marginTop = '0';
    element.style.paddingTop = '6px';

    // ensure viewport is at the top so html2canvas captures from page top
    window.scrollTo(0,0);
    document.documentElement.scrollTop = 0;
    element.scrollTop = 0;

    const opt = {
      margin:       0,
      filename:     (document.getElementById('cname').value || 'character') + '_cp2020.pdf',
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, backgroundColor: '#ffffff', scrollY: 0 },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    // wait for fonts, then export; restore styles afterwards
    document.fonts.ready.then(() => {
      html2pdf().set(opt).from(element).save().then(() => {
        document.body.classList.remove('pdf-mode');
        element.style.marginTop = prevMarginTop;
        element.style.paddingTop = prevPaddingTop;
      }).catch(() => {
        document.body.classList.remove('pdf-mode');
        element.style.marginTop = prevMarginTop;
        element.style.paddingTop = prevPaddingTop;
      });
    });
  });
