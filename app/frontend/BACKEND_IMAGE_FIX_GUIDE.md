# 백엔드 이미지 표시 문제 해결 가이드

## 문제 상황
- 프론트엔드에서 정보 제공 페이지의 이미지가 표시되지 않음
- 브라우저 콘솔에 `ERR_BLOCKED_BY_ORB` (Opaque Response Blocking) 에러 발생
- CORS 정책으로 인한 이미지 리소스 차단

## 프론트엔드 현황
- 이미지 경로: `/images/content/...` 형식으로 백엔드에서 제공
- 프론트엔드는 백엔드 API base URL을 붙여서 이미지 요청: `https://api.taba-postura.com/images/content/...`
- 개발 환경: Vite 프록시를 통해 `/images` 경로를 백엔드로 프록시하도록 설정 완료

---

## 백엔드에서 해야 할 작업

### 1. CORS 헤더 설정 (가장 중요 ⭐)

이미지 응답에 CORS 헤더를 추가해야 합니다. 두 가지 방법 중 하나를 선택하세요.

#### 방법 1: WebMvcConfigurer 사용 (권장)

```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/images/**")
            .allowedOrigins("*") // 프로덕션에서는 특정 origin 지정 권장
            .allowedMethods("GET", "HEAD", "OPTIONS")
            .allowedHeaders("*")
            .exposedHeaders("Content-Type", "Content-Length", "Content-Disposition")
            .maxAge(3600);
    }
}
```

#### 방법 2: SecurityConfig에서 헤더 추가

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // ... 기존 설정 ...
            .headers(headers -> headers
                .addHeaderWriter(new StaticHeadersWriter(
                    "Access-Control-Allow-Origin", "*",
                    "Access-Control-Allow-Methods", "GET, HEAD, OPTIONS",
                    "Access-Control-Expose-Headers", "Content-Type, Content-Length"
                ))
            );
        
        return http.build();
    }
}
```

#### 방법 3: Filter를 통한 CORS 헤더 추가

```java
@Component
public class ImageCorsFilter implements Filter {
    
    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        HttpServletResponse httpResponse = (HttpServletResponse) response;
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        
        String path = httpRequest.getRequestURI();
        
        if (path.startsWith("/images/")) {
            httpResponse.setHeader("Access-Control-Allow-Origin", "*");
            httpResponse.setHeader("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
            httpResponse.setHeader("Access-Control-Expose-Headers", "Content-Type, Content-Length");
            httpResponse.setHeader("Access-Control-Max-Age", "3600");
        }
        
        chain.doFilter(request, response);
    }
}
```

---

### 2. SecurityConfig 설정 확인

이미 설정되어 있다고 하셨지만, 다시 한 번 확인해주세요:

```java
.requestMatchers("/api/content/**", "/videos/**", "/photo/**", "/static/**", "/images/**")
.permitAll()
```

**확인 사항:**
- `/images/**` 경로가 `permitAll()`로 설정되어 있는지
- 필터 체인 순서가 올바른지 (CORS 필터가 Security 필터보다 먼저 실행되어야 함)

---

### 3. 정적 리소스 경로 확인

Spring Boot가 `/images/**` 요청을 정적 리소스로 매핑하는지 확인:

#### application.properties 또는 application.yml

```properties
# application.properties
spring.web.resources.static-locations=classpath:/static/
spring.web.resources.add-mappings=true
```

```yaml
# application.yml
spring:
  web:
    resources:
      static-locations: classpath:/static/
      add-mappings: true
```

#### 또는 WebMvcConfigurer에서 명시적 설정

```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/images/**")
            .addResourceLocations("classpath:/static/images/")
            .setCachePeriod(3600);
    }
}
```

---

### 4. 이미지 파일 위치 확인

**파일 위치:**
```
src/main/resources/static/images/content/
```

**예시:**
- `src/main/resources/static/images/content/unequal_shoulders.png`
- `src/main/resources/static/images/content/forward_head.png`

**요청 경로:**
- `/images/content/unequal_shoulders.png`
- `/images/content/forward_head.png`

**확인 방법:**
1. 브라우저에서 직접 접근: `https://api.taba-postura.com/images/content/unequal_shoulders.png`
2. 200 OK 응답이 와야 함
3. 이미지가 정상적으로 표시되어야 함

---

### 5. Content-Type 헤더 확인

이미지 응답에 올바른 `Content-Type` 헤더가 포함되어 있는지 확인:

- PNG: `Content-Type: image/png`
- JPEG: `Content-Type: image/jpeg`
- GIF: `Content-Type: image/gif`

Spring Boot는 일반적으로 자동으로 설정하지만, 명시적으로 설정할 수도 있습니다:

```java
@Override
public void addResourceHandlers(ResourceHandlerRegistry registry) {
    registry.addResourceHandler("/images/**")
        .addResourceLocations("classpath:/static/images/")
        .resourceChain(true)
        .addResolver(new PathResourceResolver() {
            @Override
            protected Resource getResource(String resourcePath, Resource location) throws IOException {
                Resource resource = super.getResource(resourcePath, location);
                if (resource != null && resource.exists()) {
                    return resource;
                }
                return null;
            }
        });
}
```

---

## 테스트 방법

### 1. 브라우저에서 직접 접근 테스트

```
https://api.taba-postura.com/images/content/unequal_shoulders.png
```

**예상 결과:**
- ✅ 200 OK
- ✅ 이미지가 정상적으로 표시됨
- ✅ Response Headers에 CORS 헤더 포함:
  ```
  Access-Control-Allow-Origin: *
  Access-Control-Allow-Methods: GET, HEAD, OPTIONS
  Content-Type: image/png
  ```

### 2. curl로 CORS 헤더 확인

```bash
curl -I -H "Origin: http://localhost:3000" \
  https://api.taba-postura.com/images/content/unequal_shoulders.png
```

**예상 응답 헤더:**
```
HTTP/1.1 200 OK
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, HEAD, OPTIONS
Content-Type: image/png
Content-Length: 12345
```

### 3. OPTIONS 요청 테스트 (Preflight)

```bash
curl -X OPTIONS \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: GET" \
  -v \
  https://api.taba-postura.com/images/content/test.png
```

---

## 우선순위

1. **최우선**: CORS 헤더 설정 (방법 1 또는 2 권장)
2. SecurityConfig에서 `/images/**` permitAll 확인
3. 정적 리소스 경로 매핑 확인
4. 이미지 파일 위치 및 접근 가능 여부 확인

---

## 참고 사항

- **프로덕션 환경**: `allowedOrigins("*")` 대신 특정 origin을 지정하는 것이 보안상 더 안전합니다:
  ```java
  .allowedOrigins("https://taba-postura.com", "https://www.taba-postura.com")
  ```

- **캐싱**: 이미지는 변경이 적으므로 적절한 캐싱 헤더를 설정하면 성능 향상에 도움이 됩니다:
  ```java
  .setCachePeriod(3600) // 1시간
  ```

- **에러 처리**: 이미지가 없을 때 404 응답도 CORS 헤더를 포함해야 프론트엔드에서 에러를 제대로 처리할 수 있습니다.

---

## 문의사항

문제가 지속되면 다음 정보를 공유해주세요:
1. 브라우저 Network 탭의 이미지 요청/응답 헤더 스크린샷
2. 서버 로그 (이미지 요청이 서버에 도달하는지 확인)
3. SecurityConfig 전체 코드 (민감 정보 제외)

