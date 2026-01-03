package com.voterconnect.controller;

import com.voterconnect.model.Election;
import com.voterconnect.model.Vote;
import com.voterconnect.payload.request.VoteRequest;
import com.voterconnect.security.services.UserDetailsImpl;
import com.voterconnect.service.ElectionService;
import com.voterconnect.service.VoteService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/voter")
@PreAuthorize("hasAuthority('VOTER') or hasAuthority('ADMIN')")
public class VoterController {

    @Autowired
    ElectionService electionService;

    @Autowired
    VoteService voteService;

    @GetMapping("/elections")
    public List<Election> getPublishedElections() {
        return electionService.getPublishedElections();
    }

    @PostMapping("/vote")
    public ResponseEntity<?> castVote(@Valid @RequestBody VoteRequest voteRequest,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        Vote vote = voteService.castVote(voteRequest, userDetails.getId());
        return ResponseEntity.ok("Vote cast successfully!");
    }
}
