// 화면은 data.js(= data/plugins.json에서 생성)를 보여주기만 한다.
(function () {
  'use strict';

  var DATA = window.PLUGIN_DATA || {};
  var PLUGINS = DATA.plugins || [];
  var SCANS = DATA.scans || {};
  var TYPE_ORDER = ['오케스트라 라이브러리', 'Kontakt 라이브러리', '가상악기', '신스', '샘플러', 'EQ', '컴프', '리버브',
                    '앰프·새츄레이션', '이펙트', '보컬', 'MIDI 도구', '마스터링', '유틸', '기타'];
  var FORMAT_ORDER = ['VST3', 'VST2', 'AU', 'AAX'];
  var MACHINES = [['windows', 'Windows'], ['mac', 'Mac']];
  var LOC_LABEL = { windows: 'Windows', mac: 'Mac' };

  var state = {
    q: '',
    type: new Set(),
    loc: new Set(),
    fmt: new Set(),
    tag: new Set(),
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
  // 띄어쓰기·대소문자 무시: "게임BGM"으로 "게임 BGM", "Reaktor6"으로 "Reaktor 6" 찾기
  function norm(s) { return String(s || '').toLowerCase().replace(/\s+/g, ''); }
  function machinesOf(p) { return Object.keys(p.installs || {}); }

  PLUGINS.forEach(function (p) {
    p._name = norm(p.name);
    p._hay = norm([p.name, p.vendor, p.type, (p.tags || []).join(' '), p.note].join(' '));
  });

  // ---------- 검색 ----------
  function queryTokens() {
    return state.q.split(/\s+/).map(norm).filter(Boolean);
  }
  function searchMatch(p, tokens) {
    if (!tokens.length) return true;
    if (p._hay.indexOf(tokens.join('')) !== -1) return true;
    return tokens.every(function (t) { return p._hay.indexOf(t) !== -1; });   // "UADx Reverb"
  }
  // 이름이 맞을수록 앞에: 이름 시작 > 이름 포함 > 이름에 모든 단어 > 그 외(제조사·종류·태그)
  function searchScore(p, tokens) {
    if (!tokens.length) return 0;
    var whole = tokens.join('');
    if (p._name.indexOf(whole) === 0) return 0;
    if (p._name.indexOf(whole) !== -1) return 1;
    if (tokens.every(function (t) { return p._name.indexOf(t) !== -1; })) return 2;
    return 3;
  }

  // ---------- 필터 ----------
  // 위치·포맷은 "같은 기기의 설치 기록"에 함께 적용한다 (Windows + AU = Windows에 AU로 설치된 것)
  function installMatch(p, loc, fmt) {
    return machinesOf(p).some(function (m) {
      if (loc.size && !loc.has(m)) return false;
      if (!fmt.size) return true;
      return (p.installs[m].formats || []).some(function (f) { return fmt.has(f); });
    });
  }
  // over: { group, value } — 칩 개수 계산용으로 한 그룹만 그 값으로 바꿔서 검사
  function matches(p, tokens, over) {
    function set(g) { return over && over.group === g ? new Set([over.value]) : state[g]; }
    if (!searchMatch(p, tokens)) return false;
    var type = set('type'), tag = set('tag');
    if (type.size && !type.has(p.type)) return false;
    if (tag.size && !(p.tags || []).some(function (t) { return tag.has(t); })) return false;
    var loc = set('loc'), fmt = set('fmt');
    if ((loc.size || fmt.size) && !installMatch(p, loc, fmt)) return false;
    return true;
  }

  function presentTypes() {
    var have = new Set(PLUGINS.map(function (p) { return p.type; }));
    // 목록에 없는 종류가 생겨도 필터에서 빠지지 않게 뒤에 붙인다
    var extra = Array.from(have).filter(function (t) { return TYPE_ORDER.indexOf(t) === -1; }).sort();
    return TYPE_ORDER.filter(function (t) { return have.has(t); }).concat(extra).map(function (t) { return [t, t]; });
  }
  function presentFormats() {
    var have = new Set();
    PLUGINS.forEach(function (p) {
      machinesOf(p).forEach(function (m) { (p.installs[m].formats || []).forEach(function (f) { have.add(f); }); });
    });
    return FORMAT_ORDER.filter(function (f) { return have.has(f); }).map(function (f) { return [f, f]; });
  }

  function renderChips(elId, group, options, tokens) {
    $(elId).innerHTML = options.map(function (o) {
      var value = o[0], label = o[1];
      var on = state[group].has(value);
      if (group === 'loc' && !SCANS[value]) {
        // 아직 스캔하지 않은 기기: "0개"와 구분되게 표시하고 누를 수 없게
        return '<button type="button" class="chip pending" disabled aria-disabled="true" ' +
          'title="이 컴퓨터의 스캔 결과가 아직 들어오지 않았어요">' + esc(label) + ' · 스캔 미반영</button>';
      }
      var n = PLUGINS.filter(function (p) { return matches(p, tokens, { group: group, value: value }); }).length;
      var title = group === 'loc' ? ' title="마지막 스캔 ' + esc(SCANS[value]) + '"' : '';
      return '<button type="button" class="chip' + (on ? ' on' : '') + '" aria-pressed="' + on + '"' + title +
        ' data-group="' + group + '" data-value="' + esc(value) + '">' +
        (group === 'tag' ? '#' : '') + esc(label) + '<span class="n">' + n + '</span></button>';
    }).join('');
  }

  // ---------- 정렬 ----------
  function sortValue(p, key) {
    if (key === 'installs') return machinesOf(p).join(',');
    return p[key] || '';
  }
  function sorted(list, tokens) {
    // 카드 보기는 항상 이름순, 표 보기는 표에서 고른 정렬. 검색 중이면 이름이 맞는 것 먼저.
    var k = state.view === 'table' ? state.sortKey : 'name';
    var d = state.view === 'table' ? state.sortDir : 1;
    return list.slice().sort(function (a, b) {
      var s = searchScore(a, tokens) - searchScore(b, tokens);
      if (s) return s;
      var c = String(sortValue(a, k)).localeCompare(String(sortValue(b, k)), 'ko', { numeric: true, sensitivity: 'base' });
      return c !== 0 ? c * d : a.name.localeCompare(b.name, 'ko');
    });
  }

  // ---------- 그리기 ----------
  function installRows(p) {
    return '<div class="installs">' + machinesOf(p).map(function (m) {
      var rec = p.installs[m];
      var fmts = (rec.formats || []).map(function (f) { return '<span class="badge">' + esc(f) + '</span>'; }).join('');
      return '<div class="install">' +
        '<span class="badge loc-' + esc(m) + '">' + esc(LOC_LABEL[m] || m) + '</span>' + fmts +
        (rec.version ? '<span class="ver">' + esc(rec.version) + '</span>' : '') +
        '</div>';
    }).join('') + '</div>';
  }
  function tagButtons(p) {
    if (!p.tags || !p.tags.length) return '';
    return '<div class="tags">' + p.tags.map(function (t) {
      return '<button type="button" class="tag" data-tag="' + esc(t) + '" aria-label="태그 ' + esc(t) + '로 거르기">#' +
        esc(t) + '</button>';
    }).join('') + '</div>';
  }

  function renderCards(list) {
    return '<div class="cards">' + list.map(function (p) {
      return '<article class="card">' +
        '<div class="head"><h3>' + esc(p.name) + '</h3><span class="type">' + esc(p.type) + '</span></div>' +
        '<div class="muted">' + esc(p.vendor) + '</div>' +
        installRows(p) +
        (p.note ? '<p class="note">' + esc(p.note) + '</p>' : '') +
        tagButtons(p) +
        '</article>';
    }).join('') + '</div>';
  }

  // 이름과 설치 정보를 붙여서 좁은 화면에서도 가로 스크롤 없이 보이게
  var COLUMNS = [['name', '이름'], ['installs', '설치 (기기 · 포맷 · 버전)'], ['type', '종류'], ['vendor', '제조사'], ['note', '메모']];

  function renderTable(list) {
    var head = COLUMNS.map(function (c) {
      var on = state.sortKey === c[0];
      var arrow = on ? (state.sortDir === 1 ? ' ↑' : ' ↓') : '';
      var aria = on ? ' aria-sort="' + (state.sortDir === 1 ? 'ascending' : 'descending') + '"' : '';
      return '<th scope="col"' + aria + (on ? ' class="sorted"' : '') + '><button type="button" data-sort="' + c[0] + '">' +
        c[1] + '<span aria-hidden="true">' + arrow + '</span></button></th>';
    }).join('');
    var rows = list.map(function (p) {
      return '<tr>' +
        '<td class="name">' + esc(p.name) + tagButtons(p) + '</td>' +
        '<td>' + installRows(p) + '</td>' +
        '<td>' + esc(p.type) + '</td>' +
        '<td>' + esc(p.vendor) + '</td>' +
        '<td>' + esc(p.note) + '</td>' +
        '</tr>';
    }).join('');
    return '<div class="table-wrap"><table><thead><tr>' + head + '</tr></thead><tbody>' + rows + '</tbody></table></div>';
  }

  function activeCount() {
    return (state.q ? 1 : 0) + state.type.size + state.loc.size + state.fmt.size + state.tag.size;
  }

  function render() {
    var tokens = queryTokens();
    renderChips('f-type', 'type', presentTypes(), tokens);
    renderChips('f-loc', 'loc', MACHINES, tokens);
    renderChips('f-fmt', 'fmt', presentFormats(), tokens);
    $('g-tag').hidden = !state.tag.size;
    renderChips('f-tag', 'tag', Array.from(state.tag).map(function (t) { return [t, t]; }), tokens);

    var list = sorted(PLUGINS.filter(function (p) { return matches(p, tokens); }), tokens);
    $('count').textContent = list.length === PLUGINS.length
      ? '전체 ' + PLUGINS.length + '개'
      : PLUGINS.length + '개 중 ' + list.length + '개';
    $('reset').hidden = !activeCount();

    document.querySelectorAll('.view-toggle button').forEach(function (b) {
      var on = b.dataset.view === state.view;
      b.classList.toggle('on', on);
      b.setAttribute('aria-pressed', on);
    });

    if (!PLUGINS.length) {
      $('list').innerHTML = '<div class="empty">데이터가 없습니다. data/plugins.json을 채운 뒤 build.sh를 실행하세요.</div>';
    } else if (!list.length) {
      $('list').innerHTML = '<div class="empty">조건에 맞는 플러그인이 없습니다. 위의 "조건 지우기"를 눌러 보세요.</div>';
    } else {
      $('list').innerHTML = state.view === 'table' ? renderTable(list) : renderCards(list);
    }
  }

  // 다시 그린 뒤에도 같은 버튼에 포커스를 돌려준다 (키보드로 연속 선택·정렬 가능하게)
  function focusKey(el) {
    if (!el || !el.dataset) return null;
    if (el.dataset.group) return '[data-group="' + el.dataset.group + '"][data-value="' + CSS.escape(el.dataset.value) + '"]';
    if (el.dataset.sort) return '[data-sort="' + el.dataset.sort + '"]';
    if (el.dataset.view) return '[data-view="' + el.dataset.view + '"]';
    return null;
  }
  function renderKeepingFocus(key) {
    render();
    var el = key && document.querySelector(key);
    if (el && !el.disabled) el.focus();
    else $('search').focus();   // 버튼이 사라졌으면 검색창으로
  }

  // ---------- 이벤트 ----------
  $('search').addEventListener('input', function (e) { state.q = e.target.value.trim(); render(); });

  document.addEventListener('click', function (e) {
    var t = e.target.closest('button');
    if (!t || t.disabled) return;
    var key = focusKey(t);
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
      state.tag.add(t.dataset.tag);   // 검색어는 그대로 두고 태그 조건만 추가
      key = null;
    } else if (t.id === 'reset') {
      state.q = ''; $('search').value = '';
      state.type.clear(); state.loc.clear(); state.fmt.clear(); state.tag.clear();
      key = null;
    } else {
      return;
    }
    renderKeepingFocus(key);
  });

  document.addEventListener('keydown', function (e) {
    var inInput = document.activeElement === $('search');
    if (e.key === '/' && !inInput) { e.preventDefault(); $('search').focus(); $('search').select(); }
    if (e.key === 'Escape' && inInput) { $('search').value = ''; state.q = ''; render(); }
  });

  render();
})();
