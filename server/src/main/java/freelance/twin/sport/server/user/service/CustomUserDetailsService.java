package freelance.twin.sport.server.user.service;

import freelance.twin.sport.server.user.entity.User;
import freelance.twin.sport.server.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    @Override
    public UserDetails loadUserByUsername(String username) {

        User user = userRepository.findUserByUsername(username);

        return new org.springframework.security.core.userdetails.User(
                user.getUsername(),
                user.getPwd(),
                List.of(new SimpleGrantedAuthority("ROLE_" + user.getRoleUser().name()))
        );
    }
}
