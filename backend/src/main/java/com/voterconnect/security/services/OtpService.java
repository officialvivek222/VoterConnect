package com.voterconnect.security.services;

import com.voterconnect.model.Otp;
import com.voterconnect.repository.OtpRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

@Service
public class OtpService {

    @Autowired
    OtpRepository otpRepository;

    @Transactional
    public String generateOtp(String email) {
        String otpCode = String.valueOf(new Random().nextInt(900000) + 100000); // 6 digit OTP

        // Remove existing OTP if any
        otpRepository.deleteByEmail(email);

        Otp otp = Otp.builder()
                .email(email)
                .otpCode(otpCode)
                .expiryTime(LocalDateTime.now().plusMinutes(5))
                .build();

        otpRepository.save(otp);
        return otpCode;
    }

    public boolean validateOtp(String email, String otpCode) {
        Optional<Otp> otpOptional = otpRepository.findByEmail(email);
        if (otpOptional.isPresent()) {
            Otp otp = otpOptional.get();
            if (otp.getOtpCode().equals(otpCode) && otp.getExpiryTime().isAfter(LocalDateTime.now())) {
                return true;
            }
        }
        return false;
    }
}
