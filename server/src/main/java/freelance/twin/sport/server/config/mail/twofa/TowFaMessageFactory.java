package freelance.twin.sport.server.config.mail.twofa;

import freelance.twin.sport.server.user.entity.TwofaMethod;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class TowFaMessageFactory {
    private final Map<TwofaMethod, ITowFaMessageService> serviceMap;

    public TowFaMessageFactory(
            Email2FaVerificationService emailService
            ) {

        this.serviceMap = Map.of(
                TwofaMethod.EMAIL, emailService

        );
    }

    public ITowFaMessageService getNotificationService(TwofaMethod towFaMethod) {
        return serviceMap.get(towFaMethod);
    }
}
