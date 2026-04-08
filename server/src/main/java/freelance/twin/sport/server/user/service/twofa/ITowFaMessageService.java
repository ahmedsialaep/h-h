package freelance.twin.sport.server.user.service.twofa;

import freelance.twin.sport.server.user.entity.User;

public interface ITowFaMessageService {
    boolean send2faVerificationCode(User to, String verificationCode);
}
