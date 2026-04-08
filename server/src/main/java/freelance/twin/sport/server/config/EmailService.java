package freelance.twin.sport.server.config;

import freelance.twin.sport.server.user.service.UserService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;


    public void sendEmail(List<String> recipients, String subject, String htmlBody) {
        MimeMessage message = mailSender.createMimeMessage();

        try {
            MimeMessageHelper helper = new MimeMessageHelper(message, "UTF-8");
            helper.setTo(recipients.toArray(new String[0])); //setBcc if we want to hide recipients
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send email", e);
        }
    }
}
