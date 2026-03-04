import React, { useState } from 'react';
import { db } from '../api/firebase'; // 설정하신 firebase 파일 경로 확인
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import imageCompression from 'browser-image-compression'; // 이미지 압축 라이브러리

function AdminPage() {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState(''); // 압축된 이미지의 Base64 데이터 저장
  const [isCompressing, setIsCompressing] = useState(false); // 압축 중 상태 표시

  // ✨ 이미지 선택 및 자동 압축 함수
  const handleImageChange = async (e) => {
    const imageFile = e.target.files[0];
    if (!imageFile) return;

    setIsCompressing(true); // "압축 중..." 표시 시작

    // ⚙️ 압축 옵션 (5,000명 접속 대비 최적화)
    const options = {
      maxSizeMB: 0.2,          // 최대 200KB로 제한 (용량 획기적 절감)
      maxWidthOrHeight: 800,   // 가로세로 최대 800px (모바일 확인용으로 충분)
      useWebWorker: true,
    };

    try {
      // 1. 이미지 압축 실행
      const compressedFile = await imageCompression(imageFile, options);
      
      // 2. 압축된 파일을 미리보기 및 저장용 Base64 문자열로 변환
      const reader = new FileReader();
      reader.readAsDataURL(compressedFile);
      reader.onloadend = () => {
        setImageUrl(reader.result); // 변환된 데이터를 상태에 저장
        setIsCompressing(false);    // "압축 완료"
      };
    } catch (error) {
      console.error("이미지 압축 오류:", error);
      alert("이미지 처리 중 문제가 발생했습니다.");
      setIsCompressing(false);
    }
  };

  // 🚀 상품 등록 함수 (Firebase 전송)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !price || !imageUrl) {
      alert("상품명, 가격, 사진은 필수입니다!");
      return;
    }

    try {
      await addDoc(collection(db, "products"), {
        name,
        price: Number(price),
        description,
        imageUrl, // 압축된 이미지 데이터가 저장됨
        createdAt: serverTimestamp(),
      });
      alert("상품이 성공적으로 등록되었습니다!");
      // 등록 후 입력창 초기화
      setName('');
      setPrice('');
      setDescription('');
      setImageUrl('');
    } catch (error) {
      console.error("등록 오류:", error);
      alert("상품 등록에 실패했습니다.");
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h2 style={{ textAlign: 'center', color: '#333' }}>🛒 롯데슈퍼 신정점 관리자</h2>
      <p style={{ fontSize: '12px', color: '#666', textAlign: 'center' }}>상품을 등록하면 앱에 즉시 반영됩니다.</p>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {/* 상품명 */}
        <input 
          type="text" 
          placeholder="상품명 (예: 신선한 배추 1망)" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          style={inputStyle} 
        />

        {/* 가격 */}
        <input 
          type="number" 
          placeholder="가격 (숫자만 입력)" 
          value={price} 
          onChange={(e) => setPrice(e.target.value)} 
          style={inputStyle} 
        />

        {/* 설명 */}
        <textarea 
          placeholder="상품 상세 설명 (세일 정보 등)" 
          value={description} 
          onChange={(e) => setDescription(e.target.value)} 
          style={{ ...inputStyle, height: '80px' }} 
        />

        {/* 사진 선택 (파일 업로드 방식) */}
        <div style={{ border: '1px dashed #ccc', padding: '10px', borderRadius: '5px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 'bold' }}>
            📸 상품 사진 선택 {isCompressing && <span style={{ color: 'blue' }}>(압축 중...)</span>}
          </label>
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleImageChange} 
            style={{ width: '100%' }}
          />
          {imageUrl && (
            <div style={{ marginTop: '10px', textAlign: 'center' }}>
              <img src={imageUrl} alt="미리보기" style={{ width: '150px', borderRadius: '8px', border: '1px solid #eee' }} />
              <p style={{ fontSize: '11px', color: '#27ae60' }}>용량 최적화 완료 ✅</p>
            </div>
          )}
        </div>

        {/* 등록 버튼 */}
        <button 
          type="submit" 
          disabled={isCompressing}
          style={{ 
            backgroundColor: isCompressing ? '#ccc' : '#e60012', 
            color: 'white', 
            padding: '12px', 
            border: 'none', 
            borderRadius: '5px', 
            fontSize: '16px', 
            fontWeight: 'bold',
            cursor: 'pointer' 
          }}
        >
          {isCompressing ? '이미지 처리 중...' : '상품 등록하기'}
        </button>
      </form>
    </div>
  );
}

// 공통 스타일
const inputStyle = {
  padding: '12px',
  fontSize: '15px',
  borderRadius: '5px',
  border: '1px solid #ddd',
  outline: 'none'
};

export default AdminPage;