package com.example.order_service.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {
    // 1. Khai báo Queue Order (luồng gửi)
    @Bean
    public Queue orderQueue(@Value("${rabbitmq.queue.order-created}") String orderQueueName) {
        return new Queue(orderQueueName, true);
    }

    // 2. Khai báo Exchange Order (luồng gửi)
    @Bean
    public TopicExchange orderExchange(@Value("${rabbitmq.exchange.order}") String orderExchangeName) {
        return new TopicExchange(orderExchangeName);
    }

    // 3. Gắn queue vào exchange với routing key (luồng gửi)
    @Bean
    public Binding orderBinding(Queue orderQueue, TopicExchange orderExchange, @Value("${rabbitmq.routing-key.order-created}") String orderCreatedRoutingKey) {
        return BindingBuilder.bind(orderQueue).to(orderExchange).with(orderCreatedRoutingKey);
    }

    // 4. Khai báo Queue Payment (luồng nhận)
    @Bean
    public Queue paymentQueue(@Value("${rabbitmq.queue.payment-processed}") String paymentQueueName) {
        return new Queue(paymentQueueName, true);
    }

    // 5. Khai báo Exchange Payment (luồng nhận)
    @Bean
    public TopicExchange paymentExchange( @Value("${rabbitmq.exchange.payment}") String paymentExchangeName) {
        return new TopicExchange(paymentExchangeName);
    }

    // 6. Gắn queue vào exchange với routing key (luồng nhận)
    @Bean
    public Binding paymentBinding(Queue paymentQueue, TopicExchange paymentExchange, @Value("${rabbitmq.routing-key.payment-processed}") String paymentRoutingKey) {
        return BindingBuilder.bind(paymentQueue).to(paymentExchange).with(paymentRoutingKey);
    }
}
