(() => {
  'use strict';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const capNames = {all:'全部能力',insight:'洞察与研究',analysis:'数据分析与判断',product:'产品设计与实现',content:'内容策划与运营',strategy:'品牌与策略传播',ai:'AI 应用与创作'};
  const kindNames = {all:'全部类型',reporting:'报道',paper:'论文',thesis:'毕业设计',strategy:'策划',miniapp:'vibe coding小程序',pet:'桌宠',stickers:'表情包',video:'视频',photography:'摄影'};
  const cards = [...document.querySelectorAll('[data-project]')];
  const caps = [...document.querySelectorAll('[data-filter]')];
  const kinds = [...document.querySelectorAll('[data-kind-filter]')];
  const searchForm = document.getElementById('work-search-form');
  const searchInput = document.getElementById('work-search');
  const clearSearch = document.getElementById('clear-search');
  const resetSearchFilters = document.getElementById('reset-search-filters');
  const searchEmpty = document.getElementById('search-empty');
  const normalize = value => value.normalize('NFKC').toLowerCase();
  const searchText = new Map(cards.map(card => [card,normalize(card.dataset.search || card.textContent)]));
  const hasCapability = (card,cap) => cap === 'all' || (card.dataset.capabilities || card.dataset.capability || '').split(/\s+/).includes(cap);
  let selectedCap = 'all', selectedKind = 'all', selectedQuery = '', composing = false;
  function render(cap, kind, animate=false) {
    selectedCap = Object.hasOwn(capNames,cap) ? cap : 'all';
    const available = new Set(cards.filter(card => hasCapability(card,selectedCap)).map(card=>card.dataset.kind));
    const terms = normalize(selectedQuery).trim().split(/\s+/).filter(Boolean);
    selectedKind = selectedCap !== 'all' && available.has(kind) ? kind : 'all';
    document.querySelector('.sub-filter-row').hidden = selectedCap === 'all';
    caps.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.filter === selectedCap)));
    kinds.forEach(button=>{
      button.hidden = button.dataset.kindFilter !== 'all' && !available.has(button.dataset.kindFilter);
      button.setAttribute('aria-pressed',String(button.dataset.kindFilter === selectedKind));
    });
    let total = 0;
    cards.forEach(card=>{
      const visible = hasCapability(card,selectedCap) && (selectedKind === 'all' || card.dataset.kind === selectedKind) && terms.every(term=>searchText.get(card).includes(term));
      card.hidden = !visible;
      card.classList.remove('filter-in');
      if (visible) {
        total++;
        if (animate && !reduced.matches) {
          card.classList.add('is-visible','filter-in');
          card.style.setProperty('--delay',`${Math.min(total-1,4)*45}ms`);
        }
      }
      const link = card.querySelector('.project-link');
      const destination = new URL(link.href);
      destination.searchParams.set('from',selectedCap);
      if(selectedKind==='all') destination.searchParams.delete('type');
      else destination.searchParams.set('type',selectedKind);
      if(selectedQuery.trim()) destination.searchParams.set('q',selectedQuery.trim());
      else destination.searchParams.delete('q');
      link.href = destination.pathname + destination.search + destination.hash;
    });
    document.querySelectorAll('[data-kind-section]').forEach(group=>{
      const count = [...group.querySelectorAll('[data-project]')].filter(card=>!card.hidden).length;
      group.hidden = count === 0;
      group.querySelector('.kind-count').textContent = String(count);
    });
    const scope = selectedCap === 'all' ? '全部作品' : `${capNames[selectedCap]} / ${kindNames[selectedKind]}`;
    document.getElementById('result-status').textContent = selectedQuery.trim()
      ? `${scope} · “${selectedQuery.trim()}” · 找到 ${total} 件作品`
      : `${scope}${selectedCap === 'all' ? ' · 按类型分组' : ''} · ${total} 件作品`;
    if(clearSearch) clearSearch.hidden = selectedQuery.length === 0;
    if(searchEmpty) searchEmpty.hidden = total !== 0;
  }
  function canonicalUrl() {
    const url = new URL(location.href);
    for(const [name,value] of [['capability',selectedCap],['type',selectedKind]]) {
      if(value === 'all') url.searchParams.delete(name); else url.searchParams.set(name,value);
    }
    if(selectedQuery.trim()) url.searchParams.set('q',selectedQuery.trim());
    else url.searchParams.delete('q');
    if (url.hash === '#reading' || url.hash === '#system') url.hash = '#work';
    return url;
  }
  function readUrl() {
    const url = new URL(location.href);
    selectedQuery = url.searchParams.get('q') || '';
    if(searchInput) searchInput.value = selectedQuery;
    render(url.searchParams.get('capability') || 'all',url.searchParams.get('type') || 'all');
    const clean = canonicalUrl();
    if(clean.href!==location.href) history.replaceState(null,'',clean);
  }
  function syncSearch() {
    selectedQuery = searchInput ? searchInput.value : '';
    render(selectedCap,selectedKind);
    const url = canonicalUrl();
    url.hash = 'work';
    if(url.href!==location.href) history.replaceState(null,'',url);
  }
  if (cards.length) {
    caps.forEach(button=>button.addEventListener('click',()=>{
      render(button.dataset.filter,'all',true);
      const url=canonicalUrl();
      url.hash='work';
      if(url.href!==location.href) history.pushState(null,'',url);
    }));
    if(searchInput) {
      searchInput.addEventListener('compositionstart',()=>{composing=true;});
      searchInput.addEventListener('compositionend',()=>{composing=false;syncSearch();});
      searchInput.addEventListener('input',event=>{if(!composing && !event.isComposing) syncSearch();});
      // Some browsers dispatch a dedicated event for the built-in search clear button.
      searchInput.addEventListener('search',()=>{if(!composing) syncSearch();});
    }
    if(searchForm) searchForm.addEventListener('submit',event=>{
      event.preventDefault();
      if(!composing) syncSearch();
    });
    if(clearSearch) clearSearch.addEventListener('click',()=>{
      if(searchInput) {searchInput.value='';syncSearch();searchInput.focus();}
    });
    if(resetSearchFilters) resetSearchFilters.addEventListener('click',()=>{
      selectedQuery='';
      if(searchInput) searchInput.value='';
      render('all','all',true);
      const url=canonicalUrl();
      url.hash='work';
      if(url.href!==location.href) history.pushState(null,'',url);
      if(searchInput) searchInput.focus();
    });
    kinds.forEach(button=>button.addEventListener('click',()=>{
      render(selectedCap,button.dataset.kindFilter,true);
      const url=canonicalUrl();
      url.hash='work';
      if(url.href!==location.href) history.pushState(null,'',url);
    }));
    window.addEventListener('popstate',readUrl);
    readUrl();
  }
  const origin = new URLSearchParams(location.search);
  document.querySelectorAll('[data-return]').forEach(link=>{
    if(!origin.has('from') && !origin.has('q')) return;
    const cap=origin.get('from'), kind=origin.get('type'), query=(origin.get('q') || '').trim();
    const url=new URL('../index.html',location.href);
    if(cap==='about') {
      url.hash='about'; link.href=url.pathname+url.hash;
      link.textContent='← 返回个人介绍';
      return;
    }
    if(Object.hasOwn(capNames,cap) && cap!=='all') url.searchParams.set('capability',cap);
    if(Object.hasOwn(kindNames,kind) && kind!=='all') url.searchParams.set('type',kind);
    if(query) url.searchParams.set('q',query);
    url.hash='work'; link.href=url.pathname+url.search+url.hash;
    link.textContent=query ? '← 返回搜索结果' : '← 返回刚才的作品分类';
  });
  const report=document.querySelector('.full-report');
  document.querySelectorAll('[data-read-complete]').forEach(link=>link.addEventListener('click',()=>{if(report) report.open=true;}));
  if(report && location.hash==='#fulltext') report.open=true;
  const revealNodes=[...document.querySelectorAll('.reveal')];
  if(!reduced.matches && 'IntersectionObserver' in window) {
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(entry.isIntersecting) {entry.target.classList.add('is-visible');observer.unobserve(entry.target);}
    }),{threshold:.04,rootMargin:'0px 0px 40px 0px'});
    revealNodes.forEach(node=>{node.dataset.revealReady='';observer.observe(node);});
    reduced.addEventListener('change',event=>{if(event.matches) {observer.disconnect();revealNodes.forEach(node=>node.classList.add('is-visible'));}});
  }
  document.querySelectorAll('.gif-toggle').forEach(button=>button.addEventListener('click',()=>{
    const playing=button.getAttribute('aria-pressed')!=='true';
    button.setAttribute('aria-pressed',String(playing));
    button.querySelector('img').src=playing?button.dataset.gif:button.dataset.poster;
    button.querySelector('.gif-state').textContent=playing?'暂停动图 Ⅱ':'播放动图 ▷';
    button.setAttribute('aria-label',`${playing?'暂停':'播放'}表情：${button.querySelector('img').alt}`);
  }));
  document.querySelectorAll('[data-page-reader]').forEach(reader=>{
    const pages=JSON.parse(reader.querySelector('.page-sources').textContent);
    const select=reader.querySelector('[data-page-select]');
    const previous=reader.querySelector('[data-page-prev]');
    const next=reader.querySelector('[data-page-next]');
    const image=reader.querySelector('.document-page');
    let page=0;
    function show(index) {
      page=Math.max(0,Math.min(pages.length-1,index));
      select.value=String(page);
      previous.disabled=page===0;
      next.disabled=page===pages.length-1;
      image.src=pages[page];
      image.alt=`${image.dataset.docTitle}，第 ${page+1} 页，共 ${pages.length} 页`;
      reader.querySelector('.page-image-link').href=pages[page];
      reader.querySelector('.reader-status').textContent=`${page+1} / ${pages.length}`;
      image.classList.remove('page-enter');
      if(!reduced.matches) {void image.offsetWidth;image.classList.add('page-enter');}
    }
    previous.addEventListener('click',()=>show(page-1));
    next.addEventListener('click',()=>show(page+1));
    select.addEventListener('change',()=>show(Number(select.value)));
    reader.addEventListener('keydown',event=>{
      if(event.target.tagName==='SELECT') return;
      if(event.key==='ArrowRight') {event.preventDefault();show(page+1);}
      if(event.key==='ArrowLeft') {event.preventDefault();show(page-1);}
    });
    image.addEventListener('error',()=>{
      reader.querySelector('.reader-help').textContent='这一页暂时未能加载，请重新选择页码或刷新页面后再试。';
    });
    image.addEventListener('load',()=>{
      reader.querySelector('.reader-help').textContent='点击页面可放大查看。阅读器聚焦后可用左右方向键翻页。';
    });
  });
})();
