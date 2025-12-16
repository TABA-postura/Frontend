/**
 * 카테고리 배지 컴포넌트
 */

interface CategoryBadgeProps {
  category: string;
  style?: React.CSSProperties;
}

export function CategoryBadge({ category, style }: CategoryBadgeProps) {
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '4px 12px',
        borderRadius: '16px',
        backgroundColor: '#e0f2f7',
        color: '#265d70',
        fontSize: '12px',
        fontWeight: 500,
        fontFamily: "'Pretendard', sans-serif",
        ...style,
      }}
    >
      {category}
    </span>
  );
}

