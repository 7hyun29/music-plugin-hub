// 화면은 data.js(= data/plugins.json에서 생성)를 보여주기만 한다.
(function () {
  'use strict';

  var PLUGINS = (window.PLUGIN_DATA && window.PLUGIN_DATA.plugins) || [];
  var TYPE_ORDER = ['오케스트라 라이브러리', 'Kontakt 라이브러리', '신스', '샘플러', 'EQ', '컴프', '리버브', '유틸', '기타'];
  var FORMAT_ORDER = ['VST3', 'VST2', 'AU', 'AAX'];
  var LOCATIONS = [['windows', 'Windows'], ['mac', 'Mac']];
  var LOC_LABEL = { windows: 'Windows', mac: 'Mac' };

  var state = {
    q: '',
    type: new Set(),
    loc: new Set(),
    fmt: new Set(),
    view: load('view', 'card'),
    sortKey: 'name',
    sortDir: 1
  };

  var $ = function (id) { return document.getElementById(id); };

  function load(key, fallback) {
    try { return localStorage.getItem('plugin-hub.' + key) || fallback; } catch (e) { return fallback; }
  }
  function save(key, value) {
    try { localStorage.setItem('plugin-hub.' + key, value); } catch (e) { /* 저장 못 해도 동작에는 문제없음 */ }
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  // 띄어쓰기·대소문자 무시: "게임BGM"으로 "게임 BGM"도 찾기
  function norm(s) { return String(s || '').toLowerCase().replace(/\s+/g, ''); }

  function haystack(p) {
    return norm([p.name, p.vendor, p.type, (p.tags || []).join(' '), p.note].join(' '));
  }
  PLUGINS.forEach(function (p) { p._hay = haystack(p); });

  function matches(p, skip) {
    if (state.q && p._hay.indexOf(norm(state.q)) === -1) return false;
    if (skip !== 'type' && state.type.size && !state.type.has(p.type)) return false;
    if (skip !== 'loc' && state.loc.size && !(p.locations || []).some(function (l) { return state.loc.has(l); })) return false;
    if (skip !== 'fmt' && state.fmt.size && !(p.formats || []).some(function (f) { return state.fmt.has(f); })) return false;
    return true;
  }

  // 필터 칩: 다른 조건을 적용했을 때의 개수를 함께 표시
  function renderChips(elId, group, options) {
    var el = $(elId);
    el.innerHTML = options.map(function (o) {
      var value = o[0], label = o[1];
      var n = PLUGINS.filter(function (p) {
        if (!matches(p, group)) return false;
        if (group === 'type') return p.type === value;
        if (group === 'loc') return (p.locations || []).indexOf(value) !== -1;
        return (p.formats || []).indexOf(value) !== -1;
      }).length;
      var on = state[group].has(value) ? ' on' : '';
      return '<button type="button" class="chip' + on + '" data-group="' + group + '" data-value="' + esc(value) + '">' +
        esc(label) + '<span class="n">' + n + '</span></button>';
    }).join('');
  }

  function presentTypes() {
    var have = new Set(PLUGINS.map(function (p) { return p.type; }));
    return TYPE_ORDER.filter(function (t) { return have.has(t); }).map(function (t) { return [t, t]; });
  }
  function presentFormats() {
    var have = new Set();
    PLUGINS.forEach(function (p) { (p.formats || []).forEach(function (f) { have.add(f); }); });
    return FORMAT_ORDER.filter(function (f) { return have.has(f); }).map(function (f) { return [f, f]; });
  }

  function sortValue(p, key) {
    if (key === 'locations' || key === 'formats') return (p[key] || []).join(',');
    return p[key] || '';
  }
  function sorted(list) {
    var k = state.sortKey, d = state.sortDir;
    return list.slice().sort(function (a, b) {
      var c = String(sortValue(a, k)).localeCompare(String(sortValue(b, k)), 'ko', { numeric: true, sensitivity: 'base' });
      return c !== 0 ? c * d : a.name.localeCompare(b.name, 'ko');
    });
  }

  function locBadges(p) {
    return (p.locations || []).map(function (l) {
      return '<span class="badge loc-' + esc(l) + '">' + esc(LOC_LABEL[l] || l) + '</span>';
    }).join('');
  }
  function fmtBadges(p) {
    return (p.formats || []).map(function (f) { return '<span class="badge">' + esc(f) + '</span>'; }).join('');
  }
  function tagLinks(p) {
    if (!p.tags || !p.tags.length) return '';
    return '<div class="tags">' + p.tags.map(function (t) {
      return '<button type="button" class="tag" data-tag="' + esc(t) + '">#' + esc(t) + '</button>';
    }).join('') + '</div>';
  }

  function renderCards(list) {
    return '<div class="cards">' + list.map(function (p) {
      var sub = [p.vendor, p.version].filter(Boolean).map(esc).join(' · ');
      return '<article class="card">' +
        '<div class="head"><h3>' + esc(p.name) + '</h3><span class="type">' + esc(p.type) + '</span></div>' +
        '<div class="muted">' + sub + '</div>' +
        '<div class="badges">' + locBadges(p) + fmtBadges(p) + '</div>' +
        (p.note ? '<p class="note">' + esc(p.note) + '</p>' : '') +
        tagLinks(p) +
        '</article>';
    }).join('') + '</div>';
  }

  var COLUMNS = [['name', '이름'], ['vendor', '제조사'], ['type', '종류'], ['formats', '포맷'],
                 ['locations', '설치 위치'], ['version', '버전'], ['note', '메모']];

  function renderTable(list) {
    var head = COLUMNS.map(function (c) {
      var on = state.sortKey === c[0];
      var arrow = on ? (state.sortDir === 1 ? ' ↑' : ' ↓') : '';
      return '<th' + (on ? ' class="sorted"' : '') + '><button type="button" data-sort="' + c[0] + '">' + c[1] + arrow + '</button></th>';
    }).join('');
    var rows = list.map(function (p) {
      return '<tr>' +
        '<td class="name">' + esc(p.name) + tagLinks(p) + '</td>' +
        '<td>' + esc(p.vendor) + '</td>' +
        '<td>' + esc(p.type) + '</td>' +
        '<td><div class="badges">' + fmtBadges(p) + '</div></td>' +
        '<td><div class="badges">' + locBadges(p) + '</div></td>' +
        '<td>' + esc(p.version) + '</td>' +
        '<td>' + esc(p.note) + '</td>' +
        '</tr>';
    }).join('');
    return '<div class="table-wrap"><table><thead><tr>' + head + '</tr></thead><tbody>' + rows + '</tbody></table></div>';
  }

  function render() {
    renderChips('f-type', 'type', presentTypes());
    renderChips('f-loc', 'loc', LOCATIONS);
    renderChips('f-fmt', 'fmt', presentFormats());

    var list = sorted(PLUGINS.filter(function (p) { return matches(p); }));
    $('count').textContent = list.length === PLUGINS.length
      ? '전체 ' + PLUGINS.length + '개'
      : PLUGINS.length + '개 중 ' + list.length + '개';

    document.querySelectorAll('.view-toggle button').forEach(function (b) {
      b.classList.toggle('on', b.dataset.view === state.view);
    });

    if (!PLUGINS.length) {
      $('list').innerHTML = '<div class="empty">데이터가 없습니다. data/plugins.json을 채운 뒤 build.sh를 실행하세요.</div>';
    } else if (!list.length) {
      $('list').innerHTML = '<div class="empty">조건에 맞는 플러그인이 없습니다.<br><button type="button" class="chip" id="reset">조건 초기화</button></div>';
    } else {
      $('list').innerHTML = state.view === 'table' ? renderTable(list) : renderCards(list);
    }
  }

  // 이벤트
  $('search').addEventListener('input', function (e) { state.q = e.target.value.trim(); render(); });

  document.addEventListener('click', function (e) {
    var t = e.target.closest('button');
    if (!t) return;
    if (t.dataset.group) {
      var set = state[t.dataset.group];
      set.has(t.dataset.value) ? set.delete(t.dataset.value) : set.add(t.dataset.value);
    } else if (t.dataset.view) {
      state.view = t.dataset.view;
      save('view', state.view);
    } else if (t.dataset.sort) {
      if (state.sortKey === t.dataset.sort) state.sortDir *= -1;
      else { state.sortKey = t.dataset.sort; state.sortDir = 1; }
    } else if (t.dataset.tag) {
      state.q = t.dataset.tag;
      $('search').value = state.q;
    } else if (t.id === 'reset') {
      state.q = ''; $('search').value = '';
      state.type.clear(); state.loc.clear(); state.fmt.clear();
    } else {
      return;
    }
    render();
  });

  document.addEventListener('keydown', function (e) {
    var inInput = document.activeElement === $('search');
    if (e.key === '/' && !inInput) { e.preventDefault(); $('search').focus(); $('search').select(); }
    if (e.key === 'Escape' && inInput) { $('search').value = ''; state.q = ''; render(); }
  });

  render();
})();
