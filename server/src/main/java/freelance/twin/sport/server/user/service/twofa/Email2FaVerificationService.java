package freelance.twin.sport.server.user.service.twofa;

import freelance.twin.sport.server.user.entity.TwofaMethod;
import freelance.twin.sport.server.user.entity.User;
import freelance.twin.sport.server.user.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.util.List;

@Service
@RequiredArgsConstructor
public class Email2FaVerificationService implements ITowFaMessageService {


    private final TemplateEngine templateEngine;


    private final JavaMailSender mailSender;

    private final UserRepository userRepository;

    @PostConstruct
    @Transactional
    public void initNullMethods() {
        List<User> users = userRepository.findUsersBytwoFaMethodIsNull(null);

        users.forEach(user -> user.setTwoFaMethod(TwofaMethod.EMAIL));

        userRepository.saveAll(users);
    }

    @Override
    public boolean send2faVerificationCode(User user, String verificationCode) {
        Context context = new Context();
        context.setVariable("verificationCode", verificationCode);

        String body = templateEngine.process("2fa-verification-mail", context);

        MimeMessage mimeMessage = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, "utf-8");

        try {
            helper.setTo(user.getUsername());
            helper.setSubject("Verification Identité");
            //helper.setFrom("assil@example.com"); //TEMP
            helper.setText(body, true);
            mailSender.send(mimeMessage);
            return true;
        } catch (MessagingException e) {
            e.printStackTrace();
            return false;
        }

    }
}
