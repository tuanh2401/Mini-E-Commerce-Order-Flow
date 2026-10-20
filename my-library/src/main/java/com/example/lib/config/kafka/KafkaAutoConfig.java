package com.example.lib.config.kafka;

import org.springframework.beans.factory.annotation.Value;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.apache.kafka.common.serialization.StringSerializer;
import org.springframework.boot.autoconfigure.condition.ConditionalOnClass;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.annotation.EnableKafka;
import org.springframework.kafka.config.ConcurrentKafkaListenerContainerFactory;
import org.springframework.kafka.core.*;
import org.springframework.kafka.support.serializer.JsonDeserializer;
import org.springframework.kafka.support.serializer.JsonSerializer;

import java.util.ConcurrentModificationException;
import java.util.HashMap;
import java.util.Map;

@Configuration
@EnableKafka
@ConditionalOnClass(KafkaTemplate.class)
public class KafkaAutoConfig {
    //Đọc địa chỉ kafka broker từ file application.yaml của từng service
    @Value("${spring.kafka.bootstrap-servers:localhost:9092}")
    private String bootstrapServers;
    //1.Cấu hình Producer(Bên bắn tin nhắn)
    @Bean
    public ProducerFactory<String , Object> producerFactory(){
        Map<String,Object> configProps = new HashMap<>();
        configProps.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG,bootstrapServers);
        //Key là chuỗi String ( vd : id đơn hàng , id payment)
        configProps.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
        //Value là object bất kì -> tự động chuyển thành json
        configProps.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, JsonSerializer.class);
        return new DefaultKafkaProducerFactory<>(configProps);
    }
    //Bean này team vào service để gọi : kafkaTemplate.send("topic-name",eventDto);
    @Bean
    public KafkaTemplate<String, Object> kafkaTemplate(){
        return new KafkaTemplate<>(producerFactory());
    }
    //2.Cấu hình Consumer
    @Bean
    public ConsumerFactory<String, Object> consumerFactory() {
        Map<String,Object> configProps = new HashMap<>();
        configProps.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG,bootstrapServers);
        //Key đọc ra dạng String
        configProps.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
        // Thêm dòng này để Consumer biết cách giải mã Value JSON:
        configProps.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, JsonDeserializer.class);
        //Cho phép deserializer các class trong package
        configProps.put(JsonDeserializer.TRUSTED_PACKAGES,"*");
        return new DefaultKafkaConsumerFactory<>(configProps);
    }
    //Factory hỗ trợ annotation @KafkaListener hoạt động
    @Bean
    public ConcurrentKafkaListenerContainerFactory<String,Object> kafkaListenerContainerFactory(){
        ConcurrentKafkaListenerContainerFactory<String,Object> factory = new ConcurrentKafkaListenerContainerFactory<>();
        factory.setConsumerFactory(consumerFactory());
        return factory;
    }
}
