package com.example.user_service.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {
    //Khai báo queue hứng sự kiện thanh toán để cộng điểm hội viên
    @Bean
    public Queue membershipQueue(@Value("${rabbitmq.queue.order-paid}") String queueName) {
        return new Queue(queueName, true);
    }
    //Khai báo Topic Exchange kết nối đến trạm phát của Order
    @Bean
    public TopicExchange orderExchange(@Value("${rabbitmq.exchange.order}") String exchangeName) {
        return new TopicExchange(exchangeName);
    }
    //Tạo lk Binding : Hướng luồng tin từ exchange của Order có nhãn dán "order.paid" đi vào queue của user
    @Bean
    public Binding membershipBinding(Queue membershipQueue, TopicExchange orderExchange, @Value("${rabbitmq.routing-key.order-paid}") String routingKey) {
        return BindingBuilder.bind(membershipQueue).to(orderExchange).with(routingKey);
    }
}
