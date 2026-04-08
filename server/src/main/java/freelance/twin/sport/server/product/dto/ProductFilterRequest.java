package freelance.twin.sport.server.product.dto;

import freelance.twin.sport.server.product.entity.Categorie;
import freelance.twin.sport.server.product.entity.Genre;
import lombok.Getter;
import lombok.Setter;


import java.util.List;

@Getter
@Setter
public class ProductFilterRequest {

    private List<Long> brandIds;
    private List<Genre> genres;
    private List<Categorie> categories;
    private List<Long> types;
    private List<String> colors;
    private String search;
    private Boolean newArrival;
    private List<Boolean> marketVisible;
    private List<String> size;

    private Double minPrice;
    private Double maxPrice;

    private int page = 0;
    private int pageSize = 20;

    private String sortBy = "id";
    private String sortDir = "asc";
}
