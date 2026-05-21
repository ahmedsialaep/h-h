package freelance.twin.sport.server.handler;

import freelance.twin.sport.server.config.ApiRes;
import freelance.twin.sport.server.excepion.JmxSportException;
import freelance.twin.sport.server.user.service.UserService;
import freelance.twin.sport.server.utils.HttpStatusMapper;
import io.jsonwebtoken.ExpiredJwtException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

@RestControllerAdvice
@RequiredArgsConstructor
@Slf4j
public class GlobalExceptionHandler {

    private final UserService authService;

    @ExceptionHandler(JmxSportException.class)
    public ResponseEntity<ApiRes<?>> handleCrmException(JmxSportException ex) {
        log.warn("API error [{}]: {}", ex.getErrorCode(), ex.getMessage());
        HttpStatus status = HttpStatusMapper.mapToHttpStatus(ex.getApiErrorCode());
        return ResponseEntity
                .status(status)
                .body(ApiRes.fail(ex.getErrorCode(),ex.getApiErrorCode(), ex.getMessage()));
    }
    @ExceptionHandler(ExpiredJwtException.class)
    public ResponseEntity<?> handleExpiredJwt(HttpServletRequest request,
                                              HttpServletResponse response) {


        authService.logout(request,response);

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", "Session expired"));
    }
}
