import { useAuth } from '../features/auth/hooks/useAuth';
import { useState, useEffect } from 'react';
import './WelcomeMessage.css';

// 환영 메시지 목록
const WELCOME_MESSAGES = [
  '안녕하세요, {name}님! 오늘도 함께해요',
  '{name}님, 오늘도 바른 자세로 시작해요 💪',
  '환영합니다 {name}님! 건강한 습관을 함께 만들어요',
  '{name}님, 오늘의 기록을 시작해볼까요?',
  'Welcome back, {name} 👋',
  '{name}님, 다시 만나서 반가워요 😊',
  '안녕하세요 {name}님! 오늘도 좋은 하루 되세요 ☀️',
  '안녕하세요, {name}님! 환영합니다 😊',
  '{name}님, 오늘도 함께해요 👋',
];

const WelcomeMessage = () => {
  const { user } = useAuth();
  const [welcomeMessage, setWelcomeMessage] = useState<string>('');

  // 사용자 이름 추출: name이 있으면 사용, 없으면 이메일에서 @ 앞부분 추출
  const getUserDisplayName = () => {
    if (user?.name) {
      return user.name;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return null;
  };

  const displayName = getUserDisplayName();

  // 환영 메시지 랜덤 선택
  useEffect(() => {
    if (displayName) {
      const randomMessage = WELCOME_MESSAGES[Math.floor(Math.random() * WELCOME_MESSAGES.length)];
      setWelcomeMessage(randomMessage.replace('{name}', displayName));
    } else {
      setWelcomeMessage('');
    }
  }, [displayName]);

  if (!displayName || !welcomeMessage) {
    return null;
  }

  return (
    <div className="welcome-message">
      {welcomeMessage}
    </div>
  );
};

export default WelcomeMessage;

