import http from 'http';
import assert from 'assert';

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, headers: res.headers, data }));
    }).on('error', reject);
  });
}

// 1. Simulate frontend parseRouteFromLocation logic
const SECTION_PATHS = ['/', '/team-cvs', '/raw-videos', '/final-video'];
const ADMIN_TAB_TO_PATH = {
  overview: '/admin',
  cvs: '/admin/cvs',
  rawVideos: '/admin/raw-videos',
  finalVideo: '/admin/final-video',
  qrCodes: '/admin/qr-codes',
};

const PATH_TO_ADMIN_TAB = {
  '/admin': 'overview',
  '/admin/': 'overview',
  '/admin/overview': 'overview',
  '/admin/cvs': 'cvs',
  '/admin/cv': 'cvs',
  '/admin/raw-videos': 'rawVideos',
  '/admin/raw': 'rawVideos',
  '/admin/rawVideos': 'rawVideos',
  '/admin/final-video': 'finalVideo',
  '/admin/final': 'finalVideo',
  '/admin/finalVideo': 'finalVideo',
  '/admin/qr-codes': 'qrCodes',
  '/admin/qr': 'qrCodes',
  '/admin/qrCodes': 'qrCodes',
};

function parseRoute(pathname, hash = '') {
  const cleanPath = pathname.replace(/\/$/, '') || '/';
  const cleanHash = (hash || '').replace(/^#\/?/, '').replace(/\/$/, '');

  // 1. Standalone Raw Viewer
  const rawMatch = cleanPath.match(/^\/raw\/([12])$/) || cleanHash.match(/^raw\/([12])$/);
  if (rawMatch) {
    const slotId = Number(rawMatch[1]);
    return { type: 'raw-viewer', slotId, path: `/raw/${slotId}` };
  }

  // 2. Standalone Final Video Watch Viewer
  if (
    cleanPath === '/final-video/watch' ||
    cleanPath === '/watch/final' ||
    cleanHash === 'final-video/watch' ||
    cleanHash === 'watch/final'
  ) {
    return { type: 'final-viewer', path: '/final-video/watch' };
  }

  // 3. Admin routes
  if (cleanPath === '/admin' || cleanPath.startsWith('/admin/') || cleanHash === 'admin' || cleanHash.startsWith('admin/')) {
    const key = cleanPath.startsWith('/admin') ? cleanPath : `/${cleanHash}`;
    const tab = PATH_TO_ADMIN_TAB[key] || 'overview';
    return { type: 'admin', tab, path: ADMIN_TAB_TO_PATH[tab] };
  }

  // 4. Main Section routes
  if (
    cleanPath === '/team-cvs' ||
    cleanPath === '/cvs' ||
    cleanPath === '/resumes' ||
    cleanPath === '/team' ||
    cleanHash === 'team-cvs' ||
    cleanHash === 'cvs' ||
    cleanHash === 'resumes' ||
    cleanHash === 'cv'
  ) {
    return { type: 'section', sectionIndex: 1, path: '/team-cvs' };
  }

  if (
    cleanPath === '/raw-videos' ||
    cleanPath === '/raw' ||
    cleanPath === '/uncut' ||
    cleanHash === 'raw-videos' ||
    cleanHash === 'raw'
  ) {
    return { type: 'section', sectionIndex: 2, path: '/raw-videos' };
  }

  if (
    cleanPath === '/final-video' ||
    cleanPath === '/final' ||
    cleanPath === '/final-video-resume' ||
    cleanHash === 'final-video' ||
    cleanHash === 'final'
  ) {
    return { type: 'section', sectionIndex: 3, path: '/final-video' };
  }

  return { type: 'section', sectionIndex: 0, path: '/' };
}

async function runTests() {
  console.log('=== STARTING SPA ROUTING & BROWSER HISTORY VERIFICATION ===\n');

  // Test 1: Unit tests on route parser
  console.log('1. Testing route parsing and resolution...');
  
  assert.deepStrictEqual(parseRoute('/'), { type: 'section', sectionIndex: 0, path: '/' });
  assert.deepStrictEqual(parseRoute('/team-cvs'), { type: 'section', sectionIndex: 1, path: '/team-cvs' });
  assert.deepStrictEqual(parseRoute('/raw-videos'), { type: 'section', sectionIndex: 2, path: '/raw-videos' });
  assert.deepStrictEqual(parseRoute('/final-video'), { type: 'section', sectionIndex: 3, path: '/final-video' });

  // Admin routes
  assert.deepStrictEqual(parseRoute('/admin'), { type: 'admin', tab: 'overview', path: '/admin' });
  assert.deepStrictEqual(parseRoute('/admin/cvs'), { type: 'admin', tab: 'cvs', path: '/admin/cvs' });
  assert.deepStrictEqual(parseRoute('/admin/raw-videos'), { type: 'admin', tab: 'rawVideos', path: '/admin/raw-videos' });
  assert.deepStrictEqual(parseRoute('/admin/final-video'), { type: 'admin', tab: 'finalVideo', path: '/admin/final-video' });
  assert.deepStrictEqual(parseRoute('/admin/qr-codes'), { type: 'admin', tab: 'qrCodes', path: '/admin/qr-codes' });

  // Public QR routes
  assert.deepStrictEqual(parseRoute('/raw/1'), { type: 'raw-viewer', slotId: 1, path: '/raw/1' });
  assert.deepStrictEqual(parseRoute('/raw/2'), { type: 'raw-viewer', slotId: 2, path: '/raw/2' });
  assert.deepStrictEqual(parseRoute('/final-video/watch'), { type: 'final-viewer', path: '/final-video/watch' });

  console.log('   ✓ All 11 route parsing test cases passed successfully!');

  // Test 2: History navigation stack simulation
  console.log('\n2. Testing Browser History Stack Simulation (Back/Forward Flow)...');
  
  const historyStack = ['/'];
  let historyIndex = 0;

  function pushNav(path) {
    historyStack.splice(historyIndex + 1);
    historyStack.push(path);
    historyIndex = historyStack.length - 1;
    return parseRoute(historyStack[historyIndex]);
  }

  function goBack() {
    if (historyIndex > 0) historyIndex--;
    return parseRoute(historyStack[historyIndex]);
  }

  function goForward() {
    if (historyIndex < historyStack.length - 1) historyIndex++;
    return parseRoute(historyStack[historyIndex]);
  }

  // Flow: Home -> Team CVs -> Raw Videos -> Final Video
  let current = pushNav('/team-cvs');
  assert.strictEqual(current.sectionIndex, 1);
  console.log('   -> Navigated to Team CVs (/team-cvs)');

  current = pushNav('/raw-videos');
  assert.strictEqual(current.sectionIndex, 2);
  console.log('   -> Navigated to Raw Videos (/raw-videos)');

  current = pushNav('/final-video');
  assert.strictEqual(current.sectionIndex, 3);
  console.log('   -> Navigated to Final Video (/final-video)');

  // Back: Final Video -> Raw Videos
  current = goBack();
  assert.strictEqual(current.sectionIndex, 2);
  console.log('   <- Back pressed: At Raw Videos (section 2)');

  // Back: Raw Videos -> Team CVs
  current = goBack();
  assert.strictEqual(current.sectionIndex, 1);
  console.log('   <- Back pressed: At Team CVs (section 1)');

  // Back: Team CVs -> Home
  current = goBack();
  assert.strictEqual(current.sectionIndex, 0);
  console.log('   <- Back pressed: At Home (section 0)');

  // Forward: Home -> Team CVs
  current = goForward();
  assert.strictEqual(current.sectionIndex, 1);
  console.log('   -> Forward pressed: At Team CVs (section 1)');

  // Forward: Team CVs -> Raw Videos
  current = goForward();
  assert.strictEqual(current.sectionIndex, 2);
  console.log('   -> Forward pressed: At Raw Videos (section 2)');

  // Forward: Raw Videos -> Final Video
  current = goForward();
  assert.strictEqual(current.sectionIndex, 3);
  console.log('   -> Forward pressed: At Final Video (section 3)');

  // QR Flow: Final Video -> /raw/1 -> Back -> Final Video
  current = pushNav('/raw/1');
  assert.strictEqual(current.type, 'raw-viewer');
  assert.strictEqual(current.slotId, 1);
  console.log('   -> Opened Raw Video 01 Viewer (/raw/1)');

  current = goBack();
  assert.strictEqual(current.sectionIndex, 3);
  console.log('   <- Back pressed: Successfully returned to Final Video (section 3)');

  // Admin Flow: Admin -> /admin/raw-videos -> /admin/final-video -> Back -> /admin/raw-videos
  current = pushNav('/admin');
  assert.strictEqual(current.type, 'admin');
  assert.strictEqual(current.tab, 'overview');
  console.log('   -> Opened Admin Dashboard (/admin)');

  current = pushNav('/admin/raw-videos');
  assert.strictEqual(current.type, 'admin');
  assert.strictEqual(current.tab, 'rawVideos');
  console.log('   -> Switched Admin tab to Raw Videos (/admin/raw-videos)');

  current = pushNav('/admin/final-video');
  assert.strictEqual(current.type, 'admin');
  assert.strictEqual(current.tab, 'finalVideo');
  console.log('   -> Switched Admin tab to Final Video (/admin/final-video)');

  current = goBack();
  assert.strictEqual(current.type, 'admin');
  assert.strictEqual(current.tab, 'rawVideos');
  console.log('   <- Back pressed: Admin Dashboard maintained on Raw Videos tab (/admin/raw-videos)');

  console.log('   ✓ Complete Browser History and Forward/Back simulation verified successfully!');

  // Test 3: HTTP Server direct URL accessibility test
  console.log('\n3. Testing Direct HTTP URL Access via Vite Dev Server (port 5173)...');
  const routesToTest = [
    '/',
    '/team-cvs',
    '/raw-videos',
    '/final-video',
    '/admin',
    '/admin/cvs',
    '/admin/raw-videos',
    '/admin/final-video',
    '/admin/qr-codes',
    '/raw/1',
    '/raw/2',
  ];

  for (const route of routesToTest) {
    try {
      const res = await fetchUrl(`http://localhost:5173${route}`);
      assert.strictEqual(res.statusCode, 200, `Expected 200 for route ${route}`);
      assert.ok(res.data.includes('<div id="root"></div>') || res.data.includes('id="root"'), `Route ${route} should contain root element`);
      console.log(`   ✓ Direct access: http://localhost:5173${route} -> HTTP ${res.statusCode} (Served index.html SPA)`);
    } catch (err) {
      console.error(`   ✗ Direct access failed for ${route}:`, err.message);
      throw err;
    }
  }

  // Test 4: HTTP Server direct URL accessibility test on Backend port 5000 (production fallback)
  console.log('\n4. Testing Direct HTTP URL Access via Backend Server (port 5000)...');
  for (const route of routesToTest) {
    try {
      const res = await fetchUrl(`http://localhost:5000${route}`);
      assert.strictEqual(res.statusCode, 200, `Expected 200 for backend route ${route}`);
      console.log(`   ✓ Backend SPA fallback: http://localhost:5000${route} -> HTTP ${res.statusCode} (Production Ready)`);
    } catch (err) {
      console.error(`   ✗ Backend access failed for ${route}:`, err.message);
      throw err;
    }
  }

  console.log('\n🎉 ALL SPA ROUTING, BROWSER HISTORY, AND DIRECT URL ACCESS TESTS PASSED 100%!');
}

runTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
