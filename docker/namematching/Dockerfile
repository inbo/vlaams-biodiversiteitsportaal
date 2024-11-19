ARG BUILDPLATFORM=linux/amd64
FROM --platform=${BUILDPLATFORM} maven:3.8-openjdk-8 AS builder

RUN git clone --depth 1 https://github.com/AtlasOfLivingAustralia/ala-namematching-service.git /project
WORKDIR /project

RUN --mount=type=cache,target=/root/.m2/repository \
    mvn clean package -DskipTests -T 4 -U

FROM openjdk:11

ARG VERSION=1.8.1

# Create the user
RUN groupadd --gid 1000 app \
    && useradd --uid 1000 --gid 1000 -m -d /app app

RUN mkdir /data && mkdir /data/lucene && chown -R app:app /data

USER app
WORKDIR /data/lucene

# the s3 URL is temporary
RUN curl "https://biodiversiteitsportaal-dev-backups.s3.eu-west-1.amazonaws.com/namematching-gbif-backbone-lucene-8-2024-09-11.tgz?response-content-disposition=inline&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEDUaCWV1LXdlc3QtMSJGMEQCIBUclRet6p8W7bbZ1i4OeG0PC9OCmAySOUyDLu0EGllVAiBEJKptlL37gkYN0FmLzrcoFc7vdVpd4wEhc9d%2BKKRL3yrQAwi%2B%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F8BEAAaDDYzMjY4MzIwMjA0NCIMC0WnBO8QgvWn6tqHKqQD3fBhbXpdjHIVUUINQwq%2BJK9gQdJOnh5UVlYaL62ijPXgcEMqt2ZDdwgUYj%2B%2BL%2F94LLe2q%2B9zLG8uKIPMZdXuKfcER2nlRa9%2BqqDCS0Dc%2F%2FpqPJ7oigyhYSyNCi6kurfkZBjkNAvCa6%2F73uOBhzXx1z7WTtKc5EV7IkPFs7%2Fu8APPR7HKkXt9ab8EGeii9cMEd6YevQADyJWSPsgL6OO%2BM5O6izVDrg%2FkuarooQwW%2BGL8AGOyXYQhK%2BnlyIC4hDhTDe0drVDrBv8ipAYXGJLwgvomT65DgtWbR1EwFyVEB1gz6QuVd%2BWK7GwFTOAEK3UD1RB5uPUj%2FcsC9qttGIXshqXqypJO9ueY6AzylapV1eTI1%2FzYEpe4FhzQIUU%2Fc5AkfPIEX%2B0aID7CTiDo6FibKxqIHeiWOf0CqqR9KCRmhVpIwfjNXu7N%2BY6N8q6ip9xEmSP3x2hyJjKCj%2FOpjrJGMx4TVyWlvXk8wEFuh9MQ2EUk5Ce2ITHW%2F4hEK2eoiZ%2FIzeZlZvZCPWSIw%2BQ5q9s2IlrVuW8yFO0eH%2B4AyTzJAAAn68JCMOqYzbkGOrgC4IXM8%2F1igoMt7cUCtMEZwMrmDM%2FZcVsoOZdsSuM950i2xuo7GOXtcspOdExHWVYhiISpMae6KNe54FD%2F8AzpcMKve9gyJD9bU8QNLtw9Wb3B3hw8neoLO05QB%2FVJsnJ8Mz7uzHBg%2BqqMVc%2FYbXWz6vupXv93vTL3V2jYFxTAj7lzFARqWZhybD9h470ZDcNcFzqeINCEm52jrQldgFTFig2z0n%2F%2FIxKnSqx%2F4ESjW2WhJz%2BPGn1gWQ%2BObuOdQsx1DdydnBdy3PM6rrwpCZQ%2B9rgjq%2Be0QDwRfavlvdZcniEgiZ7bsHu2DX5SSaIquvLI6iGZaG8ohgWAabIYT0YJu09eCvBueRzB1%2FZ8mVebfqL62Y47sMFV5ox3N45avQ0O%2BFh3he1x9gpxaq4ofNFr7eZZdhaFFkGc&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=ASIAZGTW3QX6B4WYE6NG%2F20241112%2Feu-west-1%2Fs3%2Faws4_request&X-Amz-Date=20241112T130247Z&X-Amz-Expires=43200&X-Amz-SignedHeaders=host&X-Amz-Signature=772689908ed25e6ac7c5b6166f2db7f495ccd4cd805238541f9bf451345847cf" -o namematching-nm.tgz
RUN tar -xzf namematching-nm.tgz
RUN mv namematching-gbif-backbone-lucene-8-2024-09-11 namematching-nm

WORKDIR /app

COPY --from=builder --chown=app \
    /project/server/target/ala-namematching-server-${VERSION}.jar /app/app.jar

COPY --from=builder --chown=app \
    /project/server/config.yml /app/config.yml

RUN mkdir /data/ala-namematching-service && mkdir /data/ala-namematching-service/config
COPY --from=builder --chown=app \
    /project/server/src/main/resources/groups.json /data/ala-namematching-service/config/groups.json
COPY --from=builder --chown=app \
    /project/server/src/main/resources/subgroups.json /data/ala-namematching-service/config/subgroups.json

ENTRYPOINT ["java", "-jar", "/app/app.jar", "server", "config.yml"]

HEALTHCHECK CMD curl --fail --silent http://localhost:9180 || exit 1