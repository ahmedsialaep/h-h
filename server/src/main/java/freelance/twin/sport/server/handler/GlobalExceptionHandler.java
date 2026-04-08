package freelance.twin.sport.server.handler;

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

    @ExceptionHandler(ExpiredJwtException.class)
    public ResponseEntity<?> handleExpiredJwt(HttpServletRequest request,
                                              HttpServletResponse response) {


        authService.logout(request, response);

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", "Session expired"));
    }
}
