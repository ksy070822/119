// 임시 컴포넌트 - 추후 구현 예정
export function CharacterStyleModal({ onClose, onStyleSelect, originalImageUrl, petName }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-4">캐릭터 스타일 선택</h2>
          <p className="text-gray-600 mb-4">이 기능은 현재 개발 중입니다.</p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}

