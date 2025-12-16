/**
 * Bullet List 섹션 컴포넌트
 */

interface BulletListSectionProps {
  title: string;
  items: string[];
  style?: React.CSSProperties;
}

export function BulletListSection({ title, items, style }: BulletListSectionProps) {
  return (
    <div style={{ marginBottom: '32px', ...style }}>
      <h2
        style={{
          fontSize: '20px',
          fontWeight: 600,
          color: '#333',
          margin: '0 0 16px 0',
          fontFamily: "'Pretendard', sans-serif",
        }}
      >
        {title}
      </h2>
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
              fontSize: '15px',
              color: '#555',
              lineHeight: '1.8',
              marginBottom: '12px',
              paddingLeft: '24px',
              position: 'relative',
              fontFamily: "'Pretendard', sans-serif",
            }}
          >
            <span
              style={{
                position: 'absolute',
                left: 0,
                top: '8px',
                width: '8px',
                height: '8px',
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

