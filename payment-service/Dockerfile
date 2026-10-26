FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
ENV TZ="Asia/Ho_Chi_Minh"
COPY target/*.jar app.jar
EXPOSE 8085
ENTRYPOINT ["java", "-jar", "app.jar"]
