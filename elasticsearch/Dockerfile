FROM elasticsearch:8.17.0

RUN bin/elasticsearch-plugin install analysis-icu --batch

ARG IK_VERSION=8.17.0
ARG IK_REPO=https://github.com/infinilabs/analysis-ik/releases/download/v${IK_VERSION}/elasticsearch-analysis-ik-${IK_VERSION}.zip

RUN bin/elasticsearch-plugin install --batch ${IK_REPO} || true
