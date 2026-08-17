package com.example.product_service.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {
    @Bean
    public Queue orderQueue(@Value("${rabbitmq.queue.order-created}") String orderQueueName) {
        return new Queue(orderQueueName, true);
    }
    @Bean
    public TopicExchange orderExchange(@Value("${rabbitmq.exchange.order}") String orderExchangeName) {
        return new TopicExchange(orderExchangeName);
    }
    @Bean
    public Binding orderBinding(Queue orderQueue, TopicExchange orderExchange, @Value("${rabbitmq.routing-key.order-created}") String orderRoutingKey) {
        return BindingBuilder.bind(orderQueue).to(orderExchange).with(orderRoutingKey);
    }
}
