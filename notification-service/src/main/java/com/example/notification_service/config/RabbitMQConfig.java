package com.example.notification_service.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.config.SimpleRabbitListenerContainerFactory;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {
    // Khởi tạo direct exchange
    @Bean
    public DirectExchange directExchange(@Value("${rabbitmq.exchange.email}") String emailExchange){
        return new DirectExchange(emailExchange);
    }

    // Khởi tạo queue
    @Bean
    public Queue emailQueue(@Value("${rabbitmq.queue.email-verification}") String emailQueue){
        return QueueBuilder.durable(emailQueue).build();
    }

    // Liên kết (Binding) Queue với Exchange thông qua routing key
    @Bean
    public Binding emailBinding(Queue emailQueue, DirectExchange directExchange , @Value("${rabbitmq.routing-key.email-verification}") String emailRoutingKey){
        return BindingBuilder.bind(emailQueue).to(directExchange).with(emailRoutingKey);
    }

    // Thay Jackson2JsonMessageConverter thành MessageConverter để inject chính xác bean dùng chung từ base library
    @Bean
    public SimpleRabbitListenerContainerFactory rabbitListenerContainerFactory(
            ConnectionFactory connectionFactory, 
            MessageConverter messageConverter) {
        SimpleRabbitListenerContainerFactory factory = new SimpleRabbitListenerContainerFactory();
        factory.setConnectionFactory(connectionFactory);
        factory.setMessageConverter(messageConverter);
        return factory;
    }
}
