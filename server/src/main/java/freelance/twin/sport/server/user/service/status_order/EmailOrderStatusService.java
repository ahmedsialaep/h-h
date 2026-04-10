package freelance.twin.sport.server.user.service.status_order;

import freelance.twin.sport.server.commande.entity.Commande;
import freelance.twin.sport.server.commande.entity.Status;
import freelance.twin.sport.server.user.entity.User;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.time.format.DateTimeFormatter;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailOrderStatusService implements OrderStatusMessageService {

    private final TemplateEngine templateEngine;
    private final JavaMailSender mailSender;

    private static final DateTimeFormatter FORMATTER =
            DateTimeFormatter.ofPattern("dd MMMM yyyy", Locale.FRENCH);

    private static final Map<Status, String> STATUS_LABELS = Map.of(
            Status.EN_ATTENTE,    "En Attente",
            Status.CONFIRMEE,     "Commande Confirmée",
            Status.EXPEDIEE,      "Expédiée",
            Status.LIVREE,        "Livrée",
            Status.PRETE_RETRAIT, "Prête pour Retrait",
            Status.RECUPEREE,     "Récupérée",
            Status.ANNULEE,       "Annulée"
    );

    private static final Map<Status, String> STATUS_MESSAGES = Map.of(
            Status.EN_ATTENTE,    "Votre commande est en attente de confirmation. Nous vous tiendrons informé très bientôt.",
            Status.CONFIRMEE,     "Votre commande a été confirmée avec succès ! Nous allons commencer à préparer vos articles.",
            Status.EXPEDIEE,      "Votre commande est en route ! Elle devrait arriver bientôt à votre adresse.",
            Status.LIVREE,        "Votre commande a été livrée avec succès. Nous espérons que vous en êtes satisfait !",
            Status.PRETE_RETRAIT, "Votre commande est prête ! Vous pouvez venir la récupérer en magasin.",
            Status.RECUPEREE,     "Vous avez récupéré votre commande. Merci pour votre confiance !",
            Status.ANNULEE,       "Votre commande a été annulée. Contactez notre support pour plus d'informations."
    );

    private static final Map<Status, String> STATUS_COLORS = Map.of(
            Status.EN_ATTENTE,    "hsl(45,100%,40%)",
            Status.CONFIRMEE,     "hsl(22,100%,50%)",
            Status.EXPEDIEE,      "hsl(210,100%,45%)",
            Status.LIVREE,        "hsl(140,60%,40%)",
            Status.PRETE_RETRAIT, "hsl(270,60%,50%)",
            Status.RECUPEREE,     "hsl(140,60%,40%)",
            Status.ANNULEE,       "hsl(0,70%,50%)"
    );

    private static final Map<Status, String> STATUS_BG_COLORS = Map.of(
            Status.EN_ATTENTE,    "hsl(45,100%,95%)",
            Status.CONFIRMEE,     "hsl(22,100%,96%)",
            Status.EXPEDIEE,      "hsl(210,100%,95%)",
            Status.LIVREE,        "hsl(140,60%,95%)",
            Status.PRETE_RETRAIT, "hsl(270,60%,96%)",
            Status.RECUPEREE,     "hsl(140,60%,95%)",
            Status.ANNULEE,       "hsl(0,70%,96%)"
    );

    private static final Map<Status, Integer> STATUS_STEP_INDEX = Map.of(
            Status.EN_ATTENTE,    0,
            Status.CONFIRMEE,     1,
            Status.EXPEDIEE,      2,
            Status.LIVREE,        3,
            Status.PRETE_RETRAIT, 2,
            Status.RECUPEREE,     3,
            Status.ANNULEE,       0
    );

    // Pickup flow uses a different tracker in the template
    private static final Set<Status> PICKUP_STATUSES = Set.of(
            Status.PRETE_RETRAIT,
            Status.RECUPEREE
    );

    @Override
    public boolean sendOrderStatus(User to, Commande commande) {
        Status status = commande.getStatus();

        String recipientEmail = to != null
                ? to.getUsername()
                : commande.getGuestEmail();

        String recipientName = to != null
                ? to.getUsername()
                : commande.getGuestFirstName() + " " + commande.getGuestLastName();

        if (recipientEmail == null || recipientEmail.isBlank()) {
            log.warn("No recipient email found for commande ref={}", commande.getRef());
            return false;
        }

        Context context = new Context();
        context.setVariable("customerName",     recipientName);
        context.setVariable("orderId",          commande.getRef());
        context.setVariable("statusLabel",      STATUS_LABELS.getOrDefault(status, status.name()));
        context.setVariable("statusMessage",    STATUS_MESSAGES.getOrDefault(status, ""));
        context.setVariable("statusColor",      STATUS_COLORS.getOrDefault(status, "#333"));
        context.setVariable("statusBgColor",    STATUS_BG_COLORS.getOrDefault(status, "#f5f5f5"));
        context.setVariable("currentStepIndex", STATUS_STEP_INDEX.getOrDefault(status, 0));
        context.setVariable("isPickup",         PICKUP_STATUSES.contains(status));
        context.setVariable("isAnnulee",        status == Status.ANNULEE);
        context.setVariable("items",            commande.getItems());
        context.setVariable("total",            commande.getTotalPrice());
        context.setVariable("deliveryFee",      commande.getDeliveryFee());
        context.setVariable("orderDate",        commande.getCreatedAt() != null
                ? commande.getCreatedAt().format(FORMATTER) : "-");
        context.setVariable("city",             commande.getCity());
        context.setVariable("address",          commande.getAdress());
        context.setVariable("phone",            commande.getPhone());

        String body = templateEngine.process("order-status-email", context);

        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            helper.setTo(recipientEmail);
            helper.setSubject("Mise à jour de votre commande " + commande.getRef() + " — SneakPeak");
            helper.setText(body, true);
            mailSender.send(mimeMessage);
            return true;
        } catch (MessagingException e) {
            log.error("Failed to send order status email to {} for commande ref={}: {}",
                    recipientEmail, commande.getRef(), e.getMessage());
            return false;
        }
    }
}