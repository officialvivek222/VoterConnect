package com.voterconnect.payload.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CandidateRequest {
    @NotBlank
    private String name;

    private String party;

    private Long electionId;
}
