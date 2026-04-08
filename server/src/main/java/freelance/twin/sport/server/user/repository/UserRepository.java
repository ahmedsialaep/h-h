package freelance.twin.sport.server.user.repository;

import freelance.twin.sport.server.user.entity.TwofaMethod;
import freelance.twin.sport.server.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    User findUserByUsername(String username);

    User findUserById(UUID id);

    List<User> findUsersBytwoFaMethodIsNull(TwofaMethod towFaMethod);
}
