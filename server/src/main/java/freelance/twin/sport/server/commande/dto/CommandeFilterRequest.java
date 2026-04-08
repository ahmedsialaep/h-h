package freelance.twin.sport.server.commande.dto;

import freelance.twin.sport.server.commande.entity.Status;
import lombok.Getter;
import lombok.Setter;


import java.util.List;
import java.util.UUID;

@Getter
@Setter
public class CommandeFilterRequest {
    private UUID userId;
    private List<Status> status;
    private String search;
    private int page = 0;
    private int pageSize = 20;
    private String sortBy = "createdAt";
    private String sortDir = "desc";
}
