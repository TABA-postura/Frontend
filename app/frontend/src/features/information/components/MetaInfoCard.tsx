/**
 * 메타 정보 카드 컴포넌트
 */

interface MetaInfoCardProps {
  title: string;
  items: string[];
  style?: React.CSSProperties;
}

export function MetaInfoCard({ title, items, style }: MetaInfoCardProps) {
  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        padding: '20px',
        ...style,
      }}
    >
      <h3
        style={{
          fontSize: '16px',
          fontWeight: 600,
          color: '#333',
          margin: '0 0 12px 0',
          fontFamily: "'Pretendard', sans-serif",
        }}
      >
        {title}
      </h3>
      <ul
        style={{
          listStyle: 'none',
          padding: 0,
          margin: 0,
        }}
      >
        {items.map((item, index) => (
          <li
            key={index}
            style={{
              fontSize: '14px',
              color: '#666',
              lineHeight: '1.6',
              marginBottom: '8px',
              paddingLeft: '20px',
              position: 'relative',
              fontFamily: "'Pretendard', sans-serif",
            }}
          >
            <span
              style={{
                position: 'absolute',
                left: 0,
                top: '6px',
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: '#8bb3c0',
              }}
            />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

