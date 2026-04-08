package freelance.twin.sport.server.commande.mapper;

import freelance.twin.sport.server.commande.dto.CommandeDto;
import freelance.twin.sport.server.commande.dto.CommandeItemDto;
import freelance.twin.sport.server.commande.dto.CommandeRequest;
import freelance.twin.sport.server.commande.entity.Commande;
import freelance.twin.sport.server.commande.entity.CommandItem;


public class CommandeMapper {

    public static CommandeDto toDTO(Commande c) {
        CommandeDto dto = new CommandeDto();
        dto.setId(c.getId());
        dto.setRef(c.getRef());
        dto.setStatus(c.getStatus());
        dto.setCreatedAt(c.getCreatedAt());
        dto.setUpdatedAt(c.getUpdatedAt());
        dto.setDeliveryMethod(c.getDeliveryMethod());
        dto.setAdress(c.getAdress());
        dto.setCity(c.getCity());
        dto.setPhone(c.getPhone());
        dto.setTotalPrice(c.getTotalPrice());
        dto.setDeliveryFee(c.getDeliveryFee());
        dto.setNotes(c.getNotes());
        dto.setGuestFirstName(c.getGuestFirstName());
        dto.setGuestLastName(c.getGuestLastName());
        dto.setGuestEmail(c.getGuestEmail());
        dto.setGuestPhone(c.getGuestPhone());

        if (c.getUser() != null) {
            dto.setUserId(c.getUser().getId());
            dto.setUsername(c.getUser().getUsername());
            dto.setUserNom(c.getUser().getNom());
            dto.setUserPrenom(c.getUser().getPrenom());
        }

        if (c.getItems() != null) {
            dto.setItems(c.getItems().stream()
                    .map(CommandeMapper::toItemDTO)
                    .toList());
        }

        return dto;
    }


    private static CommandeItemDto toItemDTO(CommandItem item) {
        CommandeItemDto dto = new CommandeItemDto();
        dto.setId(item.getId());
        dto.setQuantity(item.getQuantity());
        dto.setUnitPrice(item.getUnitPrice());
        dto.setProductId(item.getProduct() != null ? item.getProduct().getId() : null);
        dto.setVariantId(item.getVariant() != null ? item.getVariant().getId() : null);
        dto.setBrandName(item.getProduct().getBrand().getBrand_name());
        dto.setProductImage(item.getProduct().getImage());
        dto.setProductName(item.getProduct().getName());
        dto.setProductRef(item.getProduct().getRef());
        dto.setVariantSize(item.getVariant().getSize());
        dto.setVariantColor(item.getVariant().getColor());
        return dto;
    }

}
