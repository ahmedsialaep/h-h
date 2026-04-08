package freelance.twin.sport.server.user.dto;

import lombok.Data;

@Data
public class Verify2FaRequest {
    private String verificationCode;
}
