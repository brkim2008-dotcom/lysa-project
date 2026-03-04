import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // 데이터베이스 서비스
import { getAuth } from "firebase/auth";           // 인증 서비스 (나중을 위해)
import { getStorage } from "firebase/storage"; // 추가

// .env 파일에 적어둔 비밀 키값들을 불러오는 설정입니다.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  storageBucket: "lysa-market.firebasestorage.app", // 이 부분이 정확해야 합니다
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// 1. Firebase를 우리 프로젝트의 열쇠로 초기화합니다.
const app = initializeApp(firebaseConfig);

// 2. 다른 파일(AdminPage 등)에서 가져다 쓸 수 있도록 내보냅니다.
export const db = getFirestore(app); // 데이터베이스(Firestore)를 db라는 이름으로 수출
export const auth = getAuth(app);
export const storage = getStorage(app); // 외부에서 쓸 수 있게 export