package freelance.twin.sport.server.config.mail.twofa;

import freelance.twin.sport.server.user.entity.User;

public interface ITowFaMessageService {
    boolean send2faVerificationCode(User to, String verificationCode);
}
