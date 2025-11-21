import { Link } from 'react-router-dom';
import '../MainPage.css';

const MainPage = () => {
  // 동영상 경로 설정
  const mediaSrc = '/videos/postura_main최종.mp4';
  const isVideo = true;
  
  // 사진 경로 설정 (public/photo 폴더에 사진을 넣고 파일명만 변경하세요)
  const contentImageSrc = '/photo/content-image.jpg'; // 사진 파일명을 여기에 입력

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
          {/* 이미지 또는 동영상 표시 */}
          {mediaSrc ? (
            isVideo ? (
              <video 
                className="hero-media" 
                src={mediaSrc} 
                autoPlay 
                loop 
                muted 
                playsInline
              />
            ) : (
              <img 
                className="hero-media" 
                src={mediaSrc} 
                alt="메인 이미지" 
              />
            )
          ) : (
            <div className="hero-image-placeholder">
              {/* 이미지가 들어갈 공간 */}
            </div>
          )}
          
          {/* 이미지 위에 표시될 텍스트 */}
          <div className="hero-text-overlay">
            <h1 className="hero-title">
              Protect our spine, Train upright,<br />
              Remain aligned
            </h1>
            {/* 로그인 버튼 - 텍스트 바로 아래 */}
            <div className="login-button-container">
              <Link to="/login" className="main-login-button">
                Login
              </Link>
            </div>
          </div>
        </div>

        {/* 스크롤 시 보이는 텍스트 영역 */}
        <div className="content-section">
          <div className="content-wrapper">
            <h2 className="content-subtitle">Why POSTURA Exists</h2>
            <div className="content-text">
              <p>
                현대 사회에서 학생과 직장인들이 하루 대부분을 컴퓨터 앞에서 보내고 있다는 사실은 이미 여러 연구에서 반복적으로 확인된 내용입니다. 재택근무와 원격수업의 증가로 컴퓨터 사용 시간이 더욱 길어지면서 목과 허리, 어깨에 통증을 호소하는 사람들이 크게 늘어났으며, 실제로 2022년 Gosain 등의 연구에서는 컴퓨터 사용자의 목 통증이 60.3%, 허리 통증이 59.5%라는 높은 비율로 나타났습니다. 또한 2010년 Wærsted 등의 체계적 문헌고찰은 컴퓨터 작업이 목과 어깨 등 상지 근골격계 질환과 분명한 연관성이 있음을 강조했습니다. 이렇게 오랜 시간 모니터를 바라보다 보면 머리가 앞으로 빠지는 거북목 자세나 허리가 굽는 비정상적인 체형이 자연스럽게 형성되고, 이는 결국 만성적인 통증과 집중력 저하로 이어질 수 있습니다. 실제로 2012년 Kang 등의 연구에서는 장시간 컴퓨터 기반 업무를 수행하는 사람들에게서 거북목이 자세 균형을 방해한다는 결과가 나왔고, 2023년 Stincel 등의 연구에서는 젊은 IT 종사자들 사이에서도 이미 목 장애가 나타나고 있는 사실이 확인되었습니다.
              </p>
              <p>
                문제는 많은 사람들이 자신이 나쁜 자세로 앉아 있다는 사실조차 인지하지 못한다는 데 있습니다. Prasetya 등의 2024년 연구는 모니터 높이, 책상과 의자 위치 같은 작업 환경 요인이 근골격계 질환의 위험을 크게 높인다고 했지만, 실제로 이러한 환경을 스스로 조정하고 관리하는 사람은 매우 적었습니다. 기존의 자세 교정 솔루션들은 대부분 고가의 센서 장비나 웨어러블 기기를 필요로 하며, 착용해야만 데이터를 수집할 수 있기 때문에 접근성이 떨어지고 지속적으로 사용하기 어렵다는 한계가 존재해 왔습니다. 그러나 최근 몇 년간 컴퓨터 비전 기술이 급격히 발전하면서 상황이 달라지기 시작했습니다. OpenCV, MediaPipe Pose 같은 기술을 활용하면 별도의 장비 없이도 노트북에 기본으로 포함된 웹캠만으로 사용자의 신체 관절 위치를 추정하고 자세를 분석할 수 있게 되었으며, 실제로 2022년 Kwon 등의 연구에서는 이러한 기술을 활용한 실시간 운동 자세 교정 시스템이 제안되었고, 2024년에는 노트북 내장 카메라만으로 앉은 자세를 분류하는 연구까지 발표되었습니다. 또한 Kim 등의 2023년 연구는 자세 교정 피드백 시스템이 실제로 목 근육 피로 감소와 자세 개선에 도움을 준다는 결과를 제시해 기술적 접근이 단순 편의 기능이 아니라 건강 개선에 실질적인 효과가 있다는 점을 보여주었습니다.
              </p>
              <p>
                이런 흐름 속에서 누구나 매일 사용하는 노트북 웹캠을 활용해 별도의 장비 없이 접근할 수 있으며, 사용자가 컴퓨터를 사용하는 바로 그 순간에 실시간으로 자세 피드백을 제공하는 솔루션이야말로 가장 현실적이고 지속 가능한 예방책이라는 결론에 도달하게 되었습니다. 따라서 이 웹 서비스는 현대인의 잘못된 앉은 자세에서 비롯되는 근골격계 문제를 더 이상 방치하지 않고, 사용자가 자연스럽게 건강한 자세를 유지할 수 있도록 돕는 가장 실용적인 방법을 제공하고자 개발하게 되었습니다.
              </p>
            </div>
            {contentImageSrc && (
              <div className="content-image-container">
                <img 
                  src={contentImageSrc} 
                  alt="Content illustration" 
                  className="content-image"
                />
              </div>
            )}
          </div>
        </div>

        {/* 하단 회색 푸터 */}
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

