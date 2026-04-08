package com.example.lib.dto;

public class PaymentProcessedEvent {
    private String orderId;
    private String status; //success hoac failed
    private String transactionId;
    // Constructor mặc định (bắt buộc cho Jackson deserialize)
    public PaymentProcessedEvent() {}

    public PaymentProcessedEvent(String orderId, String status, String transactionId) {
        this.orderId = orderId;
        this.status = status;
        this.transactionId = transactionId;
    }

    //Getter setter
    public String getOrderId() {
        return orderId;
    }
    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }
    public String getStatus() {
        return status;
    }
    public void setStatus(String status) {
        this.status = status;
    }
    public String getTransactionId() {
        return transactionId;
    }
    public void setTransactionId(String transactionId) {
        this.transactionId = transactionId;
    }
}
