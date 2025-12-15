const TopImageBar = () => {
  return (
    <div 
      style={{ 
        width: "100%",
        margin: 0,
        padding: 0,
        display: "block",
        position: "relative",
        zIndex: 1
      }}
    >
      <img
        src="/images/posetura_line.png"
        alt="Postura Line"
        style={{
          width: "100%",
          height: "auto",
          display: "block",
          margin: 0,
          padding: 0,
          objectFit: "cover"
        }}
        onError={(e) => {
          console.error('TopImageBar 이미지 로드 실패:', '/images/posetura_line.png');
          e.currentTarget.style.border = '3px solid red';
          e.currentTarget.style.backgroundColor = '#ffcccc';
          e.currentTarget.style.minHeight = '60px';
        }}
        onLoad={() => {
          console.log('TopImageBar 이미지 로드 성공:', '/images/posetura_line.png');
        }}
      />
    </div>
  );
};

export default TopImageBar;

