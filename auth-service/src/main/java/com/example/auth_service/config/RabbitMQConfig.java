package com.example.auth_service.config;

import org.springframework.amqp.core.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {
    @Bean
    public DirectExchange directExchange(@Value("${rabbitmq.exchange.email}") String emailExchange) {
        return new DirectExchange(emailExchange);
    }

    @Bean
    public Queue emailQueue(@Value("${rabbitmq.queue.email-verification}") String emailQueue) {
        return QueueBuilder.durable(emailQueue).build();
    }

    @Bean
    public Binding emailBinding(Queue emailQueue, DirectExchange directExchange, @Value("${rabbitmq.routing-key.email-verification}") String emailRoutingKey) {
        return BindingBuilder.bind(emailQueue).to(directExchange).with(emailRoutingKey);
    }
}
