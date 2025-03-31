FROM arm64v8/maven:3.6.1-jdk-8 as maven_builder

WORKDIR /backend
COPY . /backend
RUN mvn clean package

FROM openjdk:11-jre-slim

# install python for scripts
RUN apt-get update && apt-get install -y python3 python3-requests python3-pip
RUN pip3 install PyYAML importer jinja2
RUN update-alternatives --install /usr/bin/python python /usr/bin/python3 1
RUN pip3 install numpy
RUN pip3 install pandas
RUN pip3 install chardet
RUN pip3 install -U kaleido
RUN pip3 install plotly
RUN pip3 install matplotlib
RUN pip3 install seaborn

# Set the working directory to /app
WORKDIR /app

# Copy the application JAR file to the container
COPY --from=maven_builder /backend/target/*.jar /app/ctimsviewer.jar

# Expose the port that the application will be listening on
EXPOSE 8080

# Run the JAR file when the container starts
CMD ["java", "-jar", "ctimsviewer.jar"]
