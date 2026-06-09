package com.sunbeam.crm.service;

import com.sunbeam.crm.dto.InteractionRequestDto;
import com.sunbeam.crm.dto.InteractionResponseDto;
import java.util.List;

public interface InteractionService {
    InteractionResponseDto createInteraction(InteractionRequestDto dto);
    List<InteractionResponseDto> getCustomerInteractions(Integer customerId);
}
