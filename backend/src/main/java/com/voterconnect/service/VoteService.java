package com.voterconnect.service;

import com.voterconnect.model.Candidate;
import com.voterconnect.model.Election;
import com.voterconnect.model.User;
import com.voterconnect.model.Vote;
import com.voterconnect.payload.request.VoteRequest;
import com.voterconnect.repository.CandidateRepository;
import com.voterconnect.repository.ElectionRepository;
import com.voterconnect.repository.UserRepository;
import com.voterconnect.repository.VoteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class VoteService {

    @Autowired
    VoteRepository voteRepository;

    @Autowired
    UserRepository userRepository;

    @Autowired
    ElectionRepository electionRepository;

    @Autowired
    CandidateRepository candidateRepository;

    @Transactional
    public Vote castVote(VoteRequest request, Long userId) {
        // Validation
        Election election = electionRepository.findById(request.getElectionId())
                .orElseThrow(() -> new RuntimeException("Election not found"));

        if (!election.isPublished()) {
            throw new RuntimeException("Election is not active");
        }

        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(election.getStartDate()) || now.isAfter(election.getEndDate())) {
            throw new RuntimeException("Election is not currently open for voting");
        }

        if (voteRepository.existsByUserIdAndElectionId(userId, request.getElectionId())) {
            throw new RuntimeException("You have already voted in this election");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.isVerified()) {
            throw new RuntimeException("User must be verified to vote");
        }

        Candidate candidate = candidateRepository.findById(request.getCandidateId())
                .orElseThrow(() -> new RuntimeException("Candidate not found"));

        if (!candidate.getElection().getId().equals(election.getId())) {
            throw new RuntimeException("Candidate does not belong to this election");
        }

        Vote vote = Vote.builder()
                .user(user)
                .election(election)
                .candidate(candidate)
                .timestamp(LocalDateTime.now())
                .build();

        return voteRepository.save(vote);
    }

    public Map<String, Long> getElectionResults(Long electionId) {
        Election election = electionRepository.findById(electionId)
                .orElseThrow(() -> new RuntimeException("Election not found"));

        // Only show results if election ended? Or real-time? Requirement says "Monitor
        // in real-time" for Admin.
        // Voter: "Read-only results after election completion"

        List<Candidate> candidates = election.getCandidates();
        Map<String, Long> results = new HashMap<>();

        for (Candidate candidate : candidates) {
            long count = voteRepository.countByElectionIdAndCandidateId(electionId, candidate.getId());
            results.put(candidate.getName(), count);
        }
        return results;
    }
}
