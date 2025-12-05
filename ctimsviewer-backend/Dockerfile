FROM maven:3.8.6-jdk-11 as maven_builder

WORKDIR /backend
COPY . /backend
RUN mvn clean package

FROM eclipse-temurin:11-jre

# install python for scripts
RUN apt-get update && apt-get install -y \
    python3 python3-pip curl  python3-full python3-venv

RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
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
