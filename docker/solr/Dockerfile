FROM solr:10-slim

USER root
RUN curl -Lf https://repo1.maven.org/maven2/org/locationtech/jts/jts-core/1.20.0/jts-core-1.20.0.jar -o /opt/solr/server/solr-webapp/webapp/WEB-INF/lib/jts-core-1.20.0.jar && \
    chown solr:solr /opt/solr/server/solr-webapp/webapp/WEB-INF/lib/jts-core-1.20.0.jar
USER solr
