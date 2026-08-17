package com.example.user_service.service;

import com.example.user_service.dto.response.TopSpenderResponse;
import com.example.user_service.dto.response.UserAnalyticsResponse;

import java.util.List;

public interface UserAnalyticsService {
    UserAnalyticsResponse getUserSummary();
    List<TopSpenderResponse> getTopSpender(int limit);
}
