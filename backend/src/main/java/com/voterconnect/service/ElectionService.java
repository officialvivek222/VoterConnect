package com.voterconnect.service;

import com.voterconnect.model.Candidate;
import com.voterconnect.model.Election;
import com.voterconnect.payload.request.CandidateRequest;
import com.voterconnect.payload.request.ElectionRequest;
import com.voterconnect.repository.CandidateRepository;
import com.voterconnect.repository.ElectionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ElectionService {

    @Autowired
    ElectionRepository electionRepository;

    @Autowired
    CandidateRepository candidateRepository;

    public Election createElection(ElectionRequest request) {
        Election election = Election.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .isPublished(false)
                .build();
        return electionRepository.save(election);
    }

    public List<Election> getAllElections() {
        return electionRepository.findAll();
    }

    public List<Election> getPublishedElections() {
        return electionRepository.findByIsPublishedTrue();
    }

    public Election getElectionById(Long id) {
        return electionRepository.findById(id).orElseThrow(() -> new RuntimeException("Election not found"));
    }

    public Election publishElection(Long id) {
        Election election = getElectionById(id);
        election.setPublished(true);
        return electionRepository.save(election);
    }

    public Candidate addCandidate(CandidateRequest request) {
        Election election = getElectionById(request.getElectionId());
        Candidate candidate = Candidate.builder()
                .name(request.getName())
                .party(request.getParty())
                .election(election)
                .build();
        return candidateRepository.save(candidate);
    }
}
