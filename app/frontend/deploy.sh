#!/bin/bash

# 개선된 배포 스크립트
# 사용법: ./deploy.sh [버킷명] [프로필명] [CloudFront Distribution ID]
# 환경 변수: CLOUDFRONT_DISTRIBUTION_ID, AWS_REGION (선택사항)

set -e  # 에러 발생 시 즉시 종료

BUCKET_NAME=${1:-postura-frontend-prod}
AWS_PROFILE=${2:-default}
CLOUDFRONT_DIST_ID=${3:-${CLOUDFRONT_DISTRIBUTION_ID:-EIL0MWS492AIU}}
AWS_REGION=${AWS_REGION:-ap-northeast-2}

echo "🚀 배포 시작..."
echo "📦 버킷: $BUCKET_NAME"
echo "👤 AWS 프로필: $AWS_PROFILE"
echo "🌍 리전: $AWS_REGION"

# AWS CLI 설치 확인
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI가 설치되어 있지 않습니다."
    echo "💡 설치 방법: https://aws.amazon.com/cli/"
    exit 1
fi

# npm 설치 확인
if ! command -v npm &> /dev/null; then
    echo "❌ npm이 설치되어 있지 않습니다."
    exit 1
fi

# 프로필 설정
PROFILE_ARG=""
if [ "$AWS_PROFILE" != "default" ]; then
    PROFILE_ARG="--profile $AWS_PROFILE"
fi

# 환경 변수 파일 확인
if [ ! -f .env.production ]; then
    echo "⚠️  .env.production 파일이 없습니다!"
    echo "💡 .env.production 파일을 생성하고 환경 변수를 설정하세요."
    if [ -t 0 ]; then
        read -p "계속하시겠습니까? (y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    else
        echo "⚠️  비대화형 모드: 계속 진행합니다."
    fi
fi

# S3 버킷 존재 확인
echo ""
echo "🔍 S3 버킷 확인 중..."
if aws s3 ls "s3://$BUCKET_NAME" $PROFILE_ARG 2>/dev/null; then
    echo "✅ S3 버킷 접근 가능"
else
    echo "❌ S3 버킷에 접근할 수 없습니다."
    echo "💡 다음을 확인하세요:"
    echo "   - 버킷 이름이 올바른지 확인: $BUCKET_NAME"
    echo "   - AWS 자격 증명 설정: aws configure $PROFILE_ARG"
    echo "   - 버킷 권한 확인"
    exit 1
fi

# CloudFront Distribution ID 자동 감지 (제공되지 않은 경우)
if [ -z "$CLOUDFRONT_DIST_ID" ]; then
    echo ""
    echo "🔍 CloudFront Distribution 자동 감지 중..."
    # S3 버킷을 Origin으로 사용하는 Distribution 찾기
    DIST_LIST=$(aws cloudfront list-distributions $PROFILE_ARG --query "DistributionList.Items[?Origins.Items[?DomainName=='$BUCKET_NAME.s3-website.$AWS_REGION.amazonaws.com' || contains(DomainName, '$BUCKET_NAME')]].Id" --output text 2>/dev/null || echo "")
    
    if [ -n "$DIST_LIST" ] && [ "$DIST_LIST" != "None" ]; then
        # 첫 번째 Distribution ID 사용
        CLOUDFRONT_DIST_ID=$(echo $DIST_LIST | awk '{print $1}')
        echo "✅ CloudFront Distribution 발견: $CLOUDFRONT_DIST_ID"
    else
        echo "⚠️  CloudFront Distribution을 자동으로 찾을 수 없습니다."
        echo "💡 Distribution ID를 수동으로 제공하거나 환경 변수로 설정하세요:"
        echo "   CLOUDFRONT_DISTRIBUTION_ID=YOUR_DIST_ID ./deploy.sh"
    fi
fi

if [ -n "$CLOUDFRONT_DIST_ID" ]; then
    echo "☁️  CloudFront Distribution: $CLOUDFRONT_DIST_ID"
    
    # CloudFront Distribution 상태 확인
    echo "🔍 CloudFront Distribution 상태 확인 중..."
    CF_STATUS=$(aws cloudfront get-distribution \
        --id "$CLOUDFRONT_DIST_ID" \
        $PROFILE_ARG \
        --query 'Distribution.Status' \
        --output text 2>/dev/null || echo "UNKNOWN")
    
    if [ "$CF_STATUS" != "UNKNOWN" ]; then
        echo "   상태: $CF_STATUS"
        if [ "$CF_STATUS" != "Deployed" ]; then
            echo "⚠️  Distribution이 아직 배포 중입니다. 일부 변경사항이 반영되지 않을 수 있습니다."
        fi
    fi
fi

# node_modules 확인
if [ ! -d "node_modules" ]; then
    echo ""
    echo "📦 node_modules가 없습니다. 의존성을 설치합니다..."
    npm install
fi

# 환경 변수 확인 및 설정
echo ""
echo "🔍 환경 변수 확인 중..."
ENV_FILE=".env.production"
if [ -f "$ENV_FILE" ]; then
    echo "✅ .env.production 파일 발견"
    # 환경 변수 로드 (공백과 특수문자 처리)
    set -a
    source "$ENV_FILE"
    set +a
    
    if [ -n "$VITE_API_BASE_URL" ]; then
        echo "   VITE_API_BASE_URL: $VITE_API_BASE_URL"
        export VITE_API_BASE_URL
        if [[ "$VITE_API_BASE_URL" == http://* ]]; then
            echo "⚠️  경고: HTTP URL을 사용하고 있습니다. HTTPS를 사용하는 것을 권장합니다."
            echo "   Mixed Content 에러가 발생할 수 있습니다."
            echo ""
            echo "💡 백엔드가 HTTPS를 지원하는 경우 .env.production 파일을 수정하세요:"
            echo "   VITE_API_BASE_URL=https://13.239.176.67:8080"
        fi
    else
        echo "⚠️  VITE_API_BASE_URL이 설정되지 않았습니다. 기본값을 사용합니다."
        echo "💡 .env.production 파일에 VITE_API_BASE_URL을 설정하세요."
    fi
else
    echo "⚠️  .env.production 파일이 없습니다."
    echo ""
    echo "💡 프로덕션 환경 변수를 설정하려면 .env.production 파일을 생성하세요:"
    echo ""
    echo "   # 백엔드가 HTTPS를 지원하는 경우:"
    echo "   VITE_API_BASE_URL=https://13.239.176.67:8080"
    echo ""
    echo "   # 또는 백엔드 도메인이 있는 경우:"
    echo "   VITE_API_BASE_URL=https://api.yourdomain.com"
    echo ""
    echo "⚠️  기본 HTTP URL을 사용합니다. Mixed Content 에러가 발생할 수 있습니다."
    echo "   프로덕션 환경에서는 HTTPS를 사용해야 합니다!"
fi

# 빌드 (환경 변수 포함)
echo ""
echo "📦 빌드 중..."
echo "   환경 변수: VITE_API_BASE_URL=${VITE_API_BASE_URL:-'http://13.239.176.67:8080 (기본값)'}"
if ! npm run build; then
    echo "❌ 빌드 실패: npm run build 명령이 실패했습니다."
    exit 1
fi

# 빌드 확인
if [ ! -d "dist" ]; then
    echo "❌ 빌드 실패: dist 폴더가 생성되지 않았습니다."
    exit 1
fi

if [ ! -f "dist/index.html" ]; then
    echo "❌ 빌드 실패: dist/index.html 파일이 없습니다."
    exit 1
fi

# assets 폴더 확인
if [ ! -d "dist/assets" ] || [ -z "$(ls -A dist/assets 2>/dev/null)" ]; then
    echo "⚠️  경고: dist/assets 폴더가 비어있거나 없습니다."
    echo "   빌드가 제대로 완료되지 않았을 수 있습니다."
fi

# 빌드 파일 크기 확인
BUILD_SIZE=$(du -sh dist 2>/dev/null | awk '{print $1}' || echo "알 수 없음")
echo "✅ 빌드 완료 (크기: $BUILD_SIZE)"

# S3 업로드
echo ""
echo "🚀 S3에 업로드 중..."
S3_SYNC_CMD="aws s3 sync dist/ s3://$BUCKET_NAME --delete --region $AWS_REGION"
if [ "$AWS_PROFILE" != "default" ]; then
    S3_SYNC_CMD="$S3_SYNC_CMD --profile $AWS_PROFILE"
fi

if $S3_SYNC_CMD; then
    echo ""
    echo "✅ S3 업로드 완료!"
    
    # 업로드된 파일 수 확인
    FILE_COUNT=$(aws s3 ls "s3://$BUCKET_NAME" --recursive $PROFILE_ARG --region $AWS_REGION 2>/dev/null | wc -l || echo "알 수 없음")
    echo "   업로드된 파일 수: $FILE_COUNT"
    
    # CloudFront Invalidation (Distribution ID가 제공된 경우)
    if [ -n "$CLOUDFRONT_DIST_ID" ]; then
        echo ""
        echo "🔄 CloudFront 캐시 무효화 중..."
        INVALIDATION_ID=""
        if [ "$AWS_PROFILE" != "default" ]; then
            INVALIDATION_ID=$(aws cloudfront create-invalidation \
                --distribution-id "$CLOUDFRONT_DIST_ID" \
                --paths "/*" \
                --profile "$AWS_PROFILE" \
                --query 'Invalidation.Id' \
                --output text 2>/dev/null || echo "")
        else
            INVALIDATION_ID=$(aws cloudfront create-invalidation \
                --distribution-id "$CLOUDFRONT_DIST_ID" \
                --paths "/*" \
                --query 'Invalidation.Id' \
                --output text 2>/dev/null || echo "")
        fi
        
        if [ -n "$INVALIDATION_ID" ]; then
            echo "✅ CloudFront Invalidation 생성됨: $INVALIDATION_ID"
            echo "💡 캐시 무효화 완료까지 몇 분 소요될 수 있습니다."
            
            # Invalidation 상태 확인 (선택사항)
            echo "   Invalidation 상태 확인:"
            echo "   aws cloudfront get-invalidation --distribution-id $CLOUDFRONT_DIST_ID --id $INVALIDATION_ID $PROFILE_ARG"
        else
            echo "⚠️  CloudFront Invalidation 실패"
            echo "   Distribution ID($CLOUDFRONT_DIST_ID)를 확인하세요."
            echo "   S3 업로드는 완료되었지만 캐시는 수동으로 무효화해야 할 수 있습니다."
        fi
    else
        echo ""
        echo "💡 CloudFront Distribution ID가 제공되지 않았습니다."
        echo "   캐시 무효화를 원하시면 다음처럼 실행하세요:"
        echo "   ./deploy.sh $BUCKET_NAME $AWS_PROFILE <Distribution-ID>"
        echo "   또는 환경 변수 설정:"
        echo "   export CLOUDFRONT_DISTRIBUTION_ID=YOUR_DIST_ID"
    fi
    
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "✅ 배포 완료!"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "🌐 접속 URL:"
    echo ""
    echo "   S3 웹사이트:"
    echo "   http://$BUCKET_NAME.s3-website-$AWS_REGION.amazonaws.com"
    echo ""
    
    if [ -n "$CLOUDFRONT_DIST_ID" ]; then
        CF_DOMAIN=""
        if [ "$AWS_PROFILE" != "default" ]; then
            CF_DOMAIN=$(aws cloudfront get-distribution \
                --id "$CLOUDFRONT_DIST_ID" \
                --profile "$AWS_PROFILE" \
                --query 'Distribution.DomainName' \
                --output text 2>/dev/null || echo "")
        else
            CF_DOMAIN=$(aws cloudfront get-distribution \
                --id "$CLOUDFRONT_DIST_ID" \
                --query 'Distribution.DomainName' \
                --output text 2>/dev/null || echo "")
        fi
        
        if [ -n "$CF_DOMAIN" ]; then
            echo "   CloudFront (HTTPS):"
            echo "   https://$CF_DOMAIN"
            echo ""
            echo "💡 CloudFront URL을 사용하세요 (HTTPS, CDN)"
        else
            echo "   CloudFront: (정보를 가져올 수 없습니다)"
        fi
    fi
    
    echo ""
    echo "📋 다음 단계:"
    echo "   1. 브라우저에서 URL 접속하여 확인"
    echo "   2. 웹캠 기능 테스트 (HTTPS 필수)"
    echo "   3. CloudFront Invalidation 완료 대기 (2-5분)"
    echo ""
else
    echo ""
    echo "❌ S3 업로드 실패"
    echo "💡 다음을 확인하세요:"
    echo "   - AWS 자격 증명 설정: aws configure $PROFILE_ARG"
    echo "   - 버킷 이름이 올바른지 확인: $BUCKET_NAME"
    echo "   - 버킷 권한 확인"
    echo "   - 네트워크 연결 확인"
    exit 1
fi
