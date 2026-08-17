package com.example.payment_service.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {
    // --- P1: Nhận event từ order-service ---
    @Bean
    public Queue ordersQueue(@Value("${rabbitmq.queue.order-created}") String orderQueueName) {
        return new Queue(orderQueueName, true);
    }

    @Bean
    public TopicExchange orderExchange(@Value("${rabbitmq.exchange.order}") String orderExchangeName) {
        return new TopicExchange(orderExchangeName);
    }

    @Bean
    public Binding orderBinding(Queue ordersQueue, TopicExchange orderExchange,@Value("${rabbitmq.routing-key.order-created}") String orderRoutingKey) {
        return BindingBuilder.bind(ordersQueue).to(orderExchange).with(orderRoutingKey);
    }

    // --- P2: Gửi event kết quả thanh toán ---
    @Bean
    public Queue paymentQueue(@Value("${rabbitmq.queue.payment-processed}") String paymentQueueName) {
        return new Queue(paymentQueueName, true);
    }

    @Bean
    public TopicExchange paymentExchange( @Value("${rabbitmq.exchange.payment}") String paymentExchangeName) {
        return new TopicExchange(paymentExchangeName);
    }

    @Bean
    public Binding paymentBinding(Queue paymentQueue, TopicExchange paymentExchange , @Value("${rabbitmq.routing-key.payment-processed}") String paymentRoutingKey) {
        return BindingBuilder.bind(paymentQueue).to(paymentExchange).with(paymentRoutingKey);
    }
}
