self.addEventListener('install', (e) => {
  console.log('롯데슈퍼 서비스 워커 설치 완료!');
  self.skipWaiting(); // 설치 즉시 활성화
});

self.addEventListener('activate', (e) => {
  console.log('서비스 워커 활성화됨');
});

self.addEventListener('fetch', (e) => {
  // 앱 작동을 위한 기본 핸들러
});