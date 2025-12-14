@echo off
REM 개선된 배포 스크립트 (Windows)
REM 사용법: deploy.bat [버킷명] [프로필명] [CloudFront Distribution ID]
REM 환경 변수: CLOUDFRONT_DISTRIBUTION_ID, AWS_REGION (선택사항)

setlocal enabledelayedexpansion

set BUCKET_NAME=%1
if "%BUCKET_NAME%"=="" set BUCKET_NAME=postura-frontend-prod

set AWS_PROFILE=%2
if "%AWS_PROFILE%"=="" set AWS_PROFILE=default

set CLOUDFRONT_DIST_ID=%3
if "%CLOUDFRONT_DIST_ID%"=="" (
    if not "%CLOUDFRONT_DISTRIBUTION_ID%"=="" (
        set CLOUDFRONT_DIST_ID=%CLOUDFRONT_DISTRIBUTION_ID%
    ) else (
        set CLOUDFRONT_DIST_ID=EIL0MWS492AIU
    )
)

set AWS_REGION=%AWS_REGION%
if "%AWS_REGION%"=="" set AWS_REGION=ap-northeast-2

echo 🚀 배포 시작...
echo 📦 버킷: %BUCKET_NAME%
echo 👤 AWS 프로필: %AWS_PROFILE%
echo 🌍 리전: %AWS_REGION%

REM AWS CLI 설치 확인
where aws >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ AWS CLI가 설치되어 있지 않습니다.
    echo 💡 설치 방법: https://aws.amazon.com/cli/
    pause
    exit /b 1
)

REM npm 설치 확인
where npm >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ npm이 설치되어 있지 않습니다.
    pause
    exit /b 1
)

REM 프로필 설정
set PROFILE_ARG=
if not "%AWS_PROFILE%"=="default" (
    set PROFILE_ARG=--profile %AWS_PROFILE%
)

REM 환경 변수 확인 및 설정
echo.
echo 🔍 환경 변수 확인 중...
if exist .env.production (
    echo ✅ .env.production 파일 발견
    REM 환경 변수 로드 (간단 버전)
    for /f "usebackq tokens=1,* delims==" %%a in (".env.production") do (
        set "%%a=%%b"
    )
    if defined VITE_API_BASE_URL (
        echo    VITE_API_BASE_URL: %VITE_API_BASE_URL%
        if "%VITE_API_BASE_URL:~0,7%"=="http://" (
            echo ⚠️  경고: HTTP URL을 사용하고 있습니다. HTTPS를 사용하는 것을 권장합니다.
            echo    Mixed Content 에러가 발생할 수 있습니다.
        )
    ) else (
        echo ⚠️  VITE_API_BASE_URL이 설정되지 않았습니다. 기본값을 사용합니다.
    )
) else (
    echo ⚠️  .env.production 파일이 없습니다.
    echo.
    echo 💡 프로덕션 환경 변수를 설정하려면 .env.production 파일을 생성하세요:
    echo    VITE_API_BASE_URL=https://13.239.176.67:8080
    echo.
    echo ⚠️  기본 HTTP URL을 사용합니다. Mixed Content 에러가 발생할 수 있습니다.
    echo    프로덕션 환경에서는 HTTPS를 사용해야 합니다!
)

REM S3 버킷 존재 확인
echo.
echo 🔍 S3 버킷 확인 중...
if "%AWS_PROFILE%"=="default" (
    aws s3 ls s3://%BUCKET_NAME% --region %AWS_REGION% >nul 2>&1
) else (
    aws s3 ls s3://%BUCKET_NAME% --region %AWS_REGION% --profile %AWS_PROFILE% >nul 2>&1
)

if %ERRORLEVEL% EQU 0 (
    echo ✅ S3 버킷 접근 가능
) else (
    echo ❌ S3 버킷에 접근할 수 없습니다.
    echo 💡 다음을 확인하세요:
    echo    - 버킷 이름이 올바른지 확인: %BUCKET_NAME%
    echo    - AWS 자격 증명 설정: aws configure
    echo    - 버킷 권한 확인
    pause
    exit /b 1
)

REM CloudFront Distribution ID 자동 감지 (간단 버전)
if "%CLOUDFRONT_DIST_ID%"=="" (
    echo.
    echo 💡 CloudFront Distribution ID가 제공되지 않았습니다.
    echo    환경 변수로 설정하거나 인자로 전달하세요:
    echo    set CLOUDFRONT_DISTRIBUTION_ID=YOUR_DIST_ID
    echo    또는
    echo    deploy.bat %BUCKET_NAME% %AWS_PROFILE% YOUR_DIST_ID
)

if not "%CLOUDFRONT_DIST_ID%"=="" (
    echo ☁️  CloudFront Distribution: %CLOUDFRONT_DIST_ID%
)

REM 빌드
echo.
echo 📦 빌드 중...
call npm run build

if %ERRORLEVEL% NEQ 0 (
    echo ❌ 빌드 실패
    pause
    exit /b 1
)

REM 빌드 확인
if not exist dist (
    echo ❌ 빌드 실패: dist 폴더가 생성되지 않았습니다.
    pause
    exit /b 1
)

if not exist dist\index.html (
    echo ❌ 빌드 실패: dist\index.html 파일이 없습니다.
    pause
    exit /b 1
)

echo ✅ 빌드 완료

REM S3 업로드
echo.
echo 🚀 S3에 업로드 중...
if "%AWS_PROFILE%"=="default" (
    aws s3 sync dist/ s3://%BUCKET_NAME% --delete --region %AWS_REGION%
) else (
    aws s3 sync dist/ s3://%BUCKET_NAME% --delete --region %AWS_REGION% --profile %AWS_PROFILE%
)

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ S3 업로드 완료!
    
    REM CloudFront Invalidation (Distribution ID가 제공된 경우)
    if not "%CLOUDFRONT_DIST_ID%"=="" (
        echo.
        echo 🔄 CloudFront 캐시 무효화 중...
        set INVALIDATION_ID=
        
        if "%AWS_PROFILE%"=="default" (
            for /f "tokens=*" %%i in ('aws cloudfront create-invalidation --distribution-id "%CLOUDFRONT_DIST_ID%" --paths "/*" --query "Invalidation.Id" --output text 2^>nul') do set INVALIDATION_ID=%%i
        ) else (
            for /f "tokens=*" %%i in ('aws cloudfront create-invalidation --distribution-id "%CLOUDFRONT_DIST_ID%" --paths "/*" --profile "%AWS_PROFILE%" --query "Invalidation.Id" --output text 2^>nul') do set INVALIDATION_ID=%%i
        )
        
        if not "!INVALIDATION_ID!"=="" (
            echo ✅ CloudFront Invalidation 생성됨: !INVALIDATION_ID!
            echo 💡 캐시 무효화 완료까지 몇 분 소요될 수 있습니다.
        ) else (
            echo ⚠️  CloudFront Invalidation 실패 (Distribution ID 확인 필요)
        )
    ) else (
        echo.
        echo 💡 CloudFront Distribution ID가 제공되지 않았습니다.
        echo    캐시 무효화를 원하시면 다음처럼 실행하세요:
        echo    deploy.bat %BUCKET_NAME% %AWS_PROFILE% ^<Distribution-ID^>
    )
    
    echo.
    echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    echo ✅ 배포 완료!
    echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    echo.
    echo 🌐 접속 URL:
    echo.
    echo    S3 웹사이트:
    echo    http://%BUCKET_NAME%.s3-website-%AWS_REGION%.amazonaws.com
    echo.
    
    if not "%CLOUDFRONT_DIST_ID%"=="" (
        set CF_DOMAIN=
        if "%AWS_PROFILE%"=="default" (
            for /f "tokens=*" %%i in ('aws cloudfront get-distribution --id "%CLOUDFRONT_DIST_ID%" --query "Distribution.DomainName" --output text 2^>nul') do set CF_DOMAIN=%%i
        ) else (
            for /f "tokens=*" %%i in ('aws cloudfront get-distribution --id "%CLOUDFRONT_DIST_ID%" --profile "%AWS_PROFILE%" --query "Distribution.DomainName" --output text 2^>nul') do set CF_DOMAIN=%%i
        )
        
        if not "!CF_DOMAIN!"=="" (
            echo    CloudFront (HTTPS):
            echo    https://!CF_DOMAIN!
            echo.
            echo 💡 CloudFront URL을 사용하세요 (HTTPS, CDN)
        )
    )
    
    echo.
    echo 📋 다음 단계:
    echo    1. 브라우저에서 URL 접속하여 확인
    echo    2. 웹캠 기능 테스트 (HTTPS 필수)
    echo    3. CloudFront Invalidation 완료 대기 (2-5분)
    echo.
) else (
    echo.
    echo ❌ 배포 실패
    echo 💡 다음을 확인하세요:
    echo    - AWS 자격 증명 설정: aws configure
    echo    - 버킷 이름이 올바른지 확인
    echo    - 버킷 권한 확인
    pause
    exit /b 1
)

pause
