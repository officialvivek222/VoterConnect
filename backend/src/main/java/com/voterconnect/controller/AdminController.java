package com.voterconnect.controller;

import com.voterconnect.model.Candidate;
import com.voterconnect.model.Election;
import com.voterconnect.payload.request.CandidateRequest;
import com.voterconnect.payload.request.ElectionRequest;
import com.voterconnect.payload.response.MessageResponse;
import com.voterconnect.service.ElectionService;
import com.voterconnect.service.VoteService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/admin")
@PreAuthorize("hasAuthority('ADMIN')")
public class AdminController {

    @Autowired
    ElectionService electionService;

    @Autowired
    VoteService voteService;

    @PostMapping("/elections")
    public ResponseEntity<?> createElection(@Valid @RequestBody ElectionRequest electionRequest) {
        Election election = electionService.createElection(electionRequest);
        return ResponseEntity.ok(election);
    }

    @GetMapping("/elections")
    public List<Election> getAllElections() {
        return electionService.getAllElections();
    }

    @PutMapping("/elections/{id}/publish")
    public ResponseEntity<?> publishElection(@PathVariable Long id) {
        electionService.publishElection(id);
        return ResponseEntity.ok(new MessageResponse("Election published successfully!"));
    }

    @PostMapping("/elections/{id}/candidates")
    public ResponseEntity<?> addCandidate(@PathVariable Long id,
            @Valid @RequestBody CandidateRequest candidateRequest) {
        candidateRequest.setElectionId(id); // Ensure ID matches path
        Candidate candidate = electionService.addCandidate(candidateRequest);
        return ResponseEntity.ok(candidate);
    }

    @GetMapping("/results/{electionId}")
    public ResponseEntity<?> getResults(@PathVariable Long electionId) {
        Map<String, Long> results = voteService.getElectionResults(electionId);
        return ResponseEntity.ok(results);
    }
}
