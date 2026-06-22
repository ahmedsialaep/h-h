package freelance.twin.sport.server.product.specification;

import freelance.twin.sport.server.product.dto.ProductFilterRequest;
import freelance.twin.sport.server.product.entity.*;
import jakarta.persistence.criteria.*;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class ProductSpecification {

    public static Specification<Product> withFilters(ProductFilterRequest filter) {

        return (root, query, cb) -> {

            query.distinct(true);

            if (Product.class.equals(query.getResultType())) {
                root.fetch("brand", JoinType.LEFT);
                root.fetch("productType", JoinType.LEFT);
            }
            List<Predicate> predicates = new ArrayList<>();

            /*
             * JOINS (safe joins only)
             */
            Join<Product, Brand> brandJoin = root.join("brand", JoinType.INNER);
            Join<Product, Type> typeJoin = root.join("productType", JoinType.INNER);

            /*
             * BASIC FILTERS
             */

            if (filter.getBrandIds() != null && !filter.getBrandIds().isEmpty()) {
                predicates.add(brandJoin.get("id").in(filter.getBrandIds()));
            }

            if (filter.getGenres() != null && !filter.getGenres().isEmpty()) {
                predicates.add(root.get("gender").in(filter.getGenres()));
            }

            if (filter.getCategories() != null && !filter.getCategories().isEmpty()) {
                predicates.add(root.get("categorie").in(filter.getCategories()));
            }

            if (filter.getTypes() != null && !filter.getTypes().isEmpty()) {
                predicates.add(typeJoin.get("id").in(filter.getTypes()));
            }

            if (filter.getMinPrice() != null) {
                predicates.add(
                        cb.greaterThanOrEqualTo(
                                root.get("price"),
                                filter.getMinPrice()
                        )
                );
            }

            if (filter.getMaxPrice() != null) {
                predicates.add(
                        cb.lessThanOrEqualTo(
                                root.get("price"),
                                filter.getMaxPrice()
                        )
                );
            }

            if (filter.getNewArrival() != null) {
                predicates.add(
                        cb.equal(
                                root.get("newArrival"),
                                filter.getNewArrival()
                        )
                );
            }

            if (filter.getMarketVisible() != null && !filter.getMarketVisible().isEmpty()) {
                predicates.add(
                        root.get("marketVisible").in(filter.getMarketVisible())
                );
            }

            /*
             * SEARCH
             */

            if (filter.getSearch() != null && !filter.getSearch().isBlank()) {

                String search = "%" + filter.getSearch().toLowerCase().trim() + "%";

                predicates.add(
                        cb.or(
                                cb.like(
                                        cb.lower(root.get("name")),
                                        search
                                ),
                                cb.like(
                                        cb.lower(root.get("ref")),
                                        search
                                ),
                                cb.like(
                                        cb.lower(brandJoin.get("brand_name")),
                                        search
                                )
                        )
                );
            }

            /*
             * COLOR FILTER (EXISTS)
             */

            if (filter.getColors() != null && !filter.getColors().isEmpty()) {

                Subquery<Long> colorSubquery = query.subquery(Long.class);

                Root<ProductVars> variantRoot = colorSubquery.from(ProductVars.class);

                colorSubquery.select(
                        variantRoot.get("product").get("id")
                );

                colorSubquery.where(
                        cb.and(
                                cb.equal(
                                        variantRoot.get("product").get("id"),
                                        root.get("id")
                                ),
                                variantRoot.get("color").in(filter.getColors())
                        )
                );

                predicates.add(cb.exists(colorSubquery));
            }

            /*
             * SIZE FILTER (EXISTS)
             */

            if (filter.getSize() != null && !filter.getSize().isEmpty()) {

                Subquery<Long> sizeSubquery = query.subquery(Long.class);

                Root<ProductVars> variantRoot = sizeSubquery.from(ProductVars.class);

                sizeSubquery.select(
                        variantRoot.get("product").get("id")
                );

                sizeSubquery.where(
                        cb.and(
                                cb.equal(
                                        variantRoot.get("product").get("id"),
                                        root.get("id")
                                ),
                                variantRoot.get("size").in(filter.getSize())
                        )
                );

                predicates.add(cb.exists(sizeSubquery));
            }
            if (filter.getLowStockThreshold() != null) {
                Subquery<Long> stockSubquery = query.subquery(Long.class);
                Root<ProductVars> stockVariantRoot = stockSubquery.from(ProductVars.class);

                stockSubquery.select(stockVariantRoot.get("product").get("id"));
                stockSubquery.where(
                        cb.equal(stockVariantRoot.get("product").get("id"), root.get("id"))
                );
                stockSubquery.groupBy(stockVariantRoot.get("product").get("id"));
                stockSubquery.having(
                        cb.le(
                                cb.sumAsLong(stockVariantRoot.get("stock")),
                                filter.getLowStockThreshold()
                        )
                );

                predicates.add(cb.exists(stockSubquery));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
