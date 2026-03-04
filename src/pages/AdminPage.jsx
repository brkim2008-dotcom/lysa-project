import React, { useState, useEffect } from 'react';
import { db } from '../api/firebase'; 
import { collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp, query, orderBy, updateDoc } from 'firebase/firestore';

function AdminPage() {
  const [isAuthorized, setIsAuthorized] = useState(false); // 인증 상태
  const [password, setPassword] = useState(''); // 입력 비번
  
  const [name, setName] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [price, setPrice] = useState('');
  const [tag, setTag] = useState('타임세일');
  const [imageUrl, setImageUrl] = useState('');
  const [products, setProducts] = useState([]);
  const [noticeInput, setNoticeInput] = useState('');
  const [editingId, setEditingId] = useState(null); 

  // 🔒 비밀번호 확인 함수 (선생님만 아는 번호로 수정하세요)
  const handleLogin = (e) => {
    e.preventDefault();
    if (password === 'gowa15987') { // 여기에 사용할 비밀번호를 적으세요
      setIsAuthorized(true);
    } else {
      alert('비밀번호가 틀렸습니다.');
      setPassword('');
    }
  };

  const fetchProducts = async () => {
    const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    setProducts(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  useEffect(() => { 
    if (isAuthorized) fetchProducts(); 
  }, [isAuthorized]);

  // --- 기존 기능 로직 (동일) ---
  const handleUpdateNotice = async () => {
    if (!noticeInput) return alert("공지 내용을 입력하세요.");
    try {
      await updateDoc(doc(db, "settings", "notice"), { text: noticeInput });
      alert("📢 공지가 변경되었습니다!");
      setNoticeInput('');
    } catch (e) { alert("공지 수정 실패!"); }
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setName(item.name);
    setOriginalPrice(item.originalPrice);
    setPrice(item.price);
    setTag(item.tag);
    setImageUrl(item.imageUrl);
    window.scrollTo(0, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const oPrice = parseInt(originalPrice.toString().replace(/[^0-9]/g, '')) || 0;
    const sPrice = parseInt(price.toString().replace(/[^0-9]/g, '')) || 0;
    const discountRate = oPrice > 0 ? Math.round(((oPrice - sPrice) / oPrice) * 100) : 0;

    try {
      if (editingId) {
        await updateDoc(doc(db, "products", editingId), { name, originalPrice, price, discountRate, tag, imageUrl });
        alert("✅ 수정 완료!");
        setEditingId(null);
      } else {
        await addDoc(collection(db, "products"), { name, originalPrice, price, discountRate, tag, imageUrl, isSoldOut: false, createdAt: serverTimestamp() });
        alert("✅ 등록 완료!");
      }
      setName(''); setOriginalPrice(''); setPrice(''); setImageUrl('');
      fetchProducts();
    } catch (e) { alert("작업 실패!"); }
  };

  const handleToggleSoldOut = async (id, currentStatus) => {
    await updateDoc(doc(db, "products", id), { isSoldOut: !currentStatus });
    fetchProducts();
  };

  const handleDelete = async (id) => {
    if (window.confirm("정말 삭제하시겠습니까?")) {
      await deleteDoc(doc(doc(db, "products", id)));
      fetchProducts();
    }
  };

  // 1. 로그인 전 화면
  if (!isAuthorized) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#f4f4f4' }}>
        <div style={{ padding: '30px', backgroundColor: 'white', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', textAlign: 'center' }}>
          <h3 style={{ color: '#da291c', marginBottom: '20px' }}>롯데슈퍼 신정점<br/>관리자 인증</h3>
          <form onSubmit={handleLogin}>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="비밀번호 입력" 
              style={{ width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '5px', border: '1px solid #ddd', boxSizing: 'border-box' }}
            />
            <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: '#da291c', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>
              관리자 접속
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 2. 로그인 후 화면 (기존 관리자 페이지)
  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ color: '#da291c' }}>🍎 관리자 모드</h2>
        <button onClick={() => setIsAuthorized(false)} style={{ padding: '5px 10px', fontSize: '12px' }}>로그아웃</button>
      </div>
      
      {/* (이하 공지 수정 및 등록 폼 코드는 이전과 동일하므로 생략하지만 실제 파일엔 포함되어야 합니다) */}
      {/* ... 기존 내용 ... */}
      <div style={{ marginBottom: '25px', padding: '15px', backgroundColor: '#333', borderRadius: '10px', color: '#fff' }}>
        <h4 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>📢 실시간 배너 문구 수정</h4>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input type="text" value={noticeInput} onChange={(e) => setNoticeInput(e.target.value)} placeholder="공지 내용" style={{ flex: 1, padding: '10px', borderRadius: '5px' }} />
          <button onClick={handleUpdateNotice} style={{ padding: '10px 15px', backgroundColor: '#da291c', color: 'white', border: 'none', borderRadius: '5px' }}>반영</button>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '30px', padding: '15px', border: '2px solid' + (editingId ? '#007bff' : '#ddd'), borderRadius: '10px' }}>
        <h4 style={{ margin: '0 0 5px 0' }}>{editingId ? "✏️ 수정 중" : "📦 신규 등록"}</h4>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="상품명" required style={{ padding: '10px' }} />
        <input type="text" value={originalPrice} onChange={(e) => setOriginalPrice(e.target.value)} placeholder="정상가" required style={{ padding: '10px' }} />
        <input type="text" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="할인가" required style={{ padding: '10px' }} />
        <select value={tag} onChange={(e) => setTag(e.target.value)} style={{ padding: '10px' }}>
          <option value="타임세일">타임세일</option>
          <option value="임박할인">임박할인</option>
          <option value="기획상품">기획상품</option>
        </select>
        <input type="text" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="이미지 URL" style={{ padding: '10px' }} />
        <button type="submit" style={{ padding: '15px', backgroundColor: editingId ? '#007bff' : '#da291c', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold' }}>
          {editingId ? "수정 완료" : "상품 등록"}
        </button>
      </form>

      <h3>진열 상품 ({products.length})</h3>
      {products.map(item => (
        <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', borderBottom: '1px solid #eee' }}>
          <div>
            <strong>{item.isSoldOut ? "[품절] " : ""}{item.name}</strong><br/>
            <small>{item.originalPrice} → {item.price}</small>
          </div>
          <div style={{ display: 'flex', gap: '5px' }}>
            <button onClick={() => startEdit(item)} style={{ fontSize: '11px', padding: '5px' }}>수정</button>
            <button onClick={() => handleToggleSoldOut(item.id, item.isSoldOut)} style={{ fontSize: '11px', padding: '5px' }}>{item.isSoldOut ? "판매" : "품절"}</button>
            <button onClick={() => handleDelete(item.id)} style={{ fontSize: '11px', padding: '5px', color: 'red' }}>삭제</button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default AdminPage;