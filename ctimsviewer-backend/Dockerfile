FROM maven:3.8.6-jdk-11 as maven_builder

WORKDIR /backend
COPY . /backend
RUN mvn clean package

FROM openjdk:11-jre-slim

# install python for scripts
RUN apt-get update && apt-get install -y \
    python3 python3-pip curl \
    libglib2.0-0 \
    libnspr4 \
    libnss3 \
    libdbus-1-3 \
    libatk1.0-0 \
    libatspi2.0-0 \
    libxcomposite1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libxkbcommon0 \
    libasound2

RUN pip3 install PyYAML importer jinja2 "pymongo==3.12.3" numpy pandas chardet kaleido plotly matplotlib seaborn requests httpx urllib3 certifi playwright
RUN playwright install
RUN update-alternatives --install /usr/bin/python python /usr/bin/python3 1


# Set the working directory to /app
WORKDIR /app

# Copy the application JAR file to the container
COPY --from=maven_builder /backend/target/*.jar /app/ctimsviewer.jar

# Expose the port that the application will be listening on
EXPOSE 8080

# Run the JAR file when the container starts
CMD ["java", "-jar", "ctimsviewer.jar"]
