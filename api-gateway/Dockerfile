FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

ENV TZ="Asia/Ho_Chi_Minh"

# Copy file JAR từ thư mục target (đã build ở bước mvn package)
COPY target/*.jar app.jar

EXPOSE 8082

ENTRYPOINT ["java", "-jar", "app.jar"]