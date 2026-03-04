import React, { useEffect, useState } from 'react';
import { db } from '../api/firebase'; 
import { collection, query, orderBy, doc, onSnapshot } from 'firebase/firestore';

function MainPage() {
  const [products, setProducts] = useState([]); 
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('전체');
  const [notice, setNotice] = useState('롯데슈퍼 신정점 실시간 특가 앱입니다!');

  useEffect(() => {
    // 1. 공지사항 실시간 감시
    const unsubscribeNotice = onSnapshot(doc(db, "settings", "notice"), (docSnap) => {
      if (docSnap.exists()) setNotice(docSnap.data().text);
    });

    // 2. 상품 목록 실시간 감시
    const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
    const unsubscribeProducts = onSnapshot(q, (querySnapshot) => {
      const productList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(productList);
      setFilteredProducts(productList);
      setLoading(false);
    });

    return () => {
      unsubscribeNotice();
      unsubscribeProducts();
    };
  }, []);

  const handleTabClick = (tabName) => {
    setActiveTab(tabName);
    if (tabName === '전체') {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(products.filter(item => item.tag === tabName));
    }
  };

  if (loading) return <div style={{ padding: '50px', textAlign: 'center', color: '#666' }}>🥦 신선한 상품을 가져오고 있습니다...</div>;

  return (
    <div style={{ 
      backgroundColor: '#f8f9fa', 
      minHeight: '100vh', 
      width: '100%', 
      maxWidth: '100vw', // 화면 폭을 넘지 않도록 강제
      overflowX: 'hidden', // 가로 스크롤 원천 차단
      margin: 0,
      padding: 0,
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column'
    }}>
      
      {/* 1. 흐르는 전광판 (높이 고정) */}
      <div style={{ 
        backgroundColor: '#000', color: '#fff', 
        height: '35px', display: 'flex', alignItems: 'center',
        overflow: 'hidden', whiteSpace: 'nowrap', position: 'sticky', top: 0, zIndex: 1000 
      }}>
        <div style={{ display: 'inline-block', paddingLeft: '100%', fontSize: '14px', fontWeight: 'bold', animation: 'marquee 15s linear infinite' }}>
          {notice}
        </div>
      </div>
      <style>{`@keyframes marquee { 0% { transform: translate(0, 0); } 100% { transform: translate(-100%, 0); } }`}</style>

      {/* 2. 메인 컨텐츠 영역 */}
      <div style={{ padding: '12px', width: '100%', boxSizing: 'border-box' }}>
        
        {/* 헤더 */}
        <header style={{ textAlign: 'center', margin: '15px 0' }}>
          <h1 style={{ color: '#da291c', fontSize: '1.8rem', fontWeight: '900', margin: 0, letterSpacing: '-1px' }}>LOTTE SUPER</h1>
          <p style={{ margin: '5px 0', fontSize: '1rem', color: '#333', fontWeight: 'bold' }}>신정점 실시간 특가 안내</p>
        </header>

        {/* 카테고리 탭 (가로 스크롤 가능하지만 화면은 안 밀림) */}
        <div style={{ 
          display: 'flex', gap: '8px', marginBottom: '20px', 
          overflowX: 'auto', paddingBottom: '10px',
          WebkitOverflowScrolling: 'touch',
          msOverflowStyle: 'none',
          scrollbarWidth: 'none'
        }}>
          {['전체', '타임세일', '임박할인', '기획상품'].map(tab => (
            <button key={tab} onClick={() => handleTabClick(tab)} style={{
              padding: '8px 16px', borderRadius: '20px', border: 'none',
              backgroundColor: activeTab === tab ? '#da291c' : '#fff',
              color: activeTab === tab ? '#fff' : '#555',
              fontSize: '13px', fontWeight: 'bold', flexShrink: 0,
              boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
            }}>{tab}</button>
          ))}
        </div>
        
        {/* 3. 상품 그리드 (여기가 핵심: 무조건 1:1 비율 2열 배치) */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(2, 1fr)', // 화면을 정확히 반씩 나눔
          gap: '12px', 
          width: '100%', 
          boxSizing: 'border-box'
        }}>
          {filteredProducts.map((item) => (
            <div key={item.id} style={{ 
              backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden',
              boxShadow: '0 3px 10px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column'
            }}>
              {/* 이미지 영역 (정사각형 비율 유지) */}
              <div style={{ width: '100%', paddingTop: '100%', position: 'relative', backgroundColor: '#f9f9f9' }}>
                <img 
                  src={item.imageUrl || 'https://via.placeholder.com/150'} 
                  alt={item.name} 
                  style={{ 
                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', 
                    objectFit: 'cover', filter: item.isSoldOut ? 'grayscale(100%) brightness(0.7)' : 'none' 
                  }} 
                />
                {item.isSoldOut && (
                  <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ border: '2px solid #fff', color: '#fff', padding: '2px 8px', fontWeight: 'bold', fontSize: '14px', transform: 'rotate(-10deg)', backgroundColor: 'rgba(0,0,0,0.5)' }}>SOLD OUT</div>
                  </div>
                )}
              </div>

              {/* 상품 텍스트 정보 */}
              <div style={{ padding: '10px' }}>
                <div style={{ fontSize: '10px', color: '#da291c', fontWeight: 'bold', marginBottom: '4px' }}>{item.tag}</div>
                <div style={{ 
                  fontSize: '13px', fontWeight: 'bold', color: '#333', 
                  height: '38px', overflow: 'hidden', lineHeight: '1.4',
                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' 
                }}>{item.name}</div>
                
                <div style={{ marginTop: '10px' }}>
                  <p style={{ margin: 0, fontSize: '11px', color: '#bbb', textDecoration: 'line-through' }}>{item.originalPrice}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span style={{ color: '#da291c', fontWeight: '900', fontSize: '16px' }}>{item.discountRate}%</span>
                    <span style={{ fontWeight: '800', fontSize: '16px', color: '#222' }}>{item.price}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MainPage;