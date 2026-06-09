package com.sunbeam.crm.service.impl;
import com.sunbeam.crm.entity.LeadStatus;
import com.sunbeam.crm.repository.LeadsRepository;
import com.sunbeam.crm.service.LeadsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class LeadsServiceImpl implements LeadsService {

    private final LeadsRepository leadsRepository;



    @Override
    public long getLeadsCount() {
        return leadsRepository.count();
    }

    @Override
    public long getLeadsCountWithStatusClosed() {
        return leadsRepository.countByStatus(LeadStatus.CLOSED);
    }
}