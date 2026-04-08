package com.example.payment_service.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.core.Queue;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {
    //P1:Nhận event t order-service
    //Khai báo lại queue "order.created" để payment-service cùng lắng nghe
    @Bean
    public Queue ordersQueue() {
        return new Queue("order.created.payment", true);
    }
    @Bean
    public TopicExchange  orderExchange() {
        return new TopicExchange("order.exchange");
    }
    @Bean
    public Binding orderBinding(Queue ordersQueue, TopicExchange orderExchange) {
        return BindingBuilder.bind(ordersQueue).to(orderExchange).with("order.created");
    }
    //P2:Gửi event kết quả thanh toán
    @Bean
    public Queue paymentQueue() {
        return new Queue("payment.processed", true);
    }
    @Bean
    public TopicExchange paymentExchange() {
        return new TopicExchange("payment.exchange");
    }
    @Bean
    public Binding paymentBinding(Queue paymentQueue, TopicExchange paymentExchange) {
        return BindingBuilder.bind(paymentQueue).to(paymentExchange).with("payment.processed");
    }
    //Json converter
    @Bean
    public Jackson2JsonMessageConverter messageConverter() {
           return new Jackson2JsonMessageConverter();
    }

    // Bean RabbitTemplate để tái sử dụng Jackson2JsonMessageConverter thay vì dùng cái mặc định của Java
    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(messageConverter());
        return template;
    }
}
