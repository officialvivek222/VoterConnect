package com.voterconnect.payload.request;

import lombok.Data;

@Data
public class VoteRequest {
    private Long electionId;
    private Long candidateId;
}
