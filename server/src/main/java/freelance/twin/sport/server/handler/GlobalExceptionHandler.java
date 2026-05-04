package freelance.twin.sport.server.handler;

import freelance.twin.sport.server.config.ApiRes;
import freelance.twin.sport.server.excepion.JmxSportException;
import freelance.twin.sport.server.user.service.UserService;
import io.jsonwebtoken.ExpiredJwtException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

@RestControllerAdvice
@RequiredArgsConstructor
public class GlobalExceptionHandler {

    private final UserService authService;

    @ExceptionHandler(JmxSportException.class)
    public ResponseEntity<ApiRes<?>> handleCrmException(JmxSportException ex) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiRes.fail(ex.getApiErrorCode(), ex.getMessage()));
    }
    @ExceptionHandler(ExpiredJwtException.class)
    public ResponseEntity<?> handleExpiredJwt(
                                              HttpServletResponse response) {


        authService.logout(response);

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", "Session expired"));
    }
}
