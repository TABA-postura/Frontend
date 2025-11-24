import { Link } from 'react-router-dom';
import '../MainPage.css';

const MainPage = () => {
  // 📌 Router가 가로채지 못하도록 Vite 방식 경로 생성
  const mediaSrc = new URL('/videos/postura_main_final.mp4', import.meta.url).href;
  const contentImageSrc = new URL('/photo/content-image.jpg', import.meta.url).href;

  return (
    <div className="main-page-container">
      {/* 메인 콘텐츠 영역 */}
      <div className="main-content">

        {/* 전체 화면 이미지/동영상 영역 */}
        <div className="hero-image-container">

          {/* 로고 */}
          <div className="logo-container">
            <span className="main-logo-text">Postura</span>
          </div>

          {/* 상단 전체 막대기 */}
          <div className="top-bar-line"></div>

          {/* 동영상 */}
          <video
            className="hero-media"
            src={mediaSrc}
            autoPlay
            loop
            muted
            playsInline
          />

          {/* 이미지 위 텍스트 */}
          <div className="hero-text-overlay">
            <h1 className="hero-title">
              Protect our spine, Train upright,<br />
              Remain aligned
            </h1>

            <div className="login-button-container">
              <Link to="/login" className="main-login-button">
                Login
              </Link>
            </div>
          </div>
        </div>

        {/* 스크롤 아래 텍스트 영역 */}
        <div className="content-section">
          <div className="content-wrapper">
            <h2 className="content-subtitle">Why POSTURA Exists</h2>

            <div className="content-text">
              <p>
                현대 사회에서 학생과 직장인들이 하루 대부분을 컴퓨터 앞에서 보내고 있다는 사실은 여러 연구에서 이미 확인된 내용입니다. 재택근무와 원격수업 증가로 컴퓨터 사용 시간이 크게 늘어나면서 목·허리·어깨 통증이 폭발적으로 증가했으며, 실제로 2022년 Gosain 등의 연구에서 컴퓨터 사용자의 목 통증이 60.3%, 허리 통증이 59.5%로 매우 높게 나타났습니다. 2010년 Wærsted 등의 체계적 문헌고찰에서도 컴퓨터 작업이 목·어깨 근골격계 질환과 명확한 연관성을 보였습니다. 오랜 시간 모니터를 바라보는 습관은 거북목과 허리 굽힘 같은 비정상적인 자세를 만들고, 이는 만성 통증과 집중력 저하로 이어질 수 있습니다. 2012년 Kang 등의 연구는 장시간 컴퓨터 기반 업무가 자세 균형을 무너뜨린다는 점을, 2023년 Stincel 등의 연구는 젊은 IT 종사자들 사이에서도 이미 목 장애가 나타나고 있음을 보고했습니다.
              </p>
              <p>
                문제는 많은 사람들이 자신이 잘못된 자세로 앉아 있다는 사실조차 인지하지 못한다는 데 있습니다. Prasetya 등의 2024년 연구는 모니터 높이나 책상·의자 위치 같은 작업 환경 요인이 근골격계 질환 위험을 높인다고 했지만, 실제로 이를 관리하는 사용자는 매우 적었습니다. 기존의 자세 교정 솔루션은 고가의 장비나 웨어러블을 필요로 해 접근성이 낮았고, 착용해야만 데이터를 수집할 수 있어 지속적으로 사용하기 어려운 한계가 있었습니다.
              </p>
              <p>
                하지만 최근 몇 년간 컴퓨터 비전 기술이 빠르게 발전하면서 상황이 달라졌습니다. OpenCV나 MediaPipe Pose 같은 기술을 활용하면 별도의 장비 없이 노트북 웹캠만으로도 사용자의 신체 관절 위치를 추정하고 자세를 분석할 수 있게 되었으며, 실제로 2022년 Kwon 등의 연구는 이러한 기술을 활용한 실시간 자세 교정 시스템을, 2024년 연구에서는 노트북 내장 카메라 기반 자세 분류 시스템을 제안했습니다. 또한 Kim 등의 2023년 연구는 자세 교정 피드백 시스템이 실제로 목 근육 피로 감소와 자세 개선에 도움이 된다는 결과를 보여주며 기술적 접근의 효과를 입증했습니다.
              </p>
              <p>
                이런 흐름 속에서 누구나 매일 사용하는 노트북 웹캠을 통해 별도 장비 없이 접근할 수 있으며, 사용자가 컴퓨터를 사용하는 바로 그 순간 실시간으로 자세 피드백을 제공할 수 있는 솔루션이 가장 현실적이고 지속 가능한 예방책이라는 결론에 도달하게 되었습니다. 따라서 이 웹 서비스는 현대인의 잘못된 앉은 자세에서 비롯되는 근골격계 문제를 더 이상 방치하지 않고, 사용자가 자연스럽게 건강한 자세를 유지하도록 돕기 위한 실용적인 방법을 제공하고자 개발되었습니다.
              </p>
            </div>

            {/* 오른쪽 상단 사진 */}
            <div className="content-image-container">
              <img
                src={contentImageSrc}
                alt="Content illustration"
                className="content-image"
              />
            </div>
          </div>
        </div>

        {/* 푸터 */}
        <footer className="main-footer">
          <div className="footer-content">
            <div className="footer-links">
              <a href="#" className="footer-link">개인정보처리방침</a>
              <span className="footer-divider">|</span>
              <a href="#" className="footer-link">이용약관</a>
              <span className="footer-divider">|</span>
              <a href="#" className="footer-link">문의하기</a>
            </div>

            <div className="footer-copyright">
              <p>Copyright (C) POSTURA All rights reserved.</p>
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
};

export default MainPage;
