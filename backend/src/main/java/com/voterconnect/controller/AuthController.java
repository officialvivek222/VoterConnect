package com.voterconnect.controller;

import com.voterconnect.model.Role;
import com.voterconnect.model.User;
import com.voterconnect.payload.request.LoginRequest;
import com.voterconnect.payload.request.SignupRequest;
import com.voterconnect.payload.request.VerifyOtpRequest;
import com.voterconnect.payload.response.JwtResponse;
import com.voterconnect.payload.response.MessageResponse;
import com.voterconnect.repository.UserRepository;
import com.voterconnect.security.JwtUtils;
import com.voterconnect.security.services.OtpService;
import com.voterconnect.security.services.UserDetailsImpl;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/auth")
public class AuthController {
    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    PasswordEncoder passwordEncoder;

    @Autowired
    JwtUtils jwtUtils;

    @Autowired
    OtpService otpService;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        // Authenticate username/password
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        User user = userRepository.findById(userDetails.getId()).orElseThrow();

        if (!user.isVerified()) {
            // Generate OTP if not verified (or could be part of 2FA)
            String otp = otpService.generateOtp(user.getEmail());
            // In a real app, send Email. Here we return it or just "OTP Sent"
            System.out.println("OTP for " + user.getEmail() + " : " + otp);
            return ResponseEntity.ok(new MessageResponse("Account not verified. OTP sent to email."));
        }

        // Proceed to generate OTP for 2FA Login
        String otp = otpService.generateOtp(user.getEmail());
        System.out.println("Login OTP for " + user.getEmail() + " : " + otp);

        return ResponseEntity.ok(new MessageResponse("OTP Sent for verification"));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtpAndLogin(@Valid @RequestBody VerifyOtpRequest verifyOtpRequest) {
        if (!otpService.validateOtp(verifyOtpRequest.getEmail(), verifyOtpRequest.getOtp())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Invalid or Expired OTP"));
        }

        User user = userRepository.findByEmail(verifyOtpRequest.getEmail())
                .orElseThrow(() -> new RuntimeException("Error: User not found."));

        // Verify user if not verified
        if (!user.isVerified()) {
            user.setVerified(true);
            userRepository.save(user);
        }

        // Generate JWT
        // We need Authentication object. We can recreate it since we trust OTP implies
        // identity if we trust the previous step or if OTP is strong enough.
        // Ideally we shouldn't store password in memory or re-authenticate with
        // password here.
        // But since we don't have password here, we can force create an Authentication
        // token for the user.

        UserDetailsImpl userDetails = UserDetailsImpl.build(user);
        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(userDetails, null,
                userDetails.getAuthorities());

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        List<String> roles = userDetails.getAuthorities().stream()
                .map(item -> item.getAuthority())
                .collect(Collectors.toList());

        return ResponseEntity.ok(new JwtResponse(jwt,
                userDetails.getId(),
                userDetails.getUsername(),
                userDetails.getEmail(),
                roles));
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Email is already in use!"));
        }

        // Create new user's account
        User user = User.builder()
                .name(signUpRequest.getName())
                .email(signUpRequest.getEmail())
                .password(passwordEncoder.encode(signUpRequest.getPassword()))
                .role(Role.VOTER) // Default role
                .isVerified(false)
                .build();

        if (signUpRequest.getRole() != null && signUpRequest.getRole().equalsIgnoreCase("admin")) {
            user.setRole(Role.ADMIN);
        }

        userRepository.save(user);

        // Generate OTP
        String otp = otpService.generateOtp(user.getEmail());
        System.out.println("Signup OTP for " + user.getEmail() + " : " + otp);

        return ResponseEntity.ok(new MessageResponse("User registered successfully! OTP sent for verification."));
    }
}
